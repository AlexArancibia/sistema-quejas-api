import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderFinancialStatus, OrderFulfillmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  private async updateInventory(
    prisma: Prisma.TransactionClient,
    orderId: string,
    shouldDecrement: boolean
  ) {
    // Get order items with their variants and products
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        variant: {
          include: {
            product: true // Incluimos la relación con el producto
          }
        },
      },
    });

    // Update inventory for each variant
    for (const item of orderItems) {
      if (item.variant) {
        const updatedVariant = await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            inventoryQuantity: {
              [shouldDecrement ? 'decrement' : 'increment']: item.quantity,
            },
          },
          include: {
            product: true // Incluimos la relación con el producto aquí también
          }
        });

        // Verificar si el inventario llegó a números negativos
        if (updatedVariant.inventoryQuantity < 0 && !updatedVariant.product.allowBackorder) {
          throw new ConflictException(`Insufficient inventory for variant ${item.variantId}`);
        }
      }
    }
  }

  async create(createOrderDto: CreateOrderDto) {
    console.log("create method called with dto:", createOrderDto);
    const { lineItems, ...orderData } = createOrderDto;

    return this.prisma.$transaction(async (prisma) => {
      // Check if the currency exists
      const currency = await prisma.currency.findUnique({
        where: { id: orderData.currencyId },
      });

      if (!currency) {
        throw new BadRequestException(`Currency with ID ${orderData.currencyId} not found`);
      }

      // Create the order
      const order = await prisma.order.create({
        data: {
          totalPrice: orderData.totalPrice,
          subtotalPrice: orderData.subtotalPrice,
          totalTax: orderData.totalTax,
          totalDiscounts: orderData.totalDiscounts,
          financialStatus: orderData.financialStatus,
          fulfillmentStatus: orderData.fulfillmentStatus,
          shippingStatus: orderData.shippingStatus,
          customerNotes: orderData.customerNotes,
          internalNotes: orderData.internalNotes,
          source: orderData.source,
          preferredDeliveryDate: orderData.preferredDeliveryDate,
          orderNumber: await this.generateOrderNumber(prisma),
          customer: { connect: { id: orderData.customerId } },
          currency: { connect: { id: orderData.currencyId } },
          shippingAddress: { connect: { id: orderData.shippingAddressId } },
          billingAddress: { connect: { id: orderData.billingAddressId } },
          coupon: orderData.couponId ? { connect: { id: orderData.couponId } } : undefined,
          paymentProvider: orderData.paymentProviderId ? { connect: { id: orderData.paymentProviderId } } : undefined,
          shippingMethod: orderData.shippingMethodId ? { connect: { id: orderData.shippingMethodId } } : undefined,
        },
      });

      console.log('Order created:', order);

      // Create order items and check inventory
      if (lineItems && lineItems.length > 0) {
        // Verificar el inventario antes de crear los items
        for (const item of lineItems) {
          if (item.variantId) {
            const variant = await prisma.productVariant.findUnique({
              where: { id: item.variantId },
              include: { product: true }
            });

            if (!variant) {
              throw new NotFoundException(`Variant with ID ${item.variantId} not found`);
            }

            // Solo verificar si no se permite backorder
            if (!variant.product.allowBackorder && variant.inventoryQuantity < item.quantity) {
              throw new ConflictException(
                `Insufficient inventory for variant ${item.variantId}. Available: ${variant.inventoryQuantity}, Requested: ${item.quantity}`
              );
            }
          }
        }

        const createdItems = await prisma.orderItem.createMany({
          data: lineItems.map((item) => ({
            ...item,
            orderId: order.id,
          })),
        });

        console.log('Order items created:', createdItems);

        // Si el estado financiero es PAID, actualizar el inventario
        if (orderData.financialStatus === 'PAID') {
          await this.updateInventory(prisma, order.id, true);
        }
      }

      // Fetch the created order within the same transaction
      const fetchedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          customer: true,
          lineItems: {
            include: {
              variant: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
          coupon: true,
          paymentProvider: true,
          shippingMethod: true,
          refunds: true,
          currency: true,
        },
      });

      console.log('Fetched order within transaction:', fetchedOrder);

      if (!fetchedOrder) {
        throw new Error(`Failed to fetch the created order with ID ${order.id}`);
      }

      return fetchedOrder;
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    console.log("update method called with id:", id, "and dto:", updateOrderDto);
    const { lineItems, ...orderData } = updateOrderDto;

    return this.prisma.$transaction(async (prisma) => {
      // Get the current order to check the previous status
      const currentOrder = await prisma.order.findUnique({
        where: { id },
        select: { 
          financialStatus: true,
          lineItems: {
            include: {
              variant: true
            }
          }
        },
      });

      if (!currentOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Prepare the update data
      const updateData: Prisma.OrderUpdateInput = {
        totalPrice: orderData.totalPrice,
        subtotalPrice: orderData.subtotalPrice,
        totalTax: orderData.totalTax,
        totalDiscounts: orderData.totalDiscounts,
        financialStatus: orderData.financialStatus,
        fulfillmentStatus: orderData.fulfillmentStatus,
        shippingStatus: orderData.shippingStatus,
        customerNotes: orderData.customerNotes,
        internalNotes: orderData.internalNotes,
        source: orderData.source,
        preferredDeliveryDate: orderData.preferredDeliveryDate,
      };

      // Add relational updates only if the corresponding IDs are provided
      if (orderData.customerId) {
        updateData.customer = { connect: { id: orderData.customerId } };
      }
      if (orderData.currencyId) {
        updateData.currency = { connect: { id: orderData.currencyId } };
      }
      if (orderData.shippingAddressId) {
        updateData.shippingAddress = { connect: { id: orderData.shippingAddressId } };
      }
      if (orderData.billingAddressId) {
        updateData.billingAddress = { connect: { id: orderData.billingAddressId } };
      }
      if (orderData.couponId) {
        updateData.coupon = { connect: { id: orderData.couponId } };
      }
      if (orderData.paymentProviderId) {
        updateData.paymentProvider = { connect: { id: orderData.paymentProviderId } };
      }
      if (orderData.shippingMethodId) {
        updateData.shippingMethod = { connect: { id: orderData.shippingMethodId } };
      }

      // Handle inventory updates based on financial status changes
      if (orderData.financialStatus && orderData.financialStatus !== currentOrder.financialStatus) {
        // Decrease inventory when order becomes PAID
        if (orderData.financialStatus === 'PAID') {
          await this.updateInventory(prisma, id, true);
        }
        // Increase inventory when order becomes REFUNDED or VOIDED
        else if (
          orderData.financialStatus === 'REFUNDED' ||
          orderData.financialStatus === 'VOIDED'
        ) {
          await this.updateInventory(prisma, id, false);
        }
      }

      // Update the order
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: updateData,
      });

      // Update order items if provided
      if (lineItems) {
        // Si hay nuevos items y el estado es PAID, verificar inventario
        if (orderData.financialStatus === 'PAID') {
          for (const item of lineItems) {
            if (item.variantId) {
              const variant = await prisma.productVariant.findUnique({
                where: { id: item.variantId },
                include: { product: true }
              });

              if (!variant) {
                throw new NotFoundException(`Variant with ID ${item.variantId} not found`);
              }

              if (!variant.product.allowBackorder && variant.inventoryQuantity < item.quantity) {
                throw new ConflictException(
                  `Insufficient inventory for variant ${item.variantId}. Available: ${variant.inventoryQuantity}, Requested: ${item.quantity}`
                );
              }
            }
          }
        }

        // Delete existing order items
        await prisma.orderItem.deleteMany({
          where: { orderId: id },
        });

        // Create new order items
        await prisma.orderItem.createMany({
          data: lineItems.map((item) => ({
            ...item,
            orderId: id,
          })),
        });
      }

      console.log("Calling findOne with updated order id:", updatedOrder.id);
      return updatedOrder;
    });
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (prisma) => {
      // Get the order to check its status
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          lineItems: {
            include: {
              variant: true
            }
          }
        }
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // If the order was PAID, restore inventory
      if (order.financialStatus === 'PAID') {
        await this.updateInventory(prisma, id, false);
      }

      // Delete associated order items
      await prisma.orderItem.deleteMany({
        where: { orderId: id },
      });

      // Delete the order
      const deletedOrder = await prisma.order.delete({
        where: { id },
      });

      return { message: `Order with ID ${id} has been successfully deleted` };
    });
  }

  async findOne(id: string) {
    console.log("findOne method called with id:", id);
    console.log("Attempting to find order with id:", id);

    const queryInfo = Prisma.sql`
      SELECT * FROM "Order" WHERE id = ${id};
    `;
    const queryResult = await this.prisma.$queryRaw(queryInfo);
    console.log("Raw query result:", queryResult);

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        lineItems: {
          include: {
            variant: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        coupon: true,
        paymentProvider: true,
        shippingMethod: true,
        refunds: true,
        currency: true,
      },
    });

    console.log("Result of findUnique:", order);
    if (!order) {
      console.log("Order not found, throwing NotFoundException");
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    console.log("Returning found order");
    return order;
  }

  private async generateOrderNumber(prisma: Prisma.TransactionClient): Promise<number> {
    const lastOrder = await prisma.order.findFirst({
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });

    return (lastOrder?.orderNumber || 0) + 1;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    financialStatus?: OrderFinancialStatus;
    fulfillmentStatus?: OrderFulfillmentStatus;
    customerId?: string;
  }) {
    const { skip, take, financialStatus, fulfillmentStatus, customerId } = params;
    const where: Prisma.OrderWhereInput = {};

    if (financialStatus) {
      where.financialStatus = financialStatus;
    }
    if (fulfillmentStatus) {
      where.fulfillmentStatus = fulfillmentStatus;
    }
    if (customerId) {
      where.customerId = customerId;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take,
        where,
        include: {
          customer: true,
          lineItems: {
            include: {
              variant: true,
            },
          },
          shippingAddress: true,
          billingAddress: true,
          coupon: true,
          paymentProvider: true,
          shippingMethod: true,
          currency: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return orders;
  }
}
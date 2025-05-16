import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import { CreateOrderDto } from "./dto/create-order.dto"
import { UpdateOrderDto } from "./dto/update-order.dto"
import { OrderFinancialStatus, OrderFulfillmentStatus, type PaymentStatus, type ShippingStatus } from "@prisma/client"

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  // Create a new order
  async create(createOrderDto: CreateOrderDto) {
    const { lineItems, ...orderData } = createOrderDto

    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: orderData.storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${orderData.storeId} not found`)
    }

    // Check if the currency exists
    const currency = await this.prisma.currency.findUnique({
      where: { id: orderData.currencyId },
    })

    if (!currency) {
      throw new NotFoundException(`Currency with ID ${orderData.currencyId} not found`)
    }

    // Check if the coupon exists if provided
    if (orderData.couponId) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { id: orderData.couponId },
      })

      if (!coupon) {
        throw new NotFoundException(`Coupon with ID ${orderData.couponId} not found`)
      }

      // Increment coupon usage
      await this.prisma.coupon.update({
        where: { id: orderData.couponId },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      })
    }

    // Check if the payment provider exists if provided
    if (orderData.paymentProviderId) {
      const paymentProvider = await this.prisma.paymentProvider.findUnique({
        where: { id: orderData.paymentProviderId },
      })

      if (!paymentProvider) {
        throw new NotFoundException(`Payment provider with ID ${orderData.paymentProviderId} not found`)
      }
    }

    // Check if the shipping method exists if provided
    if (orderData.shippingMethodId) {
      const shippingMethod = await this.prisma.shippingMethod.findUnique({
        where: { id: orderData.shippingMethodId },
      })

      if (!shippingMethod) {
        throw new NotFoundException(`Shipping method with ID ${orderData.shippingMethodId} not found`)
      }
    }

    // Check if order number already exists for this store
    const existingOrder = await this.prisma.order.findUnique({
      where: {
        storeId_orderNumber: {
          storeId: orderData.storeId,
          orderNumber: orderData.orderNumber,
        },
      },
    })

    if (existingOrder) {
      throw new ConflictException(`Order number ${orderData.orderNumber} already exists for this store`)
    }

    // Create the order with line items
    return this.prisma.order.create({
      data: {
        ...orderData,
        lineItems: {
          create: lineItems.map((item) => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            totalDiscount: item.totalDiscount || 0,
            ...(item.variantId && {
              variant: {
                connect: { id: item.variantId },
              },
            }),
          })),
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        currency: true,
        coupon: true,
        paymentProvider: true,
        shippingMethod: true,
        lineItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  // Get all orders
  async findAll() {
    return this.prisma.order.findMany({
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        currency: true,
        coupon: true,
        paymentProvider: true,
        shippingMethod: true,
        lineItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get all orders for a specific store
  async findAllByStore(
    storeId: string,
    options?: {
      financialStatus?: OrderFinancialStatus
      fulfillmentStatus?: OrderFulfillmentStatus
      paymentStatus?: PaymentStatus
      shippingStatus?: ShippingStatus
      startDate?: Date
      endDate?: Date
      page?: number
      limit?: number
    },
  ) {
    const where: any = { storeId }

    // Add optional filters
    if (options?.financialStatus) {
      where.financialStatus = options.financialStatus
    }

    if (options?.fulfillmentStatus) {
      where.fulfillmentStatus = options.fulfillmentStatus
    }

    if (options?.paymentStatus) {
      where.paymentStatus = options.paymentStatus
    }

    if (options?.shippingStatus) {
      where.shippingStatus = options.shippingStatus
    }

    if (options?.startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: options.startDate,
      }
    }

    if (options?.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: options.endDate,
      }
    }

    // Set pagination defaults
    const page = options?.page || 1
    const limit = options?.limit || 10
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await this.prisma.order.count({ where })

    // Get orders with pagination
    const orders = await this.prisma.order.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        currency: true,
        coupon: true,
        paymentProvider: true,
        shippingMethod: true,
        lineItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    return {
      data: orders,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }

  // Get an order by ID
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        currency: true,
        coupon: true,
        paymentProvider: true,
        shippingMethod: true,
        lineItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`)
    }

    return order
  }

  // Get an order by order number for a specific store
  async findByOrderNumber(storeId: string, orderNumber: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        storeId_orderNumber: {
          storeId,
          orderNumber,
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        currency: true,
        coupon: true,
        paymentProvider: true,
        shippingMethod: true,
        lineItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found for store with ID ${storeId}`)
    }

    return order
  }

  // Update an order
   async update(id: string, updateOrderDto: any) {
    // Extract nested objects and lineItems from the DTO
    const { customerInfo, shippingAddress, billingAddress, lineItems, ...orderData } = updateOrderDto

    // Check if the order exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: {
        lineItems: true,
      },
    })

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`)
    }

    // Validate relations if they are being updated
    if (orderData.storeId && orderData.storeId !== existingOrder.storeId) {
      const store = await this.prisma.store.findUnique({ where: { id: orderData.storeId } })
      if (!store) throw new NotFoundException(`Store with ID ${orderData.storeId} not found`)
    }

    if (orderData.currencyId && orderData.currencyId !== existingOrder.currencyId) {
      const currency = await this.prisma.currency.findUnique({ where: { id: orderData.currencyId } })
      if (!currency) throw new NotFoundException(`Currency with ID ${orderData.currencyId} not found`)
    }

    if (orderData.couponId && orderData.couponId !== existingOrder.couponId) {
      const coupon = await this.prisma.coupon.findUnique({ where: { id: orderData.couponId } })
      if (!coupon) throw new NotFoundException(`Coupon with ID ${orderData.couponId} not found`)

      // Increment coupon usage
      await this.prisma.coupon.update({
        where: { id: orderData.couponId },
        data: { usedCount: { increment: 1 } },
      })
    }

    if (orderData.paymentProviderId && orderData.paymentProviderId !== existingOrder.paymentProviderId) {
      const paymentProvider = await this.prisma.paymentProvider.findUnique({
        where: { id: orderData.paymentProviderId },
      })
      if (!paymentProvider)
        throw new NotFoundException(`Payment provider with ID ${orderData.paymentProviderId} not found`)
    }

    if (orderData.shippingMethodId && orderData.shippingMethodId !== existingOrder.shippingMethodId) {
      const shippingMethod = await this.prisma.shippingMethod.findUnique({ where: { id: orderData.shippingMethodId } })
      if (!shippingMethod)
        throw new NotFoundException(`Shipping method with ID ${orderData.shippingMethodId} not found`)
    }

    // Check for duplicate order number
    if (orderData.orderNumber && orderData.orderNumber !== existingOrder.orderNumber) {
      const existingOrderNumber = await this.prisma.order.findUnique({
        where: {
          storeId_orderNumber: {
            storeId: existingOrder.storeId,
            orderNumber: orderData.orderNumber,
          },
        },
      })

      if (existingOrderNumber) {
        throw new ConflictException(`Order number ${orderData.orderNumber} already exists for this store`)
      }
    }

    // Prepare update data with proper relations and nested objects
    const updateData: any = { ...orderData }

    // Store JSON objects directly as they are in the schema
    if (customerInfo) {
      updateData.customerInfo = customerInfo
    }

    if (shippingAddress) {
      updateData.shippingAddress = shippingAddress
    }

    if (billingAddress) {
      updateData.billingAddress = billingAddress
    }

    // Handle line items if provided
    if (lineItems && lineItems.length > 0) {
      // Get existing line items
      const existingLineItems = existingOrder.lineItems || []
      const existingLineItemMap = new Map(existingLineItems.map((item) => [item.id, item]))

      // Track items to delete (those in DB but not in new list)
      const newLineItemIds = lineItems.filter((item) => item.id).map((item) => item.id)
      const itemsToDelete = existingLineItems.filter((item) => !newLineItemIds.includes(item.id)).map((item) => item.id)

      // Delete removed items
      for (const itemId of itemsToDelete) {
        // Check if item has been refunded
        const refundLineItem = await this.prisma.refundLineItem.findFirst({
          where: { orderItemId: itemId },
        })

        if (refundLineItem) {
          throw new BadRequestException(`Cannot remove order item with ID ${itemId} as it has been refunded`)
        }

        await this.prisma.orderItem.delete({ where: { id: itemId } })
      }

      // Process each line item in the new list
      for (const item of lineItems) {
        // Ensure numeric values
        const price = typeof item.price === "string" ? Number.parseFloat(item.price) : item.price
        const totalDiscount =
          typeof item.totalDiscount === "string" ? Number.parseFloat(item.totalDiscount) : item.totalDiscount || 0

        const itemData = {
          title: item.title,
          quantity: item.quantity,
          price: price,
          totalDiscount: totalDiscount,
          ...(item.variantId && { variant: { connect: { id: item.variantId } } }),
        }

        if (item.id && existingLineItemMap.has(item.id)) {
          // Update existing item
          await this.prisma.orderItem.update({
            where: { id: item.id },
            data: itemData,
          })
        } else {
          // Create new item
          await this.prisma.orderItem.create({
            data: {
              ...itemData,
              order: { connect: { id } },
            },
          })
        }
      }

      // Recalculate order totals
      const updatedLineItems = await this.prisma.orderItem.findMany({
        where: { orderId: id },
      })

      let subtotalPrice = 0
      let totalDiscounts = 0

      for (const item of updatedLineItems) {
        subtotalPrice += item.price.toNumber() * item.quantity
        totalDiscounts += item.totalDiscount.toNumber()
      }

      // Update totals
      updateData.subtotalPrice = subtotalPrice
      updateData.totalPrice =
        subtotalPrice - totalDiscounts + (existingOrder.totalTax ? existingOrder.totalTax.toNumber() : 0)
    }

    // Update the order
    return this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        currency: true,
        coupon: true,
        paymentProvider: true,
        shippingMethod: true,
        lineItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  // Update order status
  async updateStatus(
    id: string,
    data: {
      financialStatus?: OrderFinancialStatus
      fulfillmentStatus?: OrderFulfillmentStatus
      paymentStatus?: PaymentStatus
      shippingStatus?: ShippingStatus
    },
  ) {
    // Check if the order exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`)
    }

    // Update the order status
    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        currency: true,
        coupon: true,
        paymentProvider: true,
        shippingMethod: true,
        lineItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  // Delete an order
  async remove(id: string) {
    // Check if the order exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: {
        refunds: true,
        paymentTransaction: true,
      },
    })

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`)
    }

    // Check if the order has refunds
    if (existingOrder.refunds.length > 0) {
      throw new BadRequestException(`Cannot delete order with ID ${id} as it has refunds`)
    }

    // Check if the order has payment transactions
    if (existingOrder.paymentTransaction.length > 0) {
      throw new BadRequestException(`Cannot delete order with ID ${id} as it has payment transactions`)
    }

    // Delete all line items
    await this.prisma.orderItem.deleteMany({
      where: { orderId: id },
    })

    // Delete the order
    return this.prisma.order.delete({
      where: { id },
    })
  }

  // Get order statistics
  async getStatistics(storeId: string, startDate?: Date, endDate?: Date) {
    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Set date range
    const where: any = { storeId }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = startDate
      }
      if (endDate) {
        where.createdAt.lte = endDate
      }
    }

    // Get order counts by status
    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      fulfilledOrders,
      cancelledOrders,
      refundedOrders,
      totalRevenue,
      averageOrderValue,
    ] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.count({
        where: {
          ...where,
          financialStatus: OrderFinancialStatus.PENDING,
        },
      }),
      this.prisma.order.count({
        where: {
          ...where,
          financialStatus: OrderFinancialStatus.PAID,
        },
      }),
      this.prisma.order.count({
        where: {
          ...where,
          fulfillmentStatus: OrderFulfillmentStatus.FULFILLED,
        },
      }),
      this.prisma.order.count({
        where: {
          ...where,
          financialStatus: OrderFinancialStatus.VOIDED,
        },
      }),
      this.prisma.order.count({
        where: {
          ...where,
          financialStatus: OrderFinancialStatus.REFUNDED,
        },
      }),
      this.prisma.order.aggregate({
        where: {
          ...where,
          financialStatus: OrderFinancialStatus.PAID,
        },
        _sum: {
          totalPrice: true,
        },
      }),
      this.prisma.order.aggregate({
        where: {
          ...where,
          financialStatus: OrderFinancialStatus.PAID,
        },
        _avg: {
          totalPrice: true,
        },
      }),
    ])

    // Get recent orders
    const recentOrders = await this.prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        currency: true,
        lineItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      fulfilledOrders,
      cancelledOrders,
      refundedOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      averageOrderValue: averageOrderValue._avg.totalPrice || 0,
      recentOrders,
    }
  }
}

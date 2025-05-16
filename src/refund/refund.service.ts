import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import { CreateRefundDto } from "./dto/create-refund.dto"
import { UpdateRefundDto } from "./dto/update-refund.dto"
import { CreateRefundLineItemDto } from "./dto/create-refund-line-item.dto"
import { UpdateRefundLineItemDto } from "./dto/update-refund-line-item.dto"
import { OrderFinancialStatus } from "@prisma/client"

@Injectable()
export class RefundService {
  constructor(private prisma: PrismaService) {}

  // Create a new refund
  async create(createRefundDto: CreateRefundDto) {
    const { orderId, lineItems, ...refundData } = createRefundDto

    // Check if the order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        lineItems: true,
      },
    })

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`)
    }

    // Validate line items
    for (const item of lineItems) {
      // Check if the order item exists and belongs to this order
      const orderItem = order.lineItems.find((oi) => oi.id === item.orderItemId)
      if (!orderItem) {
        throw new NotFoundException(
          `Order item with ID ${item.orderItemId} not found or does not belong to order with ID ${orderId}`,
        )
      }

      // Check if the quantity to refund is valid
      if (item.quantity > orderItem.quantity) {
        throw new BadRequestException(
          `Cannot refund ${item.quantity} of item ${item.orderItemId} as only ${orderItem.quantity} were ordered`,
        )
      }

      // Check if the amount to refund is valid
      const maxRefundAmount = orderItem.price.toNumber() * item.quantity
      if (item.amount > maxRefundAmount) {
        throw new BadRequestException(
          `Cannot refund ${item.amount} for item ${item.orderItemId} as the maximum refundable amount is ${maxRefundAmount}`,
        )
      }

      // Check if the item has already been fully refunded
      const existingRefundItems = await this.prisma.refundLineItem.findMany({
        where: { orderItemId: item.orderItemId },
      })

      const alreadyRefundedQuantity = existingRefundItems.reduce((sum, ri) => sum + ri.quantity, 0)
      if (alreadyRefundedQuantity + item.quantity > orderItem.quantity) {
        throw new BadRequestException(
          `Cannot refund ${item.quantity} more of item ${item.orderItemId} as ${alreadyRefundedQuantity} of ${orderItem.quantity} have already been refunded`,
        )
      }
    }

    // Create the refund with line items
    const refund = await this.prisma.refund.create({
      data: {
        ...refundData,
        order: {
          connect: { id: orderId },
        },
        lineItems: {
          create: lineItems.map((item) => ({
            orderItem: {
              connect: { id: item.orderItemId },
            },
            quantity: item.quantity,
            amount: item.amount,
            restocked: item.restocked || false,
          })),
        },
        processedAt: new Date(),
      },
      include: {
        order: true,
        lineItems: {
          include: {
            orderItem: true,
          },
        },
      },
    })

    // If restocking is enabled, update inventory
    if (refundData.restock) {
      for (const item of lineItems) {
        if (item.restocked) {
          const orderItem = order.lineItems.find((oi) => oi.id === item.orderItemId)
          if (orderItem && orderItem.variantId) {
            // Update variant inventory
            await this.prisma.productVariant.update({
              where: { id: orderItem.variantId },
              data: {
                inventoryQuantity: {
                  increment: item.quantity,
                },
              },
            })
          }
        }
      }
    }

    // Update order financial status if fully refunded
    const totalRefunded = await this.prisma.refund.aggregate({
      where: { orderId },
      _sum: {
        amount: true,
      },
    })

    if (totalRefunded._sum.amount && totalRefunded._sum.amount.toNumber() >= order.totalPrice.toNumber()) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          financialStatus: OrderFinancialStatus.REFUNDED,
        },
      })
    } else if (totalRefunded._sum.amount && totalRefunded._sum.amount.toNumber() > 0) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          financialStatus: OrderFinancialStatus.PARTIALLY_REFUNDED,
        },
      })
    }

    return refund
  }

  // Get all refunds
  async findAll() {
    return this.prisma.refund.findMany({
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            storeId: true,
            customerInfo: true,
            totalPrice: true,
          },
        },
        lineItems: {
          include: {
            orderItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get all refunds for a specific order
  async findAllByOrder(orderId: string) {
    // Check if the order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`)
    }

    return this.prisma.refund.findMany({
      where: { orderId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            storeId: true,
            customerInfo: true,
            totalPrice: true,
          },
        },
        lineItems: {
          include: {
            orderItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get all refunds for a specific store
  async findAllByStore(storeId: string) {
    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Find all orders for this store
    const orders = await this.prisma.order.findMany({
      where: { storeId },
      select: { id: true },
    })

    const orderIds = orders.map((order) => order.id)

    // Find all refunds for these orders
    return this.prisma.refund.findMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            storeId: true,
            customerInfo: true,
            totalPrice: true,
          },
        },
        lineItems: {
          include: {
            orderItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get a refund by ID
  async findOne(id: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            storeId: true,
            customerInfo: true,
            totalPrice: true,
            currency: true,
          },
        },
        lineItems: {
          include: {
            orderItem: {
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
        },
      },
    })

    if (!refund) {
      throw new NotFoundException(`Refund with ID ${id} not found`)
    }

    return refund
  }

  // Update a refund
  async update(id: string, updateRefundDto: UpdateRefundDto) {
    // Check if the refund exists
    const existingRefund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        lineItems: true,
      },
    })

    if (!existingRefund) {
      throw new NotFoundException(`Refund with ID ${id} not found`)
    }

    // Only allow updating the note field
    if (
      Object.keys(updateRefundDto).length > 1 ||
      (Object.keys(updateRefundDto).length === 1 && !updateRefundDto.note)
    ) {
      throw new BadRequestException(`Only the note field can be updated for a processed refund`)
    }

    // Update the refund
    return this.prisma.refund.update({
      where: { id },
      data: {
        note: updateRefundDto.note,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            storeId: true,
            customerInfo: true,
            totalPrice: true,
          },
        },
        lineItems: {
          include: {
            orderItem: true,
          },
        },
      },
    })
  }

  // Delete a refund (only allowed if it was just created and not yet processed)
  async remove(id: string) {
    // Check if the refund exists
    const existingRefund = await this.prisma.refund.findUnique({
      where: { id },
      include: {
        lineItems: true,
      },
    })

    if (!existingRefund) {
      throw new NotFoundException(`Refund with ID ${id} not found`)
    }

    // Only allow deletion if the refund was not processed yet
    if (existingRefund.processedAt) {
      throw new BadRequestException(`Cannot delete a processed refund`)
    }

    // Delete all refund line items
    await this.prisma.refundLineItem.deleteMany({
      where: { refundId: id },
    })

    // Delete the refund
    return this.prisma.refund.delete({
      where: { id },
    })
  }

  // Create a refund line item
  async createLineItem(createRefundLineItemDto: CreateRefundLineItemDto) {
    const { refundId, orderItemId, ...lineItemData } = createRefundLineItemDto

    // Check if the refund exists
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        order: {
          include: {
            lineItems: true,
          },
        },
        lineItems: true,
      },
    })

    if (!refund) {
      throw new NotFoundException(`Refund with ID ${refundId} not found`)
    }

    // Check if the order item exists and belongs to the refund's order
    const orderItem = refund.order.lineItems.find((oi) => oi.id === orderItemId)
    if (!orderItem) {
      throw new NotFoundException(
        `Order item with ID ${orderItemId} not found or does not belong to the refund's order`,
      )
    }

    // Check if the quantity to refund is valid
    if (lineItemData.quantity > orderItem.quantity) {
      throw new BadRequestException(
        `Cannot refund ${lineItemData.quantity} of item ${orderItemId} as only ${orderItem.quantity} were ordered`,
      )
    }

    // Check if the amount to refund is valid
    const maxRefundAmount = orderItem.price.toNumber() * lineItemData.quantity
    if (lineItemData.amount > maxRefundAmount) {
      throw new BadRequestException(
        `Cannot refund ${lineItemData.amount} for item ${orderItemId} as the maximum refundable amount is ${maxRefundAmount}`,
      )
    }

    // Check if the item has already been fully refunded
    const existingRefundItems = await this.prisma.refundLineItem.findMany({
      where: { orderItemId },
    })

    const alreadyRefundedQuantity = existingRefundItems.reduce((sum, ri) => sum + ri.quantity, 0)
    if (alreadyRefundedQuantity + lineItemData.quantity > orderItem.quantity) {
      throw new BadRequestException(
        `Cannot refund ${lineItemData.quantity} more of item ${orderItemId} as ${alreadyRefundedQuantity} of ${orderItem.quantity} have already been refunded`,
      )
    }

    // Create the refund line item
    const lineItem = await this.prisma.refundLineItem.create({
      data: {
        ...lineItemData,
        refund: {
          connect: { id: refundId },
        },
        orderItem: {
          connect: { id: orderItemId },
        },
      },
      include: {
        refund: true,
        orderItem: {
          include: {
            variant: true,
          },
        },
      },
    })

    // Update the refund amount
    await this.prisma.refund.update({
      where: { id: refundId },
      data: {
        amount: {
          increment: lineItemData.amount,
        },
      },
    })

    // If restocking is enabled, update inventory
    if (lineItemData.restocked && orderItem.variantId) {
      // Update variant inventory
      await this.prisma.productVariant.update({
        where: { id: orderItem.variantId },
        data: {
          inventoryQuantity: {
            increment: lineItemData.quantity,
          },
        },
      })
    }

    // Update order financial status
    const totalRefunded = await this.prisma.refund.aggregate({
      where: { orderId: refund.order.id },
      _sum: {
        amount: true,
      },
    })

    if (totalRefunded._sum.amount && totalRefunded._sum.amount.toNumber() >= refund.order.totalPrice.toNumber()) {
      await this.prisma.order.update({
        where: { id: refund.order.id },
        data: {
          financialStatus: OrderFinancialStatus.REFUNDED,
        },
      })
    } else if (totalRefunded._sum.amount && totalRefunded._sum.amount.toNumber() > 0) {
      await this.prisma.order.update({
        where: { id: refund.order.id },
        data: {
          financialStatus: OrderFinancialStatus.PARTIALLY_REFUNDED,
        },
      })
    }

    return lineItem
  }

  // Get a refund line item by ID
  async findLineItem(id: string) {
    const lineItem = await this.prisma.refundLineItem.findUnique({
      where: { id },
      include: {
        refund: true,
        orderItem: {
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

    if (!lineItem) {
      throw new NotFoundException(`Refund line item with ID ${id} not found`)
    }

    return lineItem
  }

  // Update a refund line item
  async updateLineItem(id: string, updateRefundLineItemDto: UpdateRefundLineItemDto) {
    // Check if the line item exists
    const existingLineItem = await this.prisma.refundLineItem.findUnique({
      where: { id },
      include: {
        refund: true,
        orderItem: true,
      },
    })

    if (!existingLineItem) {
      throw new NotFoundException(`Refund line item with ID ${id} not found`)
    }

    // Only allow updating the restocked field
    if (
      Object.keys(updateRefundLineItemDto).length > 1 ||
      (Object.keys(updateRefundLineItemDto).length === 1 && updateRefundLineItemDto.restocked === undefined)
    ) {
      throw new BadRequestException(`Only the restocked field can be updated for a processed refund line item`)
    }

    // If changing from not restocked to restocked, update inventory
    if (
      updateRefundLineItemDto.restocked === true &&
      !existingLineItem.restocked &&
      existingLineItem.orderItem.variantId
    ) {
      // Update variant inventory
      await this.prisma.productVariant.update({
        where: { id: existingLineItem.orderItem.variantId },
        data: {
          inventoryQuantity: {
            increment: existingLineItem.quantity,
          },
        },
      })
    }

    // If changing from restocked to not restocked, update inventory
    if (
      updateRefundLineItemDto.restocked === false &&
      existingLineItem.restocked &&
      existingLineItem.orderItem.variantId
    ) {
      // Update variant inventory
      await this.prisma.productVariant.update({
        where: { id: existingLineItem.orderItem.variantId },
        data: {
          inventoryQuantity: {
            decrement: existingLineItem.quantity,
          },
        },
      })
    }

    // Update the line item
    return this.prisma.refundLineItem.update({
      where: { id },
      data: {
        restocked: updateRefundLineItemDto.restocked,
      },
      include: {
        refund: true,
        orderItem: {
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

  // Delete a refund line item (only allowed if the refund was not processed yet)
  async removeLineItem(id: string) {
    // Check if the line item exists
    const existingLineItem = await this.prisma.refundLineItem.findUnique({
      where: { id },
      include: {
        refund: true,
      },
    })

    if (!existingLineItem) {
      throw new NotFoundException(`Refund line item with ID ${id} not found`)
    }

    // Only allow deletion if the refund was not processed yet
    if (existingLineItem.refund.processedAt) {
      throw new BadRequestException(`Cannot delete a line item from a processed refund`)
    }

    // Update the refund amount
    await this.prisma.refund.update({
      where: { id: existingLineItem.refundId },
      data: {
        amount: {
          decrement: existingLineItem.amount,
        },
      },
    })

    // Delete the line item
    return this.prisma.refundLineItem.delete({
      where: { id },
    })
  }

  // Get refund statistics for a store
  async getStatisticsByStore(storeId: string, startDate?: Date, endDate?: Date) {
    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Find all orders for this store
    const orders = await this.prisma.order.findMany({
      where: { storeId },
      select: { id: true },
    })

    const orderIds = orders.map((order) => order.id)

    // Set date range
    const where: any = {
      orderId: {
        in: orderIds,
      },
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = startDate
      }
      if (endDate) {
        where.createdAt.lte = endDate
      }
    }

    // Get refund statistics
    const [totalRefunds, totalRefundAmount, averageRefundAmount] = await Promise.all([
      this.prisma.refund.count({ where }),
      this.prisma.refund.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),
      this.prisma.refund.aggregate({
        where,
        _avg: {
          amount: true,
        },
      }),
    ])

    // Get recent refunds
    const recentRefunds = await this.prisma.refund.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerInfo: true,
            totalPrice: true,
            currency: true,
          },
        },
        lineItems: {
          include: {
            orderItem: {
              select: {
                id: true,
                title: true,
                quantity: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    })

    return {
      totalRefunds,
      totalRefundAmount: totalRefundAmount._sum.amount || 0,
      averageRefundAmount: averageRefundAmount._avg.amount || 0,
      recentRefunds,
    }
  }
}

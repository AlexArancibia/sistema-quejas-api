import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import { CreatePaymentTransactionDto } from "./dto/create-payment-transaction.dto"
import { UpdatePaymentTransactionDto } from "./dto/update-payment-transaction.dto"
import { OrderFinancialStatus, PaymentStatus } from "@prisma/client"

@Injectable()
export class PaymentTransactionService {
  constructor(private prisma: PrismaService) {}

  // Create a new payment transaction
  async create(createPaymentTransactionDto: CreatePaymentTransactionDto) {
    const { orderId, paymentProviderId, currencyId, ...transactionData } = createPaymentTransactionDto

    // Check if the order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`)
    }

    // Check if the payment provider exists
    const paymentProvider = await this.prisma.paymentProvider.findUnique({
      where: { id: paymentProviderId },
    })

    if (!paymentProvider) {
      throw new NotFoundException(`Payment provider with ID ${paymentProviderId} not found`)
    }

    // Check if the currency exists
    const currency = await this.prisma.currency.findUnique({
      where: { id: currencyId },
    })

    if (!currency) {
      throw new NotFoundException(`Currency with ID ${currencyId} not found`)
    }

    // Create the payment transaction
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        ...transactionData,
        order: {
          connect: { id: orderId },
        },
        paymentProvider: {
          connect: { id: paymentProviderId },
        },
        currency: {
          connect: { id: currencyId },
        },
      },
      include: {
        order: true,
        paymentProvider: true,
        currency: true,
      },
    })

    // Update order payment status
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: transactionData.status,
        financialStatus:
          transactionData.status === PaymentStatus.COMPLETED
            ? OrderFinancialStatus.PAID
            : transactionData.status === PaymentStatus.FAILED
              ? OrderFinancialStatus.VOIDED
              : OrderFinancialStatus.PENDING,
      },
    })

    return transaction
  }

  // Get all payment transactions
  async findAll() {
    return this.prisma.paymentTransaction.findMany({
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerInfo: true,
            storeId: true,
          },
        },
        paymentProvider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        currency: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get all payment transactions for a specific order
  async findAllByOrder(orderId: string) {
    // Check if the order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`)
    }

    return this.prisma.paymentTransaction.findMany({
      where: { orderId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerInfo: true,
            storeId: true,
          },
        },
        paymentProvider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        currency: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get all payment transactions for a specific store
  async findAllByStore(storeId: string, status?: PaymentStatus) {
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

    // Find all transactions for these orders
    const where: any = {
      orderId: {
        in: orderIds,
      },
    }

    if (status) {
      where.status = status
    }

    return this.prisma.paymentTransaction.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerInfo: true,
            storeId: true,
          },
        },
        paymentProvider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        currency: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get all payment transactions for a specific payment provider
  async findAllByPaymentProvider(paymentProviderId: string, status?: PaymentStatus) {
    // Check if the payment provider exists
    const paymentProvider = await this.prisma.paymentProvider.findUnique({
      where: { id: paymentProviderId },
    })

    if (!paymentProvider) {
      throw new NotFoundException(`Payment provider with ID ${paymentProviderId} not found`)
    }

    const where: any = { paymentProviderId }

    if (status) {
      where.status = status
    }

    return this.prisma.paymentTransaction.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerInfo: true,
            storeId: true,
          },
        },
        paymentProvider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        currency: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get a payment transaction by ID
  async findOne(id: string) {
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerInfo: true,
            storeId: true,
            totalPrice: true,
            currency: true,
            lineItems: true,
          },
        },
        paymentProvider: {
          select: {
            id: true,
            name: true,
            type: true,
            imgUrl: true,
          },
        },
        currency: true,
      },
    })

    if (!transaction) {
      throw new NotFoundException(`Payment transaction with ID ${id} not found`)
    }

    return transaction
  }

  // Update a payment transaction
  async update(id: string, updatePaymentTransactionDto: UpdatePaymentTransactionDto) {
    const { orderId, paymentProviderId, currencyId, status, ...transactionData } = updatePaymentTransactionDto

    // Check if the transaction exists
    const existingTransaction = await this.prisma.paymentTransaction.findUnique({
      where: { id },
      include: {
        order: true,
      },
    })

    if (!existingTransaction) {
      throw new NotFoundException(`Payment transaction with ID ${id} not found`)
    }

    // Prepare update data
    const data: any = { ...transactionData }

    // Handle order connection if provided
    if (orderId) {
      // Check if the order exists
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      })

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`)
      }

      data.order = {
        connect: { id: orderId },
      }
    }

    // Handle payment provider connection if provided
    if (paymentProviderId) {
      // Check if the payment provider exists
      const paymentProvider = await this.prisma.paymentProvider.findUnique({
        where: { id: paymentProviderId },
      })

      if (!paymentProvider) {
        throw new NotFoundException(`Payment provider with ID ${paymentProviderId} not found`)
      }

      data.paymentProvider = {
        connect: { id: paymentProviderId },
      }
    }

    // Handle currency connection if provided
    if (currencyId) {
      // Check if the currency exists
      const currency = await this.prisma.currency.findUnique({
        where: { id: currencyId },
      })

      if (!currency) {
        throw new NotFoundException(`Currency with ID ${currencyId} not found`)
      }

      data.currency = {
        connect: { id: currencyId },
      }
    }

    // Handle status update
    if (status && status !== existingTransaction.status) {
      data.status = status

      // Update order payment status if status is changing
      await this.prisma.order.update({
        where: { id: existingTransaction.orderId },
        data: {
          paymentStatus: status,
          financialStatus:
            status === PaymentStatus.COMPLETED
              ? OrderFinancialStatus.PAID
              : status === PaymentStatus.FAILED
                ? OrderFinancialStatus.VOIDED
                : OrderFinancialStatus.PENDING,
        },
      })
    }

    // Update the transaction
    return this.prisma.paymentTransaction.update({
      where: { id },
      data,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerInfo: true,
            storeId: true,
          },
        },
        paymentProvider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        currency: true,
      },
    })
  }

  // Delete a payment transaction
  async remove(id: string) {
    // Check if the transaction exists
    const existingTransaction = await this.prisma.paymentTransaction.findUnique({
      where: { id },
    })

    if (!existingTransaction) {
      throw new NotFoundException(`Payment transaction with ID ${id} not found`)
    }

    // Check if the transaction is completed
    if (existingTransaction.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        `Cannot delete a completed payment transaction. Consider creating a refund instead.`,
      )
    }

    // Delete the transaction
    return this.prisma.paymentTransaction.delete({
      where: { id },
    })
  }

  // Get payment transaction statistics for a store
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

    // Get transaction statistics
    const [
      totalTransactions,
      completedTransactions,
      failedTransactions,
      pendingTransactions,
      totalAmount,
      averageAmount,
      transactionsByProvider,
    ] = await Promise.all([
      this.prisma.paymentTransaction.count({ where }),
      this.prisma.paymentTransaction.count({
        where: {
          ...where,
          status: PaymentStatus.COMPLETED,
        },
      }),
      this.prisma.paymentTransaction.count({
        where: {
          ...where,
          status: PaymentStatus.FAILED,
        },
      }),
      this.prisma.paymentTransaction.count({
        where: {
          ...where,
          status: PaymentStatus.PENDING,
        },
      }),
      this.prisma.paymentTransaction.aggregate({
        where: {
          ...where,
          status: PaymentStatus.COMPLETED,
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.paymentTransaction.aggregate({
        where: {
          ...where,
          status: PaymentStatus.COMPLETED,
        },
        _avg: {
          amount: true,
        },
      }),
      this.prisma.paymentTransaction.groupBy({
        by: ["paymentProviderId"],
        where: {
          ...where,
          status: PaymentStatus.COMPLETED,
        },
        _count: {
          _all: true,
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    // Get provider details for the grouped transactions
    const providersDetails = await Promise.all(
      transactionsByProvider.map(async (group) => {
        const provider = await this.prisma.paymentProvider.findUnique({
          where: { id: group.paymentProviderId },
          select: {
            id: true,
            name: true,
            type: true,
          },
        })
        return {
          provider,
          count: group._count._all,
          totalAmount: group._sum.amount,
        }
      }),
    )

    // Get recent transactions
    const recentTransactions = await this.prisma.paymentTransaction.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerInfo: true,
          },
        },
        paymentProvider: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        currency: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    })

    return {
      totalTransactions,
      completedTransactions,
      failedTransactions,
      pendingTransactions,
      successRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0,
      totalAmount: totalAmount._sum.amount || 0,
      averageAmount: averageAmount._avg.amount || 0,
      transactionsByProvider: providersDetails,
      recentTransactions,
    }
  }
}

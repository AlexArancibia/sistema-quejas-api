import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreatePaymentProviderDto } from "./dto/create-payment-provider.dto"
import { UpdatePaymentProviderDto } from "./dto/update-payment-provider.dto"
import { PaymentProviderType } from "@prisma/client"

@Injectable()
export class PaymentProviderService {
  constructor(private prisma: PrismaService) {}

  // Create a new payment provider
  async create(createPaymentProviderDto: CreatePaymentProviderDto) {
    const { storeId, currencyId, ...providerData } = createPaymentProviderDto

    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Check if the currency exists
    const currency = await this.prisma.currency.findUnique({
      where: { id: currencyId },
    })

    if (!currency) {
      throw new NotFoundException(`Currency with ID ${currencyId} not found`)
    }

    // Ya no verificamos si la moneda pertenece a la tienda porque Currency ya no está asociado a Store

    // Create the payment provider
    return this.prisma.paymentProvider.create({
      data: {
        ...providerData,
        store: {
          connect: { id: storeId },
        },
        currency: {
          connect: { id: currencyId },
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
      },
    })
  }

  // Get all payment providers
  async findAll() {
    return this.prisma.paymentProvider.findMany({
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        currency: true,
      },
    })
  }

  // Get all payment providers for a specific store
  async findAllByStore(storeId: string, includeInactive = false, type?: PaymentProviderType) {
    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    const where: any = { storeId }

    if (!includeInactive) {
      where.isActive = true
    }

    if (type) {
      where.type = type
    }

    return this.prisma.paymentProvider.findMany({
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
      },
      orderBy: {
        name: "asc",
      },
    })
  }

  // Get a payment provider by ID
  async findOne(id: string) {
    const paymentProvider = await this.prisma.paymentProvider.findUnique({
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
      },
    })

    if (!paymentProvider) {
      throw new NotFoundException(`Payment provider with ID ${id} not found`)
    }

    return paymentProvider
  }

  // Update a payment provider
  async update(id: string, updatePaymentProviderDto: UpdatePaymentProviderDto) {
    const { storeId, currencyId, ...providerData } = updatePaymentProviderDto

    // Check if the payment provider exists
    const existingProvider = await this.prisma.paymentProvider.findUnique({
      where: { id },
    })

    if (!existingProvider) {
      throw new NotFoundException(`Payment provider with ID ${id} not found`)
    }

    // If storeId is being updated, check if the new store exists
    if (storeId && storeId !== existingProvider.storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
      })

      if (!store) {
        throw new NotFoundException(`Store with ID ${storeId} not found`)
      }
    }

    // If currencyId is being updated, check if the new currency exists
    if (currencyId && currencyId !== existingProvider.currencyId) {
      const currency = await this.prisma.currency.findUnique({
        where: { id: currencyId },
      })

      if (!currency) {
        throw new NotFoundException(`Currency with ID ${currencyId} not found`)
      }

      // Ya no verificamos si la moneda pertenece a la tienda
    }

    // Prepare update data
    const data: any = { ...providerData }

    // Connect store if provided
    if (storeId) {
      data.store = {
        connect: { id: storeId },
      }
    }

    // Connect currency if provided
    if (currencyId) {
      data.currency = {
        connect: { id: currencyId },
      }
    }

    // Update the payment provider
    return this.prisma.paymentProvider.update({
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
      },
    })
  }

  // Toggle the active status of a payment provider
  async toggleActive(id: string, isActive: boolean) {
    // Check if the payment provider exists
    const existingProvider = await this.prisma.paymentProvider.findUnique({
      where: { id },
    })

    if (!existingProvider) {
      throw new NotFoundException(`Payment provider with ID ${id} not found`)
    }

    // Update the active status
    return this.prisma.paymentProvider.update({
      where: { id },
      data: { isActive },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        currency: true,
      },
    })
  }

  // Delete a payment provider
  async remove(id: string) {
    // Check if the payment provider exists
    const existingProvider = await this.prisma.paymentProvider.findUnique({
      where: { id },
      include: {
        orders: true,
        PaymentTransaction: true,
      },
    })

    if (!existingProvider) {
      throw new NotFoundException(`Payment provider with ID ${id} not found`)
    }

    // Check if the payment provider is used in any orders
    if (existingProvider.orders.length > 0) {
      throw new BadRequestException(
        `Cannot delete payment provider with ID ${id} as it is used in ${existingProvider.orders.length} orders. Consider deactivating it instead.`,
      )
    }

    // Check if the payment provider is used in any payment transactions
    if (existingProvider.PaymentTransaction.length > 0) {
      throw new BadRequestException(
        `Cannot delete payment provider with ID ${id} as it is used in ${existingProvider.PaymentTransaction.length} payment transactions. Consider deactivating it instead.`,
      )
    }

    // Delete the payment provider
    return this.prisma.paymentProvider.delete({
      where: { id },
    })
  }

  // Get payment provider statistics
  async getStatistics(id: string) {
    // Check if the payment provider exists
    const paymentProvider = await this.prisma.paymentProvider.findUnique({
      where: { id },
    })

    if (!paymentProvider) {
      throw new NotFoundException(`Payment provider with ID ${id} not found`)
    }

    // Get transaction statistics
    const [
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      totalAmount,
      averageAmount,
    ] = await Promise.all([
      this.prisma.paymentTransaction.count({
        where: { paymentProviderId: id },
      }),
      this.prisma.paymentTransaction.count({
        where: {
          paymentProviderId: id,
          status: "COMPLETED",
        },
      }),
      this.prisma.paymentTransaction.count({
        where: {
          paymentProviderId: id,
          status: "FAILED",
        },
      }),
      this.prisma.paymentTransaction.count({
        where: {
          paymentProviderId: id,
          status: "PENDING",
        },
      }),
      this.prisma.paymentTransaction.aggregate({
        where: {
          paymentProviderId: id,
          status: "COMPLETED",
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.paymentTransaction.aggregate({
        where: {
          paymentProviderId: id,
          status: "COMPLETED",
        },
        _avg: {
          amount: true,
        },
      }),
    ])

    // Get recent transactions
    const recentTransactions = await this.prisma.paymentTransaction.findMany({
      where: { paymentProviderId: id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerInfo: true,
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
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
      totalAmount: totalAmount._sum.amount || 0,
      averageAmount: averageAmount._avg.amount || 0,
      recentTransactions,
    }
  }
}
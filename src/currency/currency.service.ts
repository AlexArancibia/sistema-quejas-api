import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateCurrencyDto } from "./dto/create-currency.dto"
import { UpdateCurrencyDto } from "./dto/update-currency.dto"

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService) {}

  // Create a new currency
  async create(createCurrencyDto: CreateCurrencyDto) {
    // Check if the currency code already exists
    const existingCurrency = await this.prisma.currency.findFirst({
      where: {
        code: createCurrencyDto.code,
      },
    })

    if (existingCurrency) {
      throw new ConflictException(`A currency with code '${createCurrencyDto.code}' already exists`)
    }

    // Create the currency
    return this.prisma.currency.create({
      data: createCurrencyDto,
    })
  }

  // Get all currencies
  async findAll(includeInactive = false) {
    const where: any = {}

    if (!includeInactive) {
      where.isActive = true
    }

    return this.prisma.currency.findMany({
      where,
      include: {
        fromExchangeRates: true,
        toExchangeRates: true,
      },
      orderBy: {
        code: "asc",
      },
    })
  }

  // Get a currency by ID
  async findOne(id: string) {
    const currency = await this.prisma.currency.findUnique({
      where: { id },
      include: {
        fromExchangeRates: true,
        toExchangeRates: true,
      },
    })

    if (!currency) {
      throw new NotFoundException(`Currency with ID ${id} not found`)
    }

    return currency
  }

  // Get a currency by code
  async findByCode(code: string) {
    const currency = await this.prisma.currency.findFirst({
      where: {
        code,
      },
      include: {
        fromExchangeRates: true,
        toExchangeRates: true,
      },
    })

    if (!currency) {
      throw new NotFoundException(`Currency with code '${code}' not found`)
    }

    return currency
  }

  // Update a currency
  async update(id: string, updateCurrencyDto: UpdateCurrencyDto) {
    // Check if the currency exists
    const existingCurrency = await this.prisma.currency.findUnique({
      where: { id },
    })

    if (!existingCurrency) {
      throw new NotFoundException(`Currency with ID ${id} not found`)
    }

    // If code is being updated, check if the new code already exists
    if (updateCurrencyDto.code && updateCurrencyDto.code !== existingCurrency.code) {
      const codeExists = await this.prisma.currency.findFirst({
        where: {
          code: updateCurrencyDto.code,
        },
      })

      if (codeExists) {
        throw new ConflictException(`A currency with code '${updateCurrencyDto.code}' already exists`)
      }
    }

    // Update the currency
    return this.prisma.currency.update({
      where: { id },
      data: updateCurrencyDto,
      include: {
        fromExchangeRates: true,
        toExchangeRates: true,
      },
    })
  }

  // Delete a currency
  async remove(id: string) {
    // Check if the currency exists
    const existingCurrency = await this.prisma.currency.findUnique({
      where: { id },
    })

    if (!existingCurrency) {
      throw new NotFoundException(`Currency with ID ${id} not found`)
    }

    // Check if the currency is used as default for any shop
    const defaultForShop = await this.prisma.shopSettings.findFirst({
      where: { defaultCurrencyId: id },
    })

    if (defaultForShop) {
      throw new BadRequestException(
        `Cannot delete this currency as it is set as the default currency for a shop. Please change the default currency first.`,
      )
    }

    // Check if the currency is used in any orders
    const ordersCount = await this.prisma.order.count({
      where: { currencyId: id },
    })

    if (ordersCount > 0) {
      throw new BadRequestException(
        `Cannot delete this currency as it is used in ${ordersCount} orders. Consider deactivating it instead.`,
      )
    }

    // Check if the currency is used in any payment providers
    const paymentProvidersCount = await this.prisma.paymentProvider.count({
      where: { currencyId: id },
    })

    if (paymentProvidersCount > 0) {
      throw new BadRequestException(
        `Cannot delete this currency as it is used in ${paymentProvidersCount} payment providers. Please update those payment providers first.`,
      )
    }

    // Check if the currency is used in any variant prices
    const variantPricesCount = await this.prisma.variantPrice.count({
      where: { currencyId: id },
    })

    if (variantPricesCount > 0) {
      throw new BadRequestException(
        `Cannot delete this currency as it is used in ${variantPricesCount} product variant prices. Please update those prices first.`,
      )
    }

    // Delete all exchange rates related to this currency
    await this.prisma.exchangeRate.deleteMany({
      where: {
        OR: [{ fromCurrencyId: id }, { toCurrencyId: id }],
      },
    })

    // Delete the currency
    return this.prisma.currency.delete({
      where: { id },
    })
  }
}
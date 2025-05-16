import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  ForbiddenException,
} from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateShopSettingsDto } from "./dto/create-shop-settings.dto"
import { UpdateShopSettingsDto } from "./dto/update-shop-settings.dto"
import { UserRole } from "@prisma/client"

@Injectable()
export class ShopSettingsService {
  private readonly logger = new Logger(ShopSettingsService.name)

  constructor(private prisma: PrismaService) {}

  async create(createShopSettingsDto: CreateShopSettingsDto) {
    this.logger.log(`Creating shop settings for store: ${createShopSettingsDto.storeId}`)

    const { storeId, defaultCurrencyId, ...settingsData } = createShopSettingsDto

    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    })

    if (!store) {
      this.logger.error(`Store with ID ${storeId} not found`)
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Check if settings already exist for this store
    const existingSettings = await this.prisma.shopSettings.findUnique({
      where: { storeId },
    })

    if (existingSettings) {
      this.logger.error(`Shop settings already exist for store with ID ${storeId}`)
      throw new ConflictException(`Shop settings already exist for store with ID ${storeId}`)
    }

    // Check if the domain is already taken
    if (createShopSettingsDto.domain) {
      const domainExists = await this.prisma.shopSettings.findUnique({
        where: { domain: createShopSettingsDto.domain },
      })

      if (domainExists) {
        this.logger.error(`A shop with domain '${createShopSettingsDto.domain}' already exists`)
        throw new ConflictException(`A shop with domain '${createShopSettingsDto.domain}' already exists`)
      }
    }

    // Check if the default currency exists
    const currency = await this.prisma.currency.findUnique({
      where: {
        id: defaultCurrencyId,
      },
    })

    if (!currency) {
      this.logger.error(`Currency with ID ${defaultCurrencyId} not found`)
      throw new NotFoundException(`Currency with ID ${defaultCurrencyId} not found`)
    }

    // Create the shop settings
    try {
      const result = await this.prisma.shopSettings.create({
        data: {
          ...settingsData,
          store: {
            connect: { id: storeId },
          },
          defaultCurrency: {
            connect: { id: defaultCurrencyId },
          },
        },
        include: {
          store: true,
          defaultCurrency: true,
          acceptedCurrencies: true,
        },
      })

      this.logger.log(`Successfully created shop settings for store: ${storeId}`)
      return result
    } catch (error) {
      this.logger.error(`Error creating shop settings: ${error.message}`, error.stack)
      throw error
    }
  }

  async findAll() {
    this.logger.log(`Finding all shop settings`)

    try {
      const settings = await this.prisma.shopSettings.findMany({
        include: {
          store: true,
          defaultCurrency: true,
          acceptedCurrencies: true,
        },
      })

      this.logger.log(`Found ${settings.length} shop settings`)
      return settings
    } catch (error) {
      this.logger.error(`Error finding all shop settings: ${error.message}`, error.stack)
      throw error
    }
  }

  async findOne(id: string) {
    try {
      const shopSettings = await this.prisma.shopSettings.findUnique({
        where: { id },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      if (!shopSettings) {
        this.logger.warn(`Shop settings with ID ${id} not found`)
        return [] // Return empty array instead of throwing an exception
      }

      return shopSettings
    } catch (error) {
      this.logger.error(`Error finding shop settings with ID ${id}: ${error.message}`, error.stack)
      throw error
    }
  }

  async findByStoreId(storeId: string) {
    this.logger.log(`Finding shop settings for store: ${storeId}`)

    try {
      const settings = await this.prisma.shopSettings.findUnique({
        where: { storeId },
        include: {
          store: true,
          defaultCurrency: true,
          acceptedCurrencies: true,
        },
      })

      if (!settings) {
        this.logger.warn(`Shop settings for store with ID ${storeId} not found`)
        return [] // Return empty array instead of throwing an exception
      }

      return settings
    } catch (error) {
      this.logger.error(`Error finding shop settings by store ID: ${error.message}`, error.stack)
      throw error
    }
  }

  async findByDomain(domain: string) {
    this.logger.log(`Finding shop settings by domain: ${domain}`)

    try {
      const settings = await this.prisma.shopSettings.findUnique({
        where: { domain },
        include: {
          store: true,
          defaultCurrency: true,
          acceptedCurrencies: true,
        },
      })

      if (!settings) {
        this.logger.warn(`Shop settings for domain '${domain}' not found`)
        return [] // Return empty array instead of throwing an exception
      }

      return settings
    } catch (error) {
      this.logger.error(`Error finding shop settings by domain: ${error.message}`, error.stack)
      throw error
    }
  }

  async update(storeId: string, updateShopSettingsDto: UpdateShopSettingsDto) {
    this.logger.log(`Updating shop settings for store: ${storeId}`)

    const { defaultCurrencyId, ...settingsData } = updateShopSettingsDto

    // Check if the settings exist
    const existingSettings = await this.prisma.shopSettings.findUnique({
      where: { storeId },
      include: {
        defaultCurrency: true,
        acceptedCurrencies: true,
      },
    })

    if (!existingSettings) {
      this.logger.error(`Shop settings for store with ID ${storeId} not found`)
      throw new NotFoundException(`Shop settings for store with ID ${storeId} not found`)
    }

    // If domain is being updated, check if the new domain is already taken
    if (updateShopSettingsDto.domain && updateShopSettingsDto.domain !== existingSettings.domain) {
      const domainExists = await this.prisma.shopSettings.findUnique({
        where: { domain: updateShopSettingsDto.domain },
      })

      if (domainExists && domainExists.id !== existingSettings.id) {
        this.logger.error(`A shop with domain '${updateShopSettingsDto.domain}' already exists`)
        throw new ConflictException(`A shop with domain '${updateShopSettingsDto.domain}' already exists`)
      }
    }

    // If default currency is being updated, check if it exists
    if (defaultCurrencyId) {
      const currency = await this.prisma.currency.findUnique({
        where: {
          id: defaultCurrencyId,
        },
      })

      if (!currency) {
        this.logger.error(`Currency with ID ${defaultCurrencyId} not found`)
        throw new NotFoundException(`Currency with ID ${defaultCurrencyId} not found`)
      }
    }

    // Prepare update data
    const data: any = { ...settingsData }

    // Connect default currency if provided
    if (defaultCurrencyId) {
      data.defaultCurrency = {
        connect: { id: defaultCurrencyId },
      }
    }

    try {
      // Update the shop settings
      const result = await this.prisma.shopSettings.update({
        where: { storeId },
        data,
        include: {
          store: true,
          defaultCurrency: true,
          acceptedCurrencies: true,
        },
      })

      this.logger.log(`Successfully updated shop settings for store: ${storeId}`)
      return result
    } catch (error) {
      this.logger.error(`Error updating shop settings: ${error.message}`, error.stack)
      throw error
    }
  }

  async remove(id: string, userId: string) {
    try {
      // Verificar si las configuraciones existen
      const existingSettings = await this.prisma.shopSettings.findUnique({
        where: { id },
        include: {
          store: {
            include: {
              owner: true,
            },
          },
        },
      })

      if (!existingSettings) {
        throw new NotFoundException(`Shop settings with ID ${id} not found`)
      }

      // Verificar si el usuario es el propietario de la tienda o un administrador
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      })

      if (user.role !== UserRole.ADMIN && existingSettings.store.ownerId !== userId) {
        throw new ForbiddenException("You do not have permission to delete settings for this store")
      }

      // Eliminar las configuraciones
      await this.prisma.shopSettings.delete({
        where: { id },
      })

      this.logger.log(`Removed shop settings with ID: ${id}`)
      return { message: `Shop settings with ID ${id} successfully deleted` }
    } catch (error) {
      this.logger.error(`Error removing shop settings with ID ${id}: ${error.message}`, error.stack)
      throw error
    }
  }

  async addAcceptedCurrency(storeId: string, currencyId: string) {
    this.logger.log(`Adding accepted currency ${currencyId} to store: ${storeId}`)

    // Check if the settings exist
    const existingSettings = await this.prisma.shopSettings.findUnique({
      where: { storeId },
      include: {
        defaultCurrency: true,
        acceptedCurrencies: true,
      },
    })

    if (!existingSettings) {
      this.logger.error(`Shop settings for store with ID ${storeId} not found`)
      throw new NotFoundException(`Shop settings for store with ID ${storeId} not found`)
    }

    // Check if the currency exists
    const currency = await this.prisma.currency.findUnique({
      where: {
        id: currencyId,
      },
    })

    if (!currency) {
      this.logger.error(`Currency with ID ${currencyId} not found`)
      throw new NotFoundException(`Currency with ID ${currencyId} not found`)
    }

    // Check if the currency is already accepted
    const isAlreadyAccepted = existingSettings.acceptedCurrencies.some((c) => c.id === currencyId)
    if (isAlreadyAccepted) {
      this.logger.warn(`Currency with ID ${currencyId} is already accepted for store with ID ${storeId}`)
      return existingSettings // Return existing settings without making changes
    }

    try {
      // Add the currency to accepted currencies
      const result = await this.prisma.shopSettings.update({
        where: { storeId },
        data: {
          acceptedCurrencies: {
            connect: { id: currencyId },
          },
        },
        include: {
          store: true,
          defaultCurrency: true,
          acceptedCurrencies: true,
        },
      })

      this.logger.log(`Successfully added accepted currency ${currencyId} to store: ${storeId}`)
      return result
    } catch (error) {
      this.logger.error(`Error adding accepted currency: ${error.message}`, error.stack)
      throw error
    }
  }

  async removeAcceptedCurrency(storeId: string, currencyId: string) {
    this.logger.log(`Removing accepted currency ${currencyId} from store: ${storeId}`)

    // Check if the settings exist
    const existingSettings = await this.prisma.shopSettings.findUnique({
      where: { storeId },
      include: {
        defaultCurrency: true,
        acceptedCurrencies: true,
      },
    })

    if (!existingSettings) {
      this.logger.error(`Shop settings for store with ID ${storeId} not found`)
      throw new NotFoundException(`Shop settings for store with ID ${storeId} not found`)
    }

    // Check if the currency is the default currency
    if (existingSettings.defaultCurrencyId === currencyId) {
      this.logger.error(`Cannot remove the default currency from accepted currencies`)
      throw new BadRequestException(`Cannot remove the default currency from accepted currencies`)
    }

    // Check if the currency is actually in the accepted currencies
    const isAccepted = existingSettings.acceptedCurrencies.some((c) => c.id === currencyId)
    if (!isAccepted) {
      this.logger.warn(`Currency with ID ${currencyId} is not in the accepted currencies for store with ID ${storeId}`)
      return existingSettings // Return existing settings without making changes
    }

    try {
      // Remove the currency from accepted currencies
      const result = await this.prisma.shopSettings.update({
        where: { storeId },
        data: {
          acceptedCurrencies: {
            disconnect: { id: currencyId },
          },
        },
        include: {
          store: true,
          defaultCurrency: true,
          acceptedCurrencies: true,
        },
      })

      this.logger.log(`Successfully removed accepted currency ${currencyId} from store: ${storeId}`)
      return result
    } catch (error) {
      this.logger.error(`Error removing accepted currency: ${error.message}`, error.stack)
      throw error
    }
  }
}
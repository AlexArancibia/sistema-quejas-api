import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import { CreateStoreDto } from "./dto/create-store.dto"
import { UpdateStoreDto } from "./dto/update-store.dto"
import { CreateApiKeyDto } from "./dto/create-api-key.dto"
import { v4 as uuidv4 } from "uuid"
import * as crypto from "crypto"

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new store
  async create(createStoreDto: CreateStoreDto) {
    // Check if the slug is already taken
    const existingStore = await this.prisma.store.findUnique({
      where: { slug: createStoreDto.slug },
    })

    if (existingStore) {
      throw new ConflictException(`A store with slug '${createStoreDto.slug}' already exists`)
    }

    // Check if the owner exists
    const owner = await this.prisma.user.findUnique({
      where: { id: createStoreDto.ownerId },
    })

    if (!owner) {
      throw new NotFoundException(`User with ID ${createStoreDto.ownerId} not found`)
    }

    // Create the store
    return this.prisma.store.create({
      data: createStoreDto,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        settings: true,
      },
    })
  }

  // Get all stores
  async findAll() {
    return this.prisma.store.findMany({
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        settings: true,
      },
    })
  }

  // Get all stores for a specific owner
  async findAllByOwner(ownerId: string) {
    return this.prisma.store.findMany({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        settings: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get a store by ID
  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        settings: true,
        categories: {
          where: { parentId: null }, // Only top-level categories
          include: {
            children: true,
          },
        },
        products: {
          take: 10, // Limit to 10 products
          orderBy: {
            createdAt: "desc",
          },
        },
        collections: {
          take: 10, // Limit to 10 collections
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`)
    }

    return store
  }

  // Get a store by slug
  async findBySlug(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        settings: true,
      },
    })

    if (!store) {
      throw new NotFoundException(`Store with slug '${slug}' not found`)
    }

    return store
  }

  // Update a store
  async update(id: string, updateStoreDto: UpdateStoreDto) {
    // Check if the store exists
    const existingStore = await this.prisma.store.findUnique({
      where: { id },
    })

    if (!existingStore) {
      throw new NotFoundException(`Store with ID ${id} not found`)
    }

    // If slug is being updated, check if the new slug is already taken
    if (updateStoreDto.slug && updateStoreDto.slug !== existingStore.slug) {
      const slugExists = await this.prisma.store.findUnique({
        where: { slug: updateStoreDto.slug },
      })

      if (slugExists) {
        throw new ConflictException(`A store with slug '${updateStoreDto.slug}' already exists`)
      }
    }

    // If owner is being updated, check if the new owner exists
    if (updateStoreDto.ownerId && updateStoreDto.ownerId !== existingStore.ownerId) {
      const owner = await this.prisma.user.findUnique({
        where: { id: updateStoreDto.ownerId },
      })

      if (!owner) {
        throw new NotFoundException(`User with ID ${updateStoreDto.ownerId} not found`)
      }
    }

    // Update the store
    return this.prisma.store.update({
      where: { id },
      data: updateStoreDto,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        settings: true,
      },
    })
  }

  // Delete a store
  async remove(id: string) {
    // Check if the store exists
    const existingStore = await this.prisma.store.findUnique({
      where: { id },
    })

    if (!existingStore) {
      throw new NotFoundException(`Store with ID ${id} not found`)
    }

    // Check if the store has orders
    const ordersCount = await this.prisma.order.count({
      where: { storeId: id },
    })

    if (ordersCount > 0) {
      throw new BadRequestException(
        `Cannot delete this store as it has ${ordersCount} orders. Consider deactivating it instead.`,
      )
    }

    // Delete the store
    return this.prisma.store.delete({
      where: { id },
    })
  }

  // Create a new API key for a store
  async createApiKey(createApiKeyDto: CreateApiKeyDto) {
    const { storeId, name, description } = createApiKeyDto

    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Generate a new API key
    const apiKey = `sk_${crypto.randomBytes(24).toString("hex")}`

    // Get existing API keys or initialize an empty array
    const existingApiKeys = (store.apiKeys as Record<string, any>[]) || []

    // Add the new API key
    const updatedApiKeys = [
      ...existingApiKeys,
      {
        id: uuidv4(),
        name,
        description,
        key: apiKey,
        createdAt: new Date().toISOString(),
      },
    ]

    // Update the store with the new API keys
    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        apiKeys: updatedApiKeys,
      },
    })

    // Return the newly created API key
    return {
      id: updatedApiKeys[updatedApiKeys.length - 1].id,
      name,
      description,
      key: apiKey,
      createdAt: updatedApiKeys[updatedApiKeys.length - 1].createdAt,
    }
  }

  // Get all API keys for a store
  async getApiKeys(storeId: string) {
    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Return the API keys (without the actual key values for security)
    const apiKeys = ((store.apiKeys as Record<string, any>[]) || []).map((key) => ({
      id: key.id,
      name: key.name,
      description: key.description,
      createdAt: key.createdAt,
      // Only return a masked version of the key
      key: key.key ? `${key.key.substring(0, 7)}...${key.key.substring(key.key.length - 4)}` : null,
    }))

    return apiKeys
  }

  // Delete an API key
  async deleteApiKey(storeId: string, keyId: string) {
    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Get existing API keys
    const existingApiKeys = (store.apiKeys as Record<string, any>[]) || []

    // Find the key to delete
    const keyIndex = existingApiKeys.findIndex((key) => key.id === keyId)

    if (keyIndex === -1) {
      throw new NotFoundException(`API key with ID ${keyId} not found`)
    }

    // Remove the key
    const updatedApiKeys = [...existingApiKeys.slice(0, keyIndex), ...existingApiKeys.slice(keyIndex + 1)]

    // Update the store with the updated API keys
    await this.prisma.store.update({
      where: { id: storeId },
      data: {
        apiKeys: updatedApiKeys,
      },
    })

    return { success: true }
  }

  // Verify an API key
  async verifyApiKey(apiKey: string) {
    // Find all stores
    const stores = await this.prisma.store.findMany()

    // Check each store for the API key
    for (const store of stores) {
      const storeApiKeys = (store.apiKeys as Record<string, any>[]) || []
      const matchingKey = storeApiKeys.find((key) => key.key === apiKey)

      if (matchingKey) {
        return {
          valid: true,
          storeId: store.id,
          storeName: store.name,
          keyId: matchingKey.id,
          keyName: matchingKey.name,
        }
      }
    }

    return { valid: false }
  }

  // Get store statistics
  async getStatistics(storeId: string) {
    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Get counts of various entities
    const [productsCount, categoriesCount, collectionsCount, ordersCount, customersCount, couponsCount, contentsCount] =
      await Promise.all([
        this.prisma.product.count({ where: { storeId } }),
        this.prisma.category.count({ where: { storeId } }),
        this.prisma.collection.count({ where: { storeId } }),
        this.prisma.order.count({ where: { storeId } }),
        this.prisma.order.groupBy({
          by: ["storeId"],
          where: { storeId },
          _count: {
            _all: true,
          },
        }),
        this.prisma.coupon.count({ where: { storeId } }),
        this.prisma.content.count({ where: { storeId } }),
      ])

    // Get recent orders
    const recentOrders = await this.prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        currency: true,
      },
    })

    // Calculate total revenue
    const totalRevenue = await this.prisma.order.aggregate({
      where: {
        storeId,
        financialStatus: "PAID",
      },
      _sum: {
        totalPrice: true,
      },
    })

    return {
      productsCount,
      categoriesCount,
      collectionsCount,
      ordersCount,
      customersCount: customersCount.length > 0 ? customersCount[0]._count._all : 0,
      couponsCount,
      contentsCount,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      recentOrders,
    }
  }
}

import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import   { PrismaService } from "../prisma/prisma.service"
import   { CreateCollectionDto } from "./dto/create-collection.dto"
import   { UpdateCollectionDto } from "./dto/update-collection.dto"

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  // Create a new collection
  async create(createCollectionDto: CreateCollectionDto) {
    // Extract productIds from the DTO
    const { productIds, ...collectionData } = createCollectionDto

    // Check if the slug already exists for this store
    const existingCollection = await this.prisma.collection.findUnique({
      where: {
        storeId_slug: {
          storeId: collectionData.storeId,
          slug: collectionData.slug,
        },
      },
    })

    if (existingCollection) {
      throw new BadRequestException(`A collection with slug '${collectionData.slug}' already exists in this store`)
    }

    // Create the collection with connected products if productIds are provided
    return this.prisma.collection.create({
      data: {
        ...collectionData,
        // Connect products if productIds are provided
        ...(productIds && productIds.length > 0
          ? {
              products: {
                connect: productIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: {
        products: true,
      },
    })
  }

  // Get all collections
  async findAll() {
    return this.prisma.collection.findMany({
      include: {
        products: true,
      },
    })
  }

  // Get all collections for a specific store
  async findAllByStore(storeId: string) {
    return this.prisma.collection.findMany({
      where: { storeId },
      include: {
        products: true,
      },
    })
  }

  // Get a collection by ID
  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        products: true,
      },
    })

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`)
    }

    return collection
  }

  // Update a collection
 async update(id: string, updateCollectionDto: UpdateCollectionDto) {
    console.log("=== UPDATE COLLECTION START ===")
    console.log(`Updating collection with ID: ${id}`)
    console.log("Update DTO received:", JSON.stringify(updateCollectionDto, null, 2))

    // Extract productIds from the DTO
    const { productIds, ...collectionData } = updateCollectionDto

    console.log("Extracted productIds:", productIds)
    console.log("Remaining collection data:", JSON.stringify(collectionData, null, 2))

    try {
      // Check if the collection exists
      console.log("Checking if collection exists...")
      const existingCollection = await this.prisma.collection.findUnique({
        where: { id },
        include: { products: true },
      })

      if (!existingCollection) {
        console.log(`Collection with ID ${id} not found`)
        throw new NotFoundException(`Collection with ID ${id} not found`)
      }

      console.log(
        "Existing collection found:",
        JSON.stringify(
          {
            id: existingCollection.id,
            title: existingCollection.title,
            slug: existingCollection.slug,
            productCount: existingCollection.products?.length || 0,
          },
          null,
          2,
        ),
      )

      // If slug is being updated, check if the new slug already exists for this store
      if (collectionData.slug && collectionData.slug !== existingCollection.slug) {
        console.log(`Checking if slug '${collectionData.slug}' already exists...`)
        const slugExists = await this.prisma.collection.findUnique({
          where: {
            storeId_slug: {
              storeId: existingCollection.storeId,
              slug: collectionData.slug,
            },
          },
        })

        if (slugExists && slugExists.id !== id) {
          console.log(`Slug '${collectionData.slug}' already exists for another collection`)
          throw new BadRequestException(`A collection with slug '${collectionData.slug}' already exists in this store`)
        }
      }

      // Prepare the update data
      const updateData: any = { ...collectionData }

      // Handle products relationship if productIds is provided
      if (productIds !== undefined) {
        console.log("Setting products with IDs:", productIds)
        updateData.products = {
          set: productIds.map((id) => ({ id })),
        }
      }

      console.log("Final Prisma update data:", JSON.stringify(updateData, null, 2))

      // Update the collection
      const updatedCollection = await this.prisma.collection.update({
        where: { id },
        data: updateData,
        include: {
          products: true,
        },
      })

      console.log("Collection updated successfully")
      console.log(
        "Updated collection:",
        JSON.stringify(
          {
            id: updatedCollection.id,
            title: updatedCollection.title,
            productCount: updatedCollection.products?.length || 0,
          },
          null,
          2,
        ),
      )
      console.log("=== UPDATE COLLECTION END ===")

      return updatedCollection
    } catch (error) {
      console.error("Error updating collection:", error)
      console.log("=== UPDATE COLLECTION ERROR ===")
      throw error
    }
  }

  // Delete a collection
  async remove(id: string) {
    // Check if the collection exists
    const existingCollection = await this.prisma.collection.findUnique({
      where: { id },
    })

    if (!existingCollection) {
      throw new NotFoundException(`Collection with ID ${id} not found`)
    }

    // Check if the collection has products
    const productsCount = await this.prisma.product.count({
      where: {
        collections: {
          some: {
            id,
          },
        },
      },
    })

    // We'll allow deletion even if there are products, but we'll disconnect the products first
    if (productsCount > 0) {
      // Disconnect all products from this collection
      await this.prisma.collection.update({
        where: { id },
        data: {
          products: {
            set: [], // Remove all product connections
          },
        },
      })
    }

    // Delete the collection
    return this.prisma.collection.delete({
      where: { id },
    })
  }

  // Add a product to a collection
  async addProduct(collectionId: string, productId: string) {
    // Check if the collection exists
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    })

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`)
    }

    // Check if the product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    // Check if the product and collection belong to the same store
    if (product.storeId !== collection.storeId) {
      throw new BadRequestException("Product and collection must belong to the same store")
    }

    // Add the product to the collection
    return this.prisma.collection.update({
      where: { id: collectionId },
      data: {
        products: {
          connect: { id: productId },
        },
      },
      include: {
        products: true,
      },
    })
  }

  // Remove a product from a collection
  async removeProduct(collectionId: string, productId: string) {
    // Check if the collection exists
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    })

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`)
    }

    // Check if the product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    // Remove the product from the collection
    return this.prisma.collection.update({
      where: { id: collectionId },
      data: {
        products: {
          disconnect: { id: productId },
        },
      },
      include: {
        products: true,
      },
    })
  }
}

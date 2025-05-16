import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { CreateProductVariantDto } from "./dto/create-product-variant.dto"
import { UpdateProductVariantDto } from "./dto/update-product-variant.dto"
import { CreateVariantPriceDto } from "./dto/create-variant-price.dto"
import { UpdateVariantPriceDto } from "./dto/update-variant-price.dto"
import { SearchProductDto } from "./dto/search-product.dto"
import { ProductStatus } from "@prisma/client"

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // Create a new product
  async create(createProductDto: CreateProductDto) {
    const { categoryIds, collectionIds, variants, ...productData } = createProductDto

    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: productData.storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${productData.storeId} not found`)
    }

    // Check if the slug already exists for this store
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        storeId_slug: {
          storeId: productData.storeId,
          slug: productData.slug,
        },
      },
    })

    if (existingProduct) {
      throw new ConflictException(`A product with slug '${productData.slug}' already exists in this store`)
    }

    // Prepare connections for categories and collections if provided
    const data: any = { ...productData }

    if (categoryIds?.length) {
      // Verify all categories exist and belong to the store
      const categories = await this.prisma.category.findMany({
        where: {
          id: { in: categoryIds },
          storeId: productData.storeId,
        },
      })

      if (categories.length !== categoryIds.length) {
        throw new BadRequestException("One or more categories do not exist or do not belong to this store")
      }

      data.categories = {
        connect: categoryIds.map((id) => ({ id })),
      }
    }

    if (collectionIds?.length) {
      // Verify all collections exist and belong to the store
      const collections = await this.prisma.collection.findMany({
        where: {
          id: { in: collectionIds },
          storeId: productData.storeId,
        },
      })

      if (collections.length !== collectionIds.length) {
        throw new BadRequestException("One or more collections do not exist or do not belong to this store")
      }

      data.collections = {
        connect: collectionIds.map((id) => ({ id })),
      }
    }

    // Format variants properly for Prisma
    if (variants?.length) {
      data.variants = {
        create: variants.map((variant) => {
          const { prices, ...variantData } = variant

          // Handle nested prices if they exist
          if (prices?.length) {
            return {
              ...variantData,
              prices: {
                create: prices,
              },
            }
          }

          return variantData
        }),
      }
    }

    try {
      // Create the product using a transaction to ensure all related data is created or rolled back
      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data,
          include: {
            categories: true,
            collections: true,
            variants: {
              include: {
                prices: {
                  include: {
                    currency: true,
                  },
                },
              },
            },
          },
        })

        return product
      })
    } catch (error) {
      // Provide more detailed error messages for common Prisma errors
      if (error.code === "P2002") {
        throw new ConflictException("A unique constraint would be violated. Check for duplicate values.")
      } else if (error.code === "P2003") {
        throw new BadRequestException("Foreign key constraint failed. Check that all referenced IDs exist.")
      } else if (error.code === "P2025") {
        throw new NotFoundException("Record not found. Check that all referenced IDs exist.")
      }

      // Log the detailed error for debugging
      console.error("Product creation error:", error)

      // Re-throw the error with a more user-friendly message
      throw new BadRequestException(`Failed to create product: ${error.message}`)
    }
  }

  // Get all products with pagination and filtering
  async findAll(searchParams: SearchProductDto) {
    const {
      query,
      storeId,
      status,
      vendor,
      categoryIds,
      collectionIds,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = searchParams

    // Build the where clause
    const where: any = {}

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { vendor: { contains: query, mode: "insensitive" } },
      ]
    }

    if (storeId) {
      where.storeId = storeId
    }

    if (status?.length) {
      where.status = { in: status }
    }

    if (vendor) {
      where.vendor = vendor
    }

    if (categoryIds?.length) {
      where.categories = {
        some: {
          id: { in: categoryIds },
        },
      }
    }

    if (collectionIds?.length) {
      where.collections = {
        some: {
          id: { in: collectionIds },
        },
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Determine sort order
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Get total count for pagination
    const totalCount = await this.prisma.product.count({ where })

    // Get products with pagination and sorting
    const products = await this.prisma.product.findMany({
      where,
      include: {
        categories: true,
        collections: true,
        variants: {
          include: {
            prices: {
              include: {
                currency: true,
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    })

    return {
      data: products,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  }

  // Get all products for a specific store
  async findAllByStore(storeId: string, searchParams: Omit<SearchProductDto, "storeId">) {
    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Add storeId to search params
    return this.findAll({ ...searchParams, storeId })
  }

  // Get a product by ID
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
        collections: true,
        variants: {
          include: {
            prices: {
              include: {
                currency: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    return product
  }

  // Get a product by slug for a specific store
  async findBySlug(storeId: string, slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        storeId_slug: {
          storeId,
          slug,
        },
      },
      include: {
        categories: true,
        collections: true,
        variants: {
          include: {
            prices: {
              include: {
                currency: true,
              },
            },
          },
        },
      },
    })

    if (!product) {
      throw new NotFoundException(`Product with slug '${slug}' not found in this store`)
    }

    return product
  }

  // Update a product
  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryIds, collectionIds, variants, ...productData } = updateProductDto

    // Check if the product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    // Prepare update data
    const data: any = { ...productData }

    // Update category connections if provided
    if (categoryIds !== undefined) {
      data.categories = {
        set: categoryIds.map((id) => ({ id })),
      }
    }

    // Update collection connections if provided
    if (collectionIds !== undefined) {
      data.collections = {
        set: collectionIds.map((id) => ({ id })),
      }
    }

    try {
      // Use a transaction to update the product and its variants
      return await this.prisma.$transaction(async (tx) => {
        // Update the product first
        const updatedProduct = await tx.product.update({
          where: { id },
          data,
          include: {
            categories: true,
            collections: true,
          },
        })

        // Handle variants update if provided
        if (variants && variants.length > 0) {
          // Delete all existing variant prices
          await tx.variantPrice.deleteMany({
            where: {
              variant: {
                productId: id,
              },
            },
          })

          // Delete all existing variants
          await tx.productVariant.deleteMany({
            where: { productId: id },
          })

          // Create new variants
          for (const variant of variants) {
            const { prices, id: variantId, productId, createdAt, updatedAt, ...cleanVariantData } = variant as any

            // Create new variant
            const newVariant = await tx.productVariant.create({
              data: {
                ...cleanVariantData,
                product: { connect: { id } },
              },
            })

            // Create prices if provided
            if (prices && prices.length > 0) {
              for (const price of prices) {
                await tx.variantPrice.create({
                  data: {
                    price: price.price,
                    variant: { connect: { id: newVariant.id } },
                    currency: { connect: { id: price.currencyId } },
                  },
                })
              }
            }
          }
        }

        // Fetch the complete updated product with variants and prices
        return tx.product.findUnique({
          where: { id },
          include: {
            categories: true,
            collections: true,
            variants: {
              include: {
                prices: {
                  include: {
                    currency: true,
                  },
                },
              },
            },
          },
        })
      })
    } catch (error) {
      console.error("Product update error:", error)
      throw new BadRequestException(`Failed to update product: ${error.message}`)
    }
  }

  // Update product status
  async updateStatus(id: string, status: ProductStatus) {
    // Check if the product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    // Update the product status
    return this.prisma.product.update({
      where: { id },
      data: { status },
      include: {
        categories: true,
        collections: true,
        variants: {
          include: {
            prices: {
              include: {
                currency: true,
              },
            },
          },
        },
      },
    })
  }

  // Delete a product
  async remove(id: string) {
    // Check if the product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            orderItems: true,
          },
        },
      },
    })

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    // Check if any variant has been ordered
    const hasOrders = existingProduct.variants.some((variant) => variant.orderItems.length > 0)
    if (hasOrders) {
      throw new BadRequestException(
        `Cannot delete product with ID ${id} as it has variants that have been ordered. Consider archiving it instead.`,
      )
    }

    try {
      // Use a transaction to ensure all related data is deleted
      return await this.prisma.$transaction(async (tx) => {
        // Delete all variant prices
        for (const variant of existingProduct.variants) {
          await tx.variantPrice.deleteMany({
            where: { variantId: variant.id },
          })
        }

        // Delete all variants
        await tx.productVariant.deleteMany({
          where: { productId: id },
        })

        // Delete the product
        return tx.product.delete({
          where: { id },
        })
      })
    } catch (error) {
      console.error("Product deletion error:", error)
      throw new BadRequestException(`Failed to delete product: ${error.message}`)
    }
  }

  // Create a product variant
  async createVariant(productId: string, createProductVariantDto: CreateProductVariantDto) {
    const { prices, ...variantData } = createProductVariantDto

    // Check if the product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`)
    }

    try {
      // Use a transaction to create the variant and its prices
      return await this.prisma.$transaction(async (tx) => {
        // Create the variant
        const variant = await tx.productVariant.create({
          data: {
            ...variantData,
            product: {
              connect: { id: productId },
            },
          },
          include: {
            product: true,
          },
        })

        // Create prices if provided
        if (prices?.length) {
          for (const price of prices) {
            await tx.variantPrice.create({
              data: {
                price: price.price,
                variant: {
                  connect: { id: variant.id },
                },
                currency: {
                  connect: { id: price.currencyId },
                },
              },
            })
          }
        }

        // Fetch the complete variant with prices
        return tx.productVariant.findUnique({
          where: { id: variant.id },
          include: {
            product: true,
            prices: {
              include: {
                currency: true,
              },
            },
          },
        })
      })
    } catch (error) {
      console.error("Variant creation error:", error)
      throw new BadRequestException(`Failed to create variant: ${error.message}`)
    }
  }

  // Get a product variant by ID
  async findVariant(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: true,
        prices: {
          include: {
            currency: true,
          },
        },
      },
    })

    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`)
    }

    return variant
  }

  // Update a product variant
  async updateVariant(id: string, updateProductVariantDto: UpdateProductVariantDto, productId?: string) {
    const { prices, ...variantData } = updateProductVariantDto

    // Check if the variant exists
    const existingVariant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        prices: true,
      },
    })

    if (!existingVariant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`)
    }

    // If productId is provided, check if the new product exists
    if (productId && productId !== existingVariant.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      })

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`)
      }
    }

    // Prepare update data
    const data: any = { ...variantData }

    // Connect product if provided
    if (productId) {
      data.product = {
        connect: { id: productId },
      }
    }

    try {
      // Use a transaction to update the variant and its prices
      return await this.prisma.$transaction(async (tx) => {
        // Update the variant
        const updatedVariant = await tx.productVariant.update({
          where: { id },
          data,
        })

        // Update prices if provided
        if (prices) {
          // First, delete existing prices
          await tx.variantPrice.deleteMany({
            where: { variantId: id },
          })

          // Then create new prices
          for (const price of prices) {
            await tx.variantPrice.create({
              data: {
                price: price.price,
                variant: {
                  connect: { id },
                },
                currency: {
                  connect: { id: price.currencyId },
                },
              },
            })
          }
        }

        // Fetch the complete updated variant with prices
        return tx.productVariant.findUnique({
          where: { id },
          include: {
            product: true,
            prices: {
              include: {
                currency: true,
              },
            },
          },
        })
      })
    } catch (error) {
      console.error("Variant update error:", error)
      throw new BadRequestException(`Failed to update variant: ${error.message}`)
    }
  }

  // Delete a product variant
  async removeVariant(id: string) {
    // Check if the variant exists
    const existingVariant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    })

    if (!existingVariant) {
      throw new NotFoundException(`Product variant with ID ${id} not found`)
    }

    // Check if the variant has been ordered
    if (existingVariant.orderItems.length > 0) {
      throw new BadRequestException(
        `Cannot delete variant with ID ${id} as it has been ordered. Consider deactivating it instead.`,
      )
    }

    try {
      // Use a transaction to delete the variant and its prices
      return await this.prisma.$transaction(async (tx) => {
        // Delete all variant prices
        await tx.variantPrice.deleteMany({
          where: { variantId: id },
        })

        // Delete the variant
        return tx.productVariant.delete({
          where: { id },
        })
      })
    } catch (error) {
      console.error("Variant deletion error:", error)
      throw new BadRequestException(`Failed to delete variant: ${error.message}`)
    }
  }

  // Create a variant price
  async createVariantPrice(createVariantPriceDto: CreateVariantPriceDto) {
    const { variantId, currencyId, ...priceData } = createVariantPriceDto

    // Check if the variant exists
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    })

    if (!variant) {
      throw new NotFoundException(`Product variant with ID ${variantId} not found`)
    }

    // Check if the currency exists
    const currency = await this.prisma.currency.findUnique({
      where: { id: currencyId },
    })

    if (!currency) {
      throw new NotFoundException(`Currency with ID ${currencyId} not found`)
    }

    // Check if a price already exists for this variant and currency
    const existingPrice = await this.prisma.variantPrice.findUnique({
      where: {
        variantId_currencyId: {
          variantId,
          currencyId,
        },
      },
    })

    if (existingPrice) {
      throw new ConflictException(`A price already exists for this variant and currency`)
    }

    // Create the price
    return this.prisma.variantPrice.create({
      data: {
        ...priceData,
        variant: {
          connect: { id: variantId },
        },
        currency: {
          connect: { id: currencyId },
        },
      },
      include: {
        variant: true,
        currency: true,
      },
    })
  }

  // Get a variant price by ID
  async findVariantPrice(id: string) {
    const price = await this.prisma.variantPrice.findUnique({
      where: { id },
      include: {
        variant: true,
        currency: true,
      },
    })

    if (!price) {
      throw new NotFoundException(`Variant price with ID ${id} not found`)
    }

    return price
  }

  // Update a variant price
  async updateVariantPrice(id: string, updateVariantPriceDto: UpdateVariantPriceDto) {
    const { variantId, currencyId, ...priceData } = updateVariantPriceDto

    // Check if the price exists
    const existingPrice = await this.prisma.variantPrice.findUnique({
      where: { id },
    })

    if (!existingPrice) {
      throw new NotFoundException(`Variant price with ID ${id} not found`)
    }

    // If variantId is being updated, check if the new variant exists
    if (variantId && variantId !== existingPrice.variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
      })

      if (!variant) {
        throw new NotFoundException(`Product variant with ID ${variantId} not found`)
      }
    }

    // If currencyId is being updated, check if the new currency exists
    if (currencyId && currencyId !== existingPrice.currencyId) {
      const currency = await this.prisma.currency.findUnique({
        where: { id: currencyId },
      })

      if (!currency) {
        throw new NotFoundException(`Currency with ID ${currencyId} not found`)
      }

      // Check if a price already exists for this variant and currency
      const newVarId = variantId || existingPrice.variantId
      const priceExists = await this.prisma.variantPrice.findUnique({
        where: {
          variantId_currencyId: {
            variantId: newVarId,
            currencyId,
          },
        },
      })

      if (priceExists && priceExists.id !== id) {
        throw new ConflictException(`A price already exists for this variant and currency`)
      }
    }

    // Prepare update data
    const data: any = { ...priceData }

    // Connect variant if provided
    if (variantId) {
      data.variant = {
        connect: { id: variantId },
      }
    }

    // Connect currency if provided
    if (currencyId) {
      data.currency = {
        connect: { id: currencyId },
      }
    }

    // Update the price
    return this.prisma.variantPrice.update({
      where: { id },
      data,
      include: {
        variant: true,
        currency: true,
      },
    })
  }

  // Delete a variant price
  async removeVariantPrice(id: string) {
    // Check if the price exists
    const existingPrice = await this.prisma.variantPrice.findUnique({
      where: { id },
    })

    if (!existingPrice) {
      throw new NotFoundException(`Variant price with ID ${id} not found`)
    }

    // Delete the price
    return this.prisma.variantPrice.delete({
      where: { id },
    })
  }

  // Increment product view count
  async incrementViewCount(id: string) {
    // Check if the product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }

    // Increment the view count
    return this.prisma.product.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })
  }

  // Get product statistics for a store
  async getStatisticsByStore(storeId: string) {
    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Get product counts by status
    const [totalProducts, activeProducts, draftProducts, archivedProducts, totalVariants, lowStockVariants] =
      await Promise.all([
        this.prisma.product.count({ where: { storeId } }),
        this.prisma.product.count({
          where: {
            storeId,
            status: ProductStatus.ACTIVE,
          },
        }),
        this.prisma.product.count({
          where: {
            storeId,
            status: ProductStatus.DRAFT,
          },
        }),
        this.prisma.product.count({
          where: {
            storeId,
            status: ProductStatus.ARCHIVED,
          },
        }),
        this.prisma.productVariant.count({
          where: {
            product: {
              storeId,
            },
          },
        }),
        this.prisma.productVariant.count({
          where: {
            product: {
              storeId,
            },
            inventoryQuantity: {
              lte: 5, // Consider low stock if 5 or fewer items
            },
          },
        }),
      ])

    // Get most viewed products
    const mostViewedProducts = await this.prisma.product.findMany({
      where: {
        storeId,
        viewCount: {
          gt: 0,
        },
      },
      orderBy: {
        viewCount: "desc",
      },
      take: 5,
      include: {
        variants: {
          include: {
            prices: {
              include: {
                currency: true,
              },
            },
          },
        },
      },
    })

    // Get recently added products
    const recentProducts = await this.prisma.product.findMany({
      where: { storeId },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        variants: {
          include: {
            prices: {
              include: {
                currency: true,
              },
            },
          },
        },
      },
    })

    return {
      totalProducts,
      activeProducts,
      draftProducts,
      archivedProducts,
      totalVariants,
      lowStockVariants,
      mostViewedProducts,
      recentProducts,
    }
  }
}

import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, CreateProductVariantDto } from './dto/create-product.dto'; // Eliminado CreateProductPriceDto
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { categoryIds, collectionIds, variants, ...productData } = createProductDto; // Eliminado prices

    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Crear el producto
        const product = await prisma.product.create({
          data: {
            ...productData,
            categories: {
              connect: categoryIds?.map(id => ({ id })),
            },
            collections: {
              connect: collectionIds?.map(id => ({ id })),
            },
          },
          include: {
            categories: true,
            collections: true,
          },
        });

        // Crear variantes del producto
        if (variants && variants.length > 0) {
          await this.createProductVariants(prisma, product.id, variants);
        }

        // Obtener el producto completo con relaciones
        return this.getFullProduct(prisma, product.id);
      });
    } catch (error) {
      this.handlePrismaError(error, 'Error creating product');
    }
  }

  private async createProductVariants(prisma: any, productId: string, variants: CreateProductVariantDto[]) {
    try {
      await Promise.all(
        variants.map(async variant => {
          const createdVariant = await prisma.productVariant.create({
            data: {
              productId,
              ...variant,
              prices: {
                create: variant.prices.map(price => ({
                  currencyId: price.currencyId,
                  price: price.price
                }))
              }
            }
          });
          return createdVariant;
        })
      );
    } catch (error) {
      this.logger.error(`Error creating variants: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error creating product variants');
    }
  }

  async findAll() {
    try {
      return await this.prisma.product.findMany({
        include: this.getProductIncludes(),
      });
    } catch (error) {
      this.logger.error(`Error finding products: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error retrieving products');
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: this.getProductIncludes(),
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      this.handlePrismaError(error, `Error finding product with id ${id}`);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryIds, collectionIds, variants, ...productData } = updateProductDto;

    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Actualizar el producto
        await prisma.product.update({
          where: { id },
          data: {
            ...productData,
            categories: categoryIds ? { set: categoryIds.map(id => ({ id })) } : undefined,
            collections: collectionIds ? { set: collectionIds.map(id => ({ id })) } : undefined,
          },
        });

        // Actualizar variantes
        if (variants) {
          await this.handleVariantUpdates(prisma, id, variants);
        }

        return this.getFullProduct(prisma, id);
      });
    } catch (error) {
      this.handlePrismaError(error, `Error updating product with id ${id}`);
    }
  }

  private async handleVariantUpdates(prisma: any, productId: string, variants: CreateProductVariantDto[]) {
    // Eliminar variantes y precios existentes
    await prisma.variantPrice.deleteMany({
      where: { variant: { productId } }
    });
    
    await prisma.productVariant.deleteMany({
      where: { productId }
    });

    // Crear nuevas variantes
    await this.createProductVariants(prisma, productId, variants);
  }

  async remove(id: string) {
    try {
      await this.prisma.$transaction(async (prisma) => {
        // Eliminar precios de variantes primero
        await prisma.variantPrice.deleteMany({
          where: { variant: { productId: id } }
        });

        // Eliminar variantes
        await prisma.productVariant.deleteMany({
          where: { productId: id }
        });

        // Finalmente eliminar el producto
        await prisma.product.delete({
          where: { id }
        });
      });
    } catch (error) {
      this.handlePrismaError(error, `Error deleting product with id ${id}`);
    }
  }

  private getProductIncludes() {
    return {
      categories: true,
      collections: true,
      variants: {
        include: {
          prices: {
            include: {
              currency: true
            }
          }
        }
      }
    };
  }

  private async getFullProduct(prisma: any, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: this.getProductIncludes(),
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return product;
  }

  private handlePrismaError(error: any, contextMessage: string) {
    this.logger.error(`${contextMessage}: ${error.message}`, error.stack);
    
    if (error.code === 'P2002') {
      throw new ConflictException('Product with this slug already exists');
    }
    
    if (error.code === 'P2025') {
      throw new NotFoundException(error.meta?.cause || 'Resource not found');
    }

    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new InternalServerErrorException(contextMessage);
  }
}
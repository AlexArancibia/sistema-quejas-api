import { Injectable, NotFoundException } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"
import { Prisma } from "@prisma/client"
import { CreateFrequentlyBoughtTogetherDto } from "./dto/create-fbt.dto"
import { UpdateFrequentlyBoughtTogetherDto } from "./dto/update-fbt.dto"

@Injectable()
export class FrequentlyBoughtTogetherService {
  constructor(private prisma: PrismaService) {}

  async create(createFrequentlyBoughtTogetherDto: CreateFrequentlyBoughtTogetherDto) {
    // Verificar si la tienda existe
    const store = await this.prisma.store.findUnique({
      where: { id: createFrequentlyBoughtTogetherDto.storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${createFrequentlyBoughtTogetherDto.storeId} not found`)
    }

    // Verificar que las variantes existan y pertenezcan a la tienda
    if (createFrequentlyBoughtTogetherDto.variantIds.length > 0) {
      const variants = await this.prisma.productVariant.findMany({
        where: {
          id: { in: createFrequentlyBoughtTogetherDto.variantIds },
          product: {
            storeId: createFrequentlyBoughtTogetherDto.storeId,
          },
        },
      })

      if (variants.length !== createFrequentlyBoughtTogetherDto.variantIds.length) {
        throw new NotFoundException("One or more variants do not exist or do not belong to this store")
      }
    }

    // Crear el grupo de productos frecuentemente comprados juntos
    return this.prisma.frequentlyBoughtTogether.create({
      data: {
        name: createFrequentlyBoughtTogetherDto.name,
        discountName: createFrequentlyBoughtTogetherDto.discountName,
        discount: createFrequentlyBoughtTogetherDto.discount
          ? new Prisma.Decimal(createFrequentlyBoughtTogetherDto.discount)
          : null,
        store: {
          connect: { id: createFrequentlyBoughtTogetherDto.storeId },
        },
        variants: {
          connect: createFrequentlyBoughtTogetherDto.variantIds.map((id) => ({ id })),
        },
      },
      include: {
        variants: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrls: true,
              },
            },
            prices: {
              include: {
                currency: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async findAll() {
    return this.prisma.frequentlyBoughtTogether.findMany({
      include: {
        variants: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrls: true,
              },
            },
            prices: {
              include: {
                currency: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async findAllByStore(storeId: string) {
    // Verificar si la tienda existe
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    return this.prisma.frequentlyBoughtTogether.findMany({
      where: { storeId },
      include: {
        variants: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrls: true,
              },
            },
            prices: {
              include: {
                currency: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async findOne(id: string) {
    const frequentlyBoughtTogether = await this.prisma.frequentlyBoughtTogether.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrls: true,
              },
            },
            prices: {
              include: {
                currency: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!frequentlyBoughtTogether) {
      throw new NotFoundException(`FrequentlyBoughtTogether with ID ${id} not found`)
    }

    return frequentlyBoughtTogether
  }

  async update(id: string, updateFrequentlyBoughtTogetherDto: UpdateFrequentlyBoughtTogetherDto) {
    // Verificar si el grupo existe
    const existingGroup = await this.prisma.frequentlyBoughtTogether.findUnique({
      where: { id },
    })

    if (!existingGroup) {
      throw new NotFoundException(`FrequentlyBoughtTogether with ID ${id} not found`)
    }

    // Si se proporciona un nuevo storeId, verificar que la tienda exista
    if (updateFrequentlyBoughtTogetherDto.storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: updateFrequentlyBoughtTogetherDto.storeId },
      })

      if (!store) {
        throw new NotFoundException(`Store with ID ${updateFrequentlyBoughtTogetherDto.storeId} not found`)
      }
    }

    // Verificar que las variantes existan y pertenezcan a la tienda si se proporcionan
    if (updateFrequentlyBoughtTogetherDto.variantIds && updateFrequentlyBoughtTogetherDto.variantIds.length > 0) {
      const storeId = updateFrequentlyBoughtTogetherDto.storeId || existingGroup.storeId
      const variants = await this.prisma.productVariant.findMany({
        where: {
          id: { in: updateFrequentlyBoughtTogetherDto.variantIds },
          product: {
            storeId: storeId,
          },
        },
      })

      if (variants.length !== updateFrequentlyBoughtTogetherDto.variantIds.length) {
        throw new NotFoundException("One or more variants do not exist or do not belong to this store")
      }
    }

    // Actualizar el grupo
    return this.prisma.frequentlyBoughtTogether.update({
      where: { id },
      data: {
        name: updateFrequentlyBoughtTogetherDto.name,
        discountName: updateFrequentlyBoughtTogetherDto.discountName,
        discount:
          updateFrequentlyBoughtTogetherDto.discount !== undefined
            ? new Prisma.Decimal(updateFrequentlyBoughtTogetherDto.discount)
            : undefined,
        storeId: updateFrequentlyBoughtTogetherDto.storeId,
        ...(updateFrequentlyBoughtTogetherDto.variantIds && {
          variants: {
            set: [], // Primero desconectar todas las variantes existentes
            connect: updateFrequentlyBoughtTogetherDto.variantIds.map((id) => ({ id })), // Luego conectar las nuevas
          },
        }),
      },
      include: {
        variants: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                imageUrls: true,
              },
            },
            prices: {
              include: {
                currency: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async remove(id: string) {
    // Verificar si el grupo existe
    const frequentlyBoughtTogether = await this.prisma.frequentlyBoughtTogether.findUnique({
      where: { id },
    })

    if (!frequentlyBoughtTogether) {
      throw new NotFoundException(`FrequentlyBoughtTogether with ID ${id} not found`)
    }

    // Eliminar el grupo (las relaciones con variantes se eliminarán automáticamente)
    return this.prisma.frequentlyBoughtTogether.delete({
      where: { id },
    })
  }
}

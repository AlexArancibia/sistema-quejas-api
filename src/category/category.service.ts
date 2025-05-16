import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import   { CreateCategoryDto } from "./dto/create-category.dto"
import   { UpdateCategoryDto } from "./dto/update-category.dto"

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva categoría
  async create(createCategoryDto: CreateCategoryDto) {
    const { parentId, ...categoryData } = createCategoryDto

    // Verificar si el slug ya existe para esta tienda
    const existingCategory = await this.prisma.category.findUnique({
      where: {
        storeId_slug: {
          storeId: createCategoryDto.storeId,
          slug: createCategoryDto.slug,
        },
      },
    })

    if (existingCategory) {
      throw new BadRequestException(`A category with slug '${createCategoryDto.slug}' already exists in this store`)
    }

    // Verificar si la categoría padre existe si se proporciona
    if (parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: parentId },
      })

      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID ${parentId} not found`)
      }

      // Verificar que la categoría padre pertenezca a la misma tienda
      if (parentCategory.storeId !== createCategoryDto.storeId) {
        throw new BadRequestException("Parent category must belong to the same store")
      }

      // Crear categoría con parentId
      return this.prisma.category.create({
        data: {
          ...categoryData,
          parentId, // Usar parentId directamente en lugar de parent.connect
        },
        include: {
          parent: true,
          children: true,
          products: true,
        },
      })
    }

    // Crear categoría sin parentId
    return this.prisma.category.create({
      data: categoryData,
      include: {
        parent: true,
        children: true,
        products: true,
      },
    })
  }

  // Obtener todas las categorías
  async findAll() {
    return this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        products: true,
      },
    })
  }

  // Obtener todas las categorías de una tienda específica
  async findAllByStore(storeId: string) {
    return this.prisma.category.findMany({
      where: { storeId },
      include: {
        parent: true,
        children: true,
        products: true,
      },
    })
  }

  // Obtener una categoría por ID
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: true,
      },
    })

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    return category
  }

  // Actualizar una categoría
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { parentId, ...categoryData } = updateCategoryDto

    // Verificar si la categoría existe
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    // Si se proporciona un nuevo parentId, verificar que exista
    if (parentId) {
      // Verificar que no sea el mismo ID (no puede ser su propio padre)
      if (parentId === id) {
        throw new BadRequestException("A category cannot be its own parent")
      }

      const parentCategory = await this.prisma.category.findUnique({
        where: { id: parentId },
      })

      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID ${parentId} not found`)
      }

      // Verificar que el nuevo padre pertenezca a la misma tienda
      if (parentCategory.storeId !== existingCategory.storeId) {
        throw new BadRequestException("Parent category must belong to the same store")
      }

      // Verificar que no sea uno de sus descendientes
      const isDescendant = await this.isDescendant(id, parentId)
      if (isDescendant) {
        throw new BadRequestException("Cannot set a descendant category as parent")
      }

      // Actualizar con parentId
      return this.prisma.category.update({
        where: { id },
        data: {
          ...categoryData,
          parentId, // Usar parentId directamente
        },
        include: {
          parent: true,
          children: true,
          products: true,
        },
      })
    }

    // Actualizar sin cambiar el parentId
    return this.prisma.category.update({
      where: { id },
      data: categoryData,
      include: {
        parent: true,
        children: true,
        products: true,
      },
    })
  }

  // Verificar si una categoría es descendiente de otra
  private async isDescendant(ancestorId: string, possibleDescendantId: string): Promise<boolean> {
    const possibleDescendant = await this.prisma.category.findUnique({
      where: { id: possibleDescendantId },
      include: { parent: true },
    })

    if (!possibleDescendant || !possibleDescendant.parentId) {
      return false
    }

    if (possibleDescendant.parentId === ancestorId) {
      return true
    }

    return this.isDescendant(ancestorId, possibleDescendant.parentId)
  }

  // Eliminar una categoría
  async remove(id: string) {
    // Verificar si la categoría existe
    const existingCategory = await this.prisma.category.findUnique({ where: { id } })
    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    // Verificar si la categoría tiene hijos
    const childrenCount = await this.prisma.category.count({
      where: { parentId: id },
    })

    if (childrenCount > 0) {
      throw new BadRequestException("Cannot delete a category with child categories")
    }

    // Verificar si la categoría tiene productos asociados
    const productsCount = await this.prisma.product.count({
      where: {
        categories: {
          some: {
            id,
          },
        },
      },
    })

    if (productsCount > 0) {
      throw new BadRequestException("Cannot delete a category with associated products")
    }

    return this.prisma.category.delete({
      where: { id },
    })
  }
}

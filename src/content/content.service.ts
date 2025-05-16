import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import   { CreateContentDto } from "./dto/create-content.dto"
import   { UpdateContentDto } from "./dto/update-content.dto"
import   { ContentType } from "@prisma/client"

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // Create new content
  async create(createContentDto: CreateContentDto) {
    // Check if the slug already exists for this store
    const existingContent = await this.prisma.content.findUnique({
      where: {
        storeId_slug: {
          storeId: createContentDto.storeId,
          slug: createContentDto.slug,
        },
      },
    })

    if (existingContent) {
      throw new BadRequestException(`Content with slug '${createContentDto.slug}' already exists in this store`)
    }

    // If content is published, set publishedAt date
    if (createContentDto.published && !createContentDto.publishedAt) {
      createContentDto.publishedAt = new Date()
    }

    // Create the content
    return this.prisma.content.create({
      data: createContentDto,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    })
  }

  // Get all content
  async findAll() {
    return this.prisma.content.findMany({
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    })
  }

  // Get all content for a specific store
  async findAllByStore(
    storeId: string,
    options?: {
      type?: ContentType
      published?: boolean
      category?: string
    },
  ) {
    const where: any = { storeId }

    // Add optional filters
    if (options?.type) {
      where.type = options.type
    }

    if (options?.published !== undefined) {
      where.published = options.published
    }

    if (options?.category) {
      where.category = options.category
    }

    return this.prisma.content.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get content by ID
  async findOne(id: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`)
    }

    return content
  }

  // Get content by slug for a specific store
  async findBySlug(storeId: string, slug: string) {
    const content = await this.prisma.content.findUnique({
      where: {
        storeId_slug: {
          storeId,
          slug,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!content) {
      throw new NotFoundException(`Content with slug '${slug}' not found in this store`)
    }

    return content
  }

  // Update content
  async update(id: string, updateContentDto: UpdateContentDto) {
    // Check if the content exists
    const existingContent = await this.prisma.content.findUnique({
      where: { id },
    })

    if (!existingContent) {
      throw new NotFoundException(`Content with ID ${id} not found`)
    }

    // If slug is being updated, check if the new slug already exists for this store
    if (updateContentDto.slug && updateContentDto.slug !== existingContent.slug) {
      const slugExists = await this.prisma.content.findUnique({
        where: {
          storeId_slug: {
            storeId: existingContent.storeId,
            slug: updateContentDto.slug,
          },
        },
      })

      if (slugExists) {
        throw new BadRequestException(`Content with slug '${updateContentDto.slug}' already exists in this store`)
      }
    }

    // If content is being published and doesn't have a publishedAt date, set it
    if (updateContentDto.published && !existingContent.published && !updateContentDto.publishedAt) {
      updateContentDto.publishedAt = new Date()
    }

    // Update the content
    return this.prisma.content.update({
      where: { id },
      data: updateContentDto,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    })
  }

  // Publish or unpublish content
  async togglePublished(id: string, publish: boolean) {
    // Check if the content exists
    const existingContent = await this.prisma.content.findUnique({
      where: { id },
    })

    if (!existingContent) {
      throw new NotFoundException(`Content with ID ${id} not found`)
    }

    // Set publishedAt date if publishing for the first time
    const publishedAt = publish && !existingContent.publishedAt ? new Date() : existingContent.publishedAt

    // Update the content
    return this.prisma.content.update({
      where: { id },
      data: {
        published: publish,
        publishedAt,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    })
  }

  // Delete content
  async remove(id: string) {
    // Check if the content exists
    const existingContent = await this.prisma.content.findUnique({
      where: { id },
    })

    if (!existingContent) {
      throw new NotFoundException(`Content with ID ${id} not found`)
    }

    // Delete the content
    return this.prisma.content.delete({
      where: { id },
    })
  }
}

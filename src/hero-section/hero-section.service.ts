import { Injectable, NotFoundException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import { CreateHeroSectionDto } from "./dto/create-hero-section.dto"
import { UpdateHeroSectionDto } from "./dto/update-hero-section.dto"

@Injectable()
export class HeroSectionService {
  constructor(private prisma: PrismaService) {}

  // Create a new hero section
  async create(createHeroSectionDto: CreateHeroSectionDto) {
    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: createHeroSectionDto.storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${createHeroSectionDto.storeId} not found`)
    }

    // Create the hero section
    return this.prisma.heroSection.create({
      data: createHeroSectionDto,
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
  }

  // Get all hero sections
  async findAll() {
    return this.prisma.heroSection.findMany({
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
  }

  // Get all hero sections for a specific store
  async findAllByStore(storeId: string, includeInactive = false) {
    const where: any = { storeId }

    if (!includeInactive) {
      where.isActive = true
    }

    return this.prisma.heroSection.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get a hero section by ID
  async findOne(id: string) {
    const heroSection = await this.prisma.heroSection.findUnique({
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

    if (!heroSection) {
      throw new NotFoundException(`Hero section with ID ${id} not found`)
    }

    return heroSection
  }

  // Update a hero section
  async update(id: string, updateHeroSectionDto: UpdateHeroSectionDto) {
  console.log('🔧 updateHeroSection called with ID:', id)
  console.log('📦 updateHeroSectionDto:', JSON.stringify(updateHeroSectionDto, null, 2))

  // Verificar si existe la sección
  const existingHeroSection = await this.prisma.heroSection.findUnique({
    where: { id },
  })

  console.log('🔍 existingHeroSection:', existingHeroSection)

  if (!existingHeroSection) {
    console.warn(`⚠️ Hero section with ID ${id} not found`)
    throw new NotFoundException(`Hero section with ID ${id} not found`)
  }

  // Validar nuevo storeId si es distinto al actual
  if (
    updateHeroSectionDto.storeId &&
    updateHeroSectionDto.storeId !== existingHeroSection.storeId
  ) {
    console.log('🔁 Checking existence of new storeId:', updateHeroSectionDto.storeId)

    const store = await this.prisma.store.findUnique({
      where: { id: updateHeroSectionDto.storeId },
    })

    if (!store) {
      console.warn(`⚠️ Store with ID ${updateHeroSectionDto.storeId} not found`)
      throw new NotFoundException(`Store with ID ${updateHeroSectionDto.storeId} not found`)
    }
  }

  // Realizar el update
  console.log('✅ Updating heroSection...')
  const updatedHeroSection = await this.prisma.heroSection.update({
    where: { id },
    data: updateHeroSectionDto,
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

  console.log('✅ Updated heroSection:', updatedHeroSection)

  return updatedHeroSection
}


  // Toggle the active status of a hero section
  async toggleActive(id: string, isActive: boolean) {
    // Check if the hero section exists
    const existingHeroSection = await this.prisma.heroSection.findUnique({
      where: { id },
    })

    if (!existingHeroSection) {
      throw new NotFoundException(`Hero section with ID ${id} not found`)
    }

    // Update the active status
    return this.prisma.heroSection.update({
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
      },
    })
  }

  // Delete a hero section
  async remove(id: string) {
    // Check if the hero section exists
    const existingHeroSection = await this.prisma.heroSection.findUnique({
      where: { id },
    })

    if (!existingHeroSection) {
      throw new NotFoundException(`Hero section with ID ${id} not found`)
    }

    // Delete the hero section
    return this.prisma.heroSection.delete({
      where: { id },
    })
  }

  // Get the active hero section for a store
  async getActiveHeroSection(storeId: string) {
    // Check if the store exists
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`)
    }

    // Get the active hero section
    const heroSection = await this.prisma.heroSection.findFirst({
      where: {
        storeId,
        isActive: true,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    if (!heroSection) {
      throw new NotFoundException(`No active hero section found for store with ID ${storeId}`)
    }

    return heroSection
  }
}

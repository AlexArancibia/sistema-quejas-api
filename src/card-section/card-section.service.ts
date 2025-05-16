import { Injectable, NotFoundException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import  { CreateCardSectionDto } from "./dto/create-card-section.dto"
import  { UpdateCardSectionDto } from "./dto/update-card-section.dto"

@Injectable()
export class CardSectionService {
  constructor(private prisma: PrismaService) {}

  async create(createCardSectionDto: CreateCardSectionDto) {
    // Verificar si la tienda existe
    const store = await this.prisma.store.findUnique({
      where: { id: createCardSectionDto.storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${createCardSectionDto.storeId} not found`)
    }

    return this.prisma.cardSection.create({
      data: {
        title: createCardSectionDto.title,
        subtitle: createCardSectionDto.subtitle,
        description: createCardSectionDto.description,
        isActive: createCardSectionDto.isActive ?? true,
        store: {
          connect: { id: createCardSectionDto.storeId },
        },
        cards: {
          create: createCardSectionDto.cards.map((card) => ({
            title: card.title,
            subtitle: card.subtitle,
            description: card.description,
            imageUrl: card.imageUrl,
            linkUrl: card.linkUrl,
            buttonText: card.buttonText,
          })),
        },
      },
      include: {
        cards: true,
        store: true,
      },
    })
  }

  async findAll() {
    return this.prisma.cardSection.findMany({
      include: {
        cards: true,
        store: true,
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

    return this.prisma.cardSection.findMany({
      where: { storeId },
      include: {
        cards: true,
      },
    })
  }

  async findOne(id: string) {
    const cardSection = await this.prisma.cardSection.findUnique({
      where: { id },
      include: {
        cards: true,
        store: true,
      },
    })

    if (!cardSection) {
      throw new NotFoundException(`CardSection with ID ${id} not found`)
    }

    return cardSection
  }

  async update(id: string, updateCardSectionDto: UpdateCardSectionDto) {
    // Verificar si la sección de tarjetas existe
    const existingCardSection = await this.prisma.cardSection.findUnique({
      where: { id },
      include: { cards: true },
    })

    if (!existingCardSection) {
      throw new NotFoundException(`CardSection with ID ${id} not found`)
    }

    // Si se proporciona un nuevo storeId, verificar que la tienda exista
    if (updateCardSectionDto.storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: updateCardSectionDto.storeId },
      })

      if (!store) {
        throw new NotFoundException(`Store with ID ${updateCardSectionDto.storeId} not found`)
      }
    }

    // Actualizar la sección de tarjetas
    const { cards, ...sectionData } = updateCardSectionDto

    // Actualizar la sección principal
    const updatedSection = await this.prisma.cardSection.update({
      where: { id },
      data: sectionData,
      include: {
        cards: true,
        store: true,
      },
    })

    // Si se proporcionan nuevas tarjetas, actualizar las tarjetas
    if (cards && cards.length > 0) {
      // Eliminar todas las tarjetas existentes
      await this.prisma.card.deleteMany({
        where: { cardSectionId: id },
      })

      // Crear las nuevas tarjetas
      await this.prisma.card.createMany({
        data: cards.map((card) => ({
          title: card.title,
          subtitle: card.subtitle,
          description: card.description,
          imageUrl: card.imageUrl,
          linkUrl: card.linkUrl,
          buttonText: card.buttonText,
          cardSectionId: id,
        })),
      })

      // Obtener la sección actualizada con las nuevas tarjetas
      return this.findOne(id)
    }

    return updatedSection
  }

  async remove(id: string) {
    // Verificar si la sección de tarjetas existe
    const cardSection = await this.prisma.cardSection.findUnique({
      where: { id },
      include: { cards: true },
    })

    if (!cardSection) {
      throw new NotFoundException(`CardSection with ID ${id} not found`)
    }

    // Eliminar todas las tarjetas asociadas
    await this.prisma.card.deleteMany({
      where: { cardSectionId: id },
    })

    // Eliminar la sección de tarjetas
    return this.prisma.cardSection.delete({
      where: { id },
    })
  }
}

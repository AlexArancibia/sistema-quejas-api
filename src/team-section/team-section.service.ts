import { Injectable, NotFoundException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import  { CreateTeamSectionDto } from "./dto/create-team-section.dto"
import  { UpdateTeamSectionDto } from "./dto/update-team-section.dto"

@Injectable()
export class TeamSectionService {
  constructor(private prisma: PrismaService) {}

  async create(createTeamSectionDto: CreateTeamSectionDto) {
    // Verificar si la tienda existe
    const store = await this.prisma.store.findUnique({
      where: { id: createTeamSectionDto.storeId },
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${createTeamSectionDto.storeId} not found`)
    }

    // Crear la sección de equipo
    return this.prisma.teamSection.create({
      data: {
        title: createTeamSectionDto.title,
        subtitle: createTeamSectionDto.subtitle,
        description: createTeamSectionDto.description,
        isActive: createTeamSectionDto.isActive ?? true,
        backgroundColor: createTeamSectionDto.backgroundColor,
        textColor: createTeamSectionDto.textColor,
        store: {
          connect: { id: createTeamSectionDto.storeId },
        },
        members: {
          create: createTeamSectionDto.members.map((member) => ({
            name: member.name,
            position: member.position,
            bio: member.bio,
            imageUrl: member.imageUrl,
            socialLinks: member.socialLinks,
          })),
        },
      },
      include: {
        members: true,
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
    return this.prisma.teamSection.findMany({
      include: {
        members: true,
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

    return this.prisma.teamSection.findMany({
      where: { storeId },
      include: {
        members: true,
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
    const teamSection = await this.prisma.teamSection.findUnique({
      where: { id },
      include: {
        members: true,
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!teamSection) {
      throw new NotFoundException(`TeamSection with ID ${id} not found`)
    }

    return teamSection
  }

  async update(id: string, updateTeamSectionDto: UpdateTeamSectionDto) {
    // Verificar si la sección de equipo existe
    const existingTeamSection = await this.prisma.teamSection.findUnique({
      where: { id },
      include: { members: true },
    })

    if (!existingTeamSection) {
      throw new NotFoundException(`TeamSection with ID ${id} not found`)
    }

    // Si se proporciona un nuevo storeId, verificar que la tienda exista
    if (updateTeamSectionDto.storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: updateTeamSectionDto.storeId },
      })

      if (!store) {
        throw new NotFoundException(`Store with ID ${updateTeamSectionDto.storeId} not found`)
      }
    }

    // Actualizar la sección de equipo
    // Nota: Para actualizar los miembros, primero eliminamos los existentes y luego creamos los nuevos
    if (updateTeamSectionDto.members) {
      // Eliminar todos los miembros existentes
      await this.prisma.teamMember.deleteMany({
        where: { teamSectionId: id },
      })
    }

    return this.prisma.teamSection.update({
      where: { id },
      data: {
        title: updateTeamSectionDto.title,
        subtitle: updateTeamSectionDto.subtitle,
        description: updateTeamSectionDto.description,
        isActive: updateTeamSectionDto.isActive,
        backgroundColor: updateTeamSectionDto.backgroundColor,
        textColor: updateTeamSectionDto.textColor,
        storeId: updateTeamSectionDto.storeId,
        ...(updateTeamSectionDto.members && {
          members: {
            create: updateTeamSectionDto.members.map((member) => ({
              name: member.name,
              position: member.position,
              bio: member.bio,
              imageUrl: member.imageUrl,
              socialLinks: member.socialLinks,
            })),
          },
        }),
      },
      include: {
        members: true,
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
    // Verificar si la sección de equipo existe
    const teamSection = await this.prisma.teamSection.findUnique({
      where: { id },
    })

    if (!teamSection) {
      throw new NotFoundException(`TeamSection with ID ${id} not found`)
    }

    // Eliminar la sección de equipo (los miembros se eliminarán en cascada)
    return this.prisma.teamSection.delete({
      where: { id },
    })
  }
}

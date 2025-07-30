import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateInstructorDto } from "./dto/create-instructor.dto"
import { UpdateInstructorDto } from "./dto/update-instructor.dto"

@Injectable()
export class InstructorsService {
  constructor(private prisma: PrismaService) {}

  async create(createInstructorDto: CreateInstructorDto) {
    try {
      const instructor = await this.prisma.instructor.create({
        data: {
          ...createInstructorDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              ratings: true,
            },
          },
        },
      })

      return instructor
    } catch (error) {
      throw new InternalServerErrorException("Error creating instructor: " + error.message)
    }
  }

  async findAll(isActive?: boolean) {
    try {
      const where: any = {}

      if (isActive !== undefined) {
        where.isActive = isActive
      }

      return await this.prisma.instructor.findMany({
        where,
        include: {
          _count: {
            select: {
              ratings: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      })
    } catch (error) {
      throw new InternalServerErrorException("Error fetching instructors: " + error.message)
    }
  }

  async findOne(id: string) {
    try {
      const instructor = await this.prisma.instructor.findUnique({
        where: { id },
        include: {
          ratings: {
            orderBy: {
              createdAt: "desc",
            },
            take: 10, // Últimas 10 calificaciones
          },
          _count: {
            select: {
              ratings: true,
            },
          },
        },
      })

      if (!instructor) {
        throw new NotFoundException(`Instructor with ID ${id} not found`)
      }

      return instructor
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error fetching instructor: " + error.message)
    }
  }

  async getInstructorRatings(id: string) {
    try {
      const instructor = await this.prisma.instructor.findUnique({
        where: { id },
      })

      if (!instructor) {
        throw new NotFoundException(`Instructor with ID ${id} not found`)
      }

      const ratings = await this.prisma.rating.findMany({
        where: { instructorId: id },
        include: {
          branch: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      // Calcular estadísticas
      const stats = {
        totalRatings: ratings.length,
        averageInstructorRating:
          ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.instructorRating, 0) / ratings.length : 0,
        averageOverallRating:
          ratings.length > 0
            ? ratings.reduce(
                (sum, r) =>
                  sum +
                  (r.instructorRating +
                    r.cleanlinessRating +
                    r.audioRating +
                    r.attentionQualityRating +
                    r.amenitiesRating +
                    r.punctualityRating) /
                    6,
                0,
              ) / ratings.length
            : 0,
        averageNPS: ratings.length > 0 ? ratings.reduce((sum, r) => sum + Number(r.npsScore), 0) / ratings.length : 0,
      }

      return {
        ratings,
        stats,
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error fetching instructor ratings: " + error.message)
    }
  }

  async update(id: string, updateInstructorDto: UpdateInstructorDto) {
    try {
      const updatedInstructor = await this.prisma.instructor.update({
        where: { id },
        data: {
          ...updateInstructorDto,
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              ratings: true,
            },
          },
        },
      })

      return updatedInstructor
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Instructor with ID ${id} not found`)
      }
      throw new InternalServerErrorException("Error updating instructor: " + error.message)
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.instructor.delete({
        where: { id },
      })

      return { message: "Instructor deleted successfully" }
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Instructor with ID ${id} not found`)
      }
      throw new InternalServerErrorException("Error deleting instructor: " + error.message)
    }
  }
}

import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateRatingDto } from "./dto/create-rating.dto"
import { UpdateRatingDto } from "./dto/update-rating.dto"

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(createRatingDto: CreateRatingDto) {
    try {
      // Verificar que el instructor y la sucursal existen
      const [instructorExists, branchExists] = await Promise.all([
        this.prisma.instructor.findUnique({
          where: { id: createRatingDto.instructorId },
        }),
        this.prisma.branch.findUnique({
          where: { id: createRatingDto.branchId },
        }),
      ])

      if (!instructorExists) {
        throw new NotFoundException(`Instructor with ID ${createRatingDto.instructorId} not found`)
      }

      if (!branchExists) {
        throw new NotFoundException(`Branch with ID ${createRatingDto.branchId} not found`)
      }

      const rating = await this.prisma.rating.create({
        data: {
          ...createRatingDto,
          createdAt: new Date(),
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              discipline: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return rating
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error creating rating: " + error.message)
    }
  }

  async findAll(branchId?: string, instructorId?: string, page = 1, limit = 10) {
    try {
      const where: any = {}

      if (branchId) {
        where.branchId = branchId
      }

      if (instructorId) {
        where.instructorId = instructorId
      }

      const skip = (page - 1) * limit

      const [ratings, total] = await Promise.all([
        this.prisma.rating.findMany({
          where,
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                discipline: true,
              },
            },
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
        }),
        this.prisma.rating.count({ where }),
      ])

      return {
        data: ratings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      throw new InternalServerErrorException("Error fetching ratings: " + error.message)
    }
  }

  async getStats(branchId?: string, instructorId?: string) {
    try {
      const where: any = {}

      if (branchId) {
        where.branchId = branchId
      }

      if (instructorId) {
        where.instructorId = instructorId
      }

      const ratings = await this.prisma.rating.findMany({
        where,
        select: {
          instructorRating: true,
          cleanlinessRating: true,
          audioRating: true,
          attentionQualityRating: true,
          amenitiesRating: true,
          punctualityRating: true,
          npsScore: true,
        },
      })

      if (ratings.length === 0) {
        return {
          totalRatings: 0,
          averages: {
            instructor: 0,
            cleanliness: 0,
            audio: 0,
            attentionQuality: 0,
            amenities: 0,
            punctuality: 0,
            overall: 0,
            nps: 0,
          },
        }
      }

      const averages = {
        instructor: ratings.reduce((sum, r) => sum + r.instructorRating, 0) / ratings.length,
        cleanliness: ratings.reduce((sum, r) => sum + r.cleanlinessRating, 0) / ratings.length,
        audio: ratings.reduce((sum, r) => sum + r.audioRating, 0) / ratings.length,
        attentionQuality: ratings.reduce((sum, r) => sum + r.attentionQualityRating, 0) / ratings.length,
        amenities: ratings.reduce((sum, r) => sum + r.amenitiesRating, 0) / ratings.length,
        punctuality: ratings.reduce((sum, r) => sum + r.punctualityRating, 0) / ratings.length,
        nps: ratings.reduce((sum, r) => sum + Number(r.npsScore), 0) / ratings.length,
      }

      averages["overall"] =
        (averages.instructor +
          averages.cleanliness +
          averages.audio +
          averages.attentionQuality +
          averages.amenities +
          averages.punctuality) /
        6

      return {
        totalRatings: ratings.length,
        averages: Object.fromEntries(
          Object.entries(averages).map(([key, value]) => [key, Math.round(value * 100) / 100]),
        ),
      }
    } catch (error) {
      throw new InternalServerErrorException("Error fetching rating stats: " + error.message)
    }
  }

  async getAnalytics(branchId?: string) {
    try {
      const where = branchId ? { branchId } : {}

      // Obtener ratings agrupados por instructor
      const instructorRatings = await this.prisma.rating.groupBy({
        by: ["instructorId", "instructorName"],
        where,
        _avg: {
          instructorRating: true,
          cleanlinessRating: true,
          audioRating: true,
          attentionQualityRating: true,
          amenitiesRating: true,
          punctualityRating: true,
          npsScore: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
      })

      // Obtener distribución de ratings por categoría
      const ratings = await this.prisma.rating.findMany({
        where,
        select: {
          instructorRating: true,
          cleanlinessRating: true,
          audioRating: true,
          attentionQualityRating: true,
          amenitiesRating: true,
          punctualityRating: true,
          npsScore: true,
          createdAt: true,
        },
      })

      // Calcular distribución de ratings (1-5 estrellas)
      const distribution = {
        instructor: [0, 0, 0, 0, 0],
        cleanliness: [0, 0, 0, 0, 0],
        audio: [0, 0, 0, 0, 0],
        attentionQuality: [0, 0, 0, 0, 0],
        amenities: [0, 0, 0, 0, 0],
        punctuality: [0, 0, 0, 0, 0],
      }

      ratings.forEach((rating) => {
        distribution.instructor[rating.instructorRating - 1]++
        distribution.cleanliness[rating.cleanlinessRating - 1]++
        distribution.audio[rating.audioRating - 1]++
        distribution.attentionQuality[rating.attentionQualityRating - 1]++
        distribution.amenities[rating.amenitiesRating - 1]++
        distribution.punctuality[rating.punctualityRating - 1]++
      })

      return {
        instructorRatings: instructorRatings.map((ir) => ({
          instructorId: ir.instructorId,
          instructorName: ir.instructorName,
          totalRatings: ir._count.id,
          averages: {
            instructor: Math.round((ir._avg.instructorRating || 0) * 100) / 100,
            cleanliness: Math.round((ir._avg.cleanlinessRating || 0) * 100) / 100,
            audio: Math.round((ir._avg.audioRating || 0) * 100) / 100,
            attentionQuality: Math.round((ir._avg.attentionQualityRating || 0) * 100) / 100,
            amenities: Math.round((ir._avg.amenitiesRating || 0) * 100) / 100,
            punctuality: Math.round((ir._avg.punctualityRating || 0) * 100) / 100,
            nps: Math.round((Number(ir._avg.npsScore) || 0) * 100) / 100,
          },
        })),
        distribution,
        totalRatings: ratings.length,
      }
    } catch (error) {
      throw new InternalServerErrorException("Error fetching rating analytics: " + error.message)
    }
  }

  async findOne(id: string) {
    try {
      const rating = await this.prisma.rating.findUnique({
        where: { id },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              discipline: true,
              email: true,
              phone: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      })

      if (!rating) {
        throw new NotFoundException(`Rating with ID ${id} not found`)
      }

      return rating
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error fetching rating: " + error.message)
    }
  }

  async update(id: string, updateRatingDto: UpdateRatingDto) {
    try {
      const updatedRating = await this.prisma.rating.update({
        where: { id },
        data: updateRatingDto,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              discipline: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return updatedRating
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Rating with ID ${id} not found`)
      }
      throw new InternalServerErrorException("Error updating rating: " + error.message)
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.rating.delete({
        where: { id },
      })

      return { message: "Rating deleted successfully" }
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Rating with ID ${id} not found`)
      }
      throw new InternalServerErrorException("Error deleting rating: " + error.message)
    }
  }
}

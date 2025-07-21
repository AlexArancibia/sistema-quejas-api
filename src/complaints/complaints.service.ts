import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateComplaintDto } from "./dto/create-complaint.dto"
import { UpdateComplaintDto } from "./dto/update-complaint.dto"
import { ComplaintPriority, ComplaintStatus } from "@prisma/client"

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  async create(createComplaintDto: CreateComplaintDto) {
    try {
      // Verificar que la sucursal existe
      const branchExists = await this.prisma.branch.findUnique({
        where: { id: createComplaintDto.branchId },
      })

      if (!branchExists) {
        throw new NotFoundException(`Branch with ID ${createComplaintDto.branchId} not found`)
      }

      const complaint = await this.prisma.complaint.create({
        data: {
          ...createComplaintDto,
          attachments: createComplaintDto.attachments || [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      })

      return complaint
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error creating complaint: " + error.message)
    }
  }

  async findAll(branchId?: string, status?: ComplaintStatus, priority?: ComplaintPriority, startDate?: string, endDate?: string, page = 1, limit = 10) {
    try {
      const where: any = {}

      if (branchId) {
        where.branchId = branchId
      }

      if (status) {
        where.status = status
      }

      if (priority) {
        where.priority = priority
      }

      // Filtro por rango de fechas
      if (startDate || endDate) {
        where.createdAt = {}
        
        if (startDate) {
          where.createdAt.gte = new Date(startDate)
        }
        
        if (endDate) {
          // Agregar 23:59:59.999 para incluir todo el día final
          const endDateTime = new Date(endDate)
          endDateTime.setHours(23, 59, 59, 999)
          where.createdAt.lte = endDateTime
        }
      }

      const skip = (page - 1) * limit

      const [complaints, total] = await Promise.all([
        this.prisma.complaint.findMany({
          where,
          include: {
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
        this.prisma.complaint.count({ where }),
      ])

      return {
        data: complaints,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      throw new InternalServerErrorException("Error fetching complaints: " + error.message)
    }
  }

  async getStats(branchId?: string, startDate?: string, endDate?: string) {
    try {
      const where: any = branchId ? { branchId } : {}

      // Filtro por rango de fechas
      if (startDate || endDate) {
        where.createdAt = {}
        
        if (startDate) {
          where.createdAt.gte = new Date(startDate)
        }
        
        if (endDate) {
          // Agregar 23:59:59.999 para incluir todo el día final
          const endDateTime = new Date(endDate)
          endDateTime.setHours(23, 59, 59, 999)
          where.createdAt.lte = endDateTime
        }
      }

      const [
        totalComplaints,
        pendingComplaints,
        inProcessComplaints,
        resolvedComplaints,
        rejectedComplaints,
        highPriorityComplaints,
        mediumPriorityComplaints,
        lowPriorityComplaints,
      ] = await Promise.all([
        this.prisma.complaint.count({ where }),
        this.prisma.complaint.count({ where: { ...where, status: "PENDING" } }),
        this.prisma.complaint.count({ where: { ...where, status: "IN_PROGRESS" } }),
        this.prisma.complaint.count({ where: { ...where, status: "RESOLVED" } }),
        this.prisma.complaint.count({ where: { ...where, status: "REJECTED" } }),
        this.prisma.complaint.count({ where: { ...where, priority: "HIGH" } }),
        this.prisma.complaint.count({ where: { ...where, priority: "MEDIUM" } }),
        this.prisma.complaint.count({ where: { ...where, priority: "LOW" } }),
      ])

      return {
        total: totalComplaints,
        byStatus: {
          pending: pendingComplaints,
          inProcess: inProcessComplaints,
          resolved: resolvedComplaints,
          rejected: rejectedComplaints,
        },
        byPriority: {
          high: highPriorityComplaints,
          medium: mediumPriorityComplaints,
          low: lowPriorityComplaints,
        },
        resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0,
      }
    } catch (error) {
      throw new InternalServerErrorException("Error fetching complaint stats: " + error.message)
    }
  }

  async findOne(id: string) {
    try {
      const complaint = await this.prisma.complaint.findUnique({
        where: { id },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              email: true,
            },
          },
        },
      })

      if (!complaint) {
        throw new NotFoundException(`Complaint with ID ${id} not found`)
      }

      return complaint
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error fetching complaint: " + error.message)
    }
  }

  async update(id: string, updateComplaintDto: UpdateComplaintDto) {
    try {
      const updatedComplaint = await this.prisma.complaint.update({
        where: { id },
        data: {
          ...updateComplaintDto,
          updatedAt: new Date(),
        },
        include: {
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return updatedComplaint
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Complaint with ID ${id} not found`)
      }
      throw new InternalServerErrorException("Error updating complaint: " + error.message)
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.complaint.delete({
        where: { id },
      })

      return { message: "Complaint deleted successfully" }
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Complaint with ID ${id} not found`)
      }
      throw new InternalServerErrorException("Error deleting complaint: " + error.message)
    }
  }
}

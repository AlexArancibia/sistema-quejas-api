import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateBranchDto } from "./dto/create-branch.dto"
import { UpdateBranchDto } from "./dto/update-branch.dto"

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    try {
      console.log("XDD", createBranchDto)
      const branch = await this.prisma.branch.create({
        data: {
          ...createBranchDto,
        },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              instructors: true,
              complaints: true,
              ratings: true,
            },
          },
        },
      })

      return branch
    } catch (error) {
      throw new InternalServerErrorException("Error creating branch: " + error.message)
    }
  }

  async findAll(isActive?: boolean) {
    try {
      const where = isActive !== undefined ? { isActive } : {}

      return await this.prisma.branch.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              instructors: true,
              complaints: true,
              ratings: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } catch (error) {
      throw new InternalServerErrorException("Error fetching branches: " + error.message)
    }
  }

  async findOne(id: string) {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          instructors: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              discipline: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              complaints: true,
              ratings: true,
            },
          },
        },
      })

      if (!branch) {
        throw new NotFoundException(`Branch with ID ${id} not found`)
      }

      return branch
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error fetching branch: " + error.message)
    }
  }

  async getBranchUsers(id: string) {
    try {
      const branch = await this.prisma.branch.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              phone: true,
              isActive: true,
              lastLogin: true,
              createdAt: true,
            },
          },
        },
      })

      if (!branch) {
        throw new NotFoundException(`Branch with ID ${id} not found`)
      }

      return branch.users
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error fetching branch users: " + error.message)
    }
  }

  async getBranchInstructors(id: string) {
    try {
      const instructors = await this.prisma.instructor.findMany({
        where: { branchId: id },
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

      return instructors
    } catch (error) {
      throw new InternalServerErrorException("Error fetching branch instructors: " + error.message)
    }
  }

  async getBranchComplaints(id: string, status?: string) {
    try {
      const where: any = { branchId: id }
      if (status) {
        where.status = status
      }

      const complaints = await this.prisma.complaint.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      })

      return complaints
    } catch (error) {
      throw new InternalServerErrorException("Error fetching branch complaints: " + error.message)
    }
  }

  async getBranchRatings(id: string) {
    try {
      const ratings = await this.prisma.rating.findMany({
        where: { branchId: id },
        include: {
          instructor: {
            select: {
              name: true,
              discipline: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return ratings
    } catch (error) {
      throw new InternalServerErrorException("Error fetching branch ratings: " + error.message)
    }
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    try {
      const updatedBranch = await this.prisma.branch.update({
        where: { id },
        data: {
          ...updateBranchDto,
          updatedAt: new Date(),
        },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              instructors: true,
              complaints: true,
              ratings: true,
            },
          },
        },
      })

      return updatedBranch
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Branch with ID ${id} not found`)
      }
      throw new InternalServerErrorException("Error updating branch: " + error.message)
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.branch.delete({
        where: { id },
      })

      return { message: "Branch deleted successfully" }
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Branch with ID ${id} not found`)
      }
      throw new InternalServerErrorException("Error deleting branch: " + error.message)
    }
  }
}

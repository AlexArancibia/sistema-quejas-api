import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreasService {
  constructor(private prisma: PrismaService) {}

  async create(createAreaDto: CreateAreaDto) {
    try {
      // Verificar si ya existe un área con el mismo nombre
      const existingArea = await this.prisma.area.findUnique({
        where: { name: createAreaDto.name },
      });

      if (existingArea) {
        throw new ConflictException(`Area with name "${createAreaDto.name}" already exists`);
      }

      const area = await this.prisma.area.create({
        data: {
          ...createAreaDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              complaints: true,
            },
          },
        },
      });

      return area;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating area: ' + error.message);
    }
  }

  async findAll(isActive?: boolean) {
    try {
      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      return await this.prisma.area.findMany({
        where,
        include: {
          _count: {
            select: {
              complaints: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching areas: ' + error.message);
    }
  }

  async findOne(id: string) {
    try {
      const area = await this.prisma.area.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              complaints: true,
            },
          },
        },
      });

      if (!area) {
        throw new NotFoundException(`Area with ID ${id} not found`);
      }

      return area;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching area: ' + error.message);
    }
  }

  async update(id: string, updateAreaDto: UpdateAreaDto) {
    try {
      // Verificar si el área existe
      const existingArea = await this.prisma.area.findUnique({
        where: { id },
      });

      if (!existingArea) {
        throw new NotFoundException(`Area with ID ${id} not found`);
      }

      // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
      if (updateAreaDto.name && updateAreaDto.name !== existingArea.name) {
        const nameExists = await this.prisma.area.findUnique({
          where: { name: updateAreaDto.name },
        });

        if (nameExists) {
          throw new ConflictException(`Area with name "${updateAreaDto.name}" already exists`);
        }
      }

      const updatedArea = await this.prisma.area.update({
        where: { id },
        data: {
          ...updateAreaDto,
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              complaints: true,
            },
          },
        },
      });

      return updatedArea;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating area: ' + error.message);
    }
  }

  async remove(id: string) {
    try {
      // Verificar si el área existe
      const existingArea = await this.prisma.area.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              complaints: true,
            },
          },
        },
      });

      if (!existingArea) {
        throw new NotFoundException(`Area with ID ${id} not found`);
      }

      // Verificar si hay quejas asociadas
      if (existingArea._count.complaints > 0) {
        throw new ConflictException(
          `Cannot delete area "${existingArea.name}" because it has ${existingArea._count.complaints} associated complaints. Please reassign or delete the complaints first.`
        );
      }

      await this.prisma.area.delete({
        where: { id },
      });

      return { message: 'Area deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting area: ' + error.message);
    }
  }

}

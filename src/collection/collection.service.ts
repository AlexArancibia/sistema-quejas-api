import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async create(createCollectionDto: CreateCollectionDto) {
    const { productIds, ...collectionData } = createCollectionDto;

    console.log('Creating collection with data:', collectionData);
    console.log('Linking products:', productIds);

    try {
      const createdCollection = await this.prisma.collection.create({
        data: {
          ...collectionData,
          products: {
            connect: productIds.map(id => ({ id })),
          },
        },
        include: {
          products: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });

      console.log('Collection created successfully:', createdCollection);
      return createdCollection;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw new Error('Failed to create collection'); // Re-throw a more generic error for the client
    }
  }

  async findAll() {
    return this.prisma.collection.findMany({
      include: {
        products: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    return collection;
  }

  async update(id: string, updateCollectionDto: UpdateCollectionDto) {
    const { productIds, ...updateData } = updateCollectionDto;

    try {
      const updatedCollection = await this.prisma.collection.update({
        where: { id },
        data: {
          ...updateData,
          products: productIds ? {
            set: productIds.map(id => ({ id })),
          } : undefined,
        },
        include: {
          products: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });

      return updatedCollection;
    } catch (error) {
      console.error('Error updating collection:', error);
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.collection.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }
  }

  async addProductToCollection(collectionId: string, productId: string) {
    try {
      return await this.prisma.collection.update({
        where: { id: collectionId },
        data: {
          products: {
            connect: { id: productId },
          },
        },
        include: {
          products: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException(`Collection or Product not found`);
    }
  }

  async removeProductFromCollection(collectionId: string, productId: string) {
    try {
      return await this.prisma.collection.update({
        where: { id: collectionId },
        data: {
          products: {
            disconnect: { id: productId },
          },
        },
        include: {
          products: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException(`Collection or Product not found`);
    }
  }
}


import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';

@Injectable()
export class ShippingMethodsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      console.log('DEBUG: Buscando todos los métodos de envío');
      
      const methods = await this.prisma.shippingMethod.findMany({
        include: {
          prices: {
            include: {
              currency: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  symbol: true,
                },
              },
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      console.log(`DEBUG: Encontrados ${methods.length} métodos de envío`);
      return methods;
    } catch (error) {
      console.error('ERROR al buscar métodos de envío:', error);
      throw new InternalServerErrorException('Error al buscar métodos de envío');
    }
  }

  async findAllByStore(storeId: string) {
    try {
      console.log('DEBUG: Buscando métodos de envío para storeId:', storeId);
      
      const methods = await this.prisma.shippingMethod.findMany({
        where: {
          storeId,
        },
        include: {
          prices: {
            include: {
              currency: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  symbol: true,
                },
              },
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      console.log(`DEBUG: Encontrados ${methods.length} métodos de envío para la tienda ${storeId}`);
      return methods;
    } catch (error) {
      console.error('ERROR al buscar métodos de envío por tienda:', error);
      throw new InternalServerErrorException('Error al buscar métodos de envío por tienda');
    }
  }

  async create(createShippingMethodDto: CreateShippingMethodDto) {
    const { storeId, prices, ...methodData } = createShippingMethodDto;

    // Verificar que prices es un array y tiene elementos
    if (!prices || !Array.isArray(prices) || prices.length === 0) {
      throw new BadRequestException('Se requiere al menos un precio para el método de envío');
    }

    console.log('DEBUG: Creando método de envío con datos:', {
      ...methodData,
      storeId,
      prices
    });

    try {
      // Usar la sintaxis correcta de Prisma para crear registros relacionados
      return await this.prisma.shippingMethod.create({
        data: {
          ...methodData,
          store: {
            connect: {
              id: storeId
            }
          },
          // Usar createMany para crear los precios relacionados
          prices: {
            createMany: {
              data: prices.map(price => ({
                currencyId: price.currencyId,
                price: price.price
              }))
            }
          }
        },
        include: {
          prices: {
            include: {
              currency: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  symbol: true,
                },
              },
            },
          },
          store: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    } catch (error) {
      console.error('ERROR al crear método de envío:', error);
      throw new InternalServerErrorException('Error al crear el método de envío');
    }
  }

  async update(id: string, updateShippingMethodDto: UpdateShippingMethodDto) {
    const { prices, ...methodData } = updateShippingMethodDto;

    console.log('DEBUG: Actualizando método de envío con ID:', id);
    console.log('DEBUG: Datos de actualización:', updateShippingMethodDto);

    try {
      // Primero, obtener el método existente para verificar que existe
      const existingMethod = await this.prisma.shippingMethod.findUnique({
        where: { id },
      });

      if (!existingMethod) {
        throw new NotFoundException(`Método de envío con ID ${id} no encontrado`);
      }

      // Crear un objeto de actualización
      const updateData: any = {
        ...methodData
      };

      // Si hay precios para actualizar
      if (prices && Array.isArray(prices)) {
        // Primero eliminar todos los precios existentes
        await this.prisma.shippingMethodPrice.deleteMany({
          where: { shippingMethodId: id }
        });

        // Luego añadir los nuevos precios
        updateData.prices = {
          createMany: {
            data: prices.map(price => ({
              currencyId: price.currencyId,
              price: price.price
            }))
          }
        };
      }

      // Realizar la actualización
      return await this.prisma.shippingMethod.update({
        where: { id },
        data: updateData,
        include: {
          prices: {
            include: {
              currency: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  symbol: true,
                },
              },
            },
          },
          store: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    } catch (error) {
      console.error('ERROR al actualizar método de envío:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el método de envío');
    }
  }

  async remove(id: string) {
    try {
      console.log('DEBUG: Eliminando método de envío con ID:', id);
      
      // Verificar que el método existe
      const method = await this.prisma.shippingMethod.findUnique({
        where: { id },
        include: { prices: true }
      });
  
      if (!method) {
        throw new NotFoundException(`Método de envío con ID ${id} no encontrado`);
      }
  
      // Usar una transacción para asegurar que todas las operaciones se completen o ninguna
      return await this.prisma.$transaction(async (prisma) => {
        // Primero eliminar todos los precios asociados
        console.log(`DEBUG: Eliminando ${method.prices.length} precios asociados al método de envío`);
        await prisma.shippingMethodPrice.deleteMany({
          where: { shippingMethodId: id }
        });
  
        // Luego eliminar el método de envío
        console.log('DEBUG: Eliminando el método de envío');
        await prisma.shippingMethod.delete({
          where: { id }
        });
  
        return { message: `Método de envío con ID ${id} eliminado correctamente` };
      });
    } catch (error) {
      console.error('ERROR al eliminar método de envío:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el método de envío');
    }
  }
}
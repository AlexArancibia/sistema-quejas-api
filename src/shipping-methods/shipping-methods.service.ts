import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShippingMethodsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createShippingMethodDto: CreateShippingMethodDto) {
    const { prices, ...shippingMethodData } = createShippingMethodDto

    return this.prisma.shippingMethod.create({
      data: {
        ...shippingMethodData,
        prices: {
          create: prices,
        },
      },
      include: {
        prices: true,
      },
    })
  }

  findAll() {
    return this.prisma.shippingMethod.findMany({
      include: {
        prices: true,
      },
    })
  }

  findOne(id: string) {
    return this.prisma.shippingMethod.findUnique({
      where: { id },
      include: {
        prices: true,
      },
    })
  }

  async update(id: string, updateShippingMethodDto: UpdateShippingMethodDto) {
    const { prices, ...shippingMethodData } = updateShippingMethodDto

    return this.prisma.shippingMethod.update({
      where: { id },
      data: {
        ...shippingMethodData,
        prices: prices
          ? {
              upsert: prices.map((price) => ({
                where: {
                  shippingMethodId_currencyId: {
                    shippingMethodId: id,
                    currencyId: price.currencyId,
                  },
                },
                create: price,
                update: price,
              })),
            }
          : undefined,
      },
      include: {
        prices: true,
      },
    })
  }

  remove(id: string) {
    return this.prisma.shippingMethod.delete({
      where: { id },
    })
  }
}


import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateShippingMethodDto } from "./dto/create-shipping-method.dto"
import { UpdateShippingMethodDto } from "./dto/update-shipping-method.dto"

@Injectable()
export class ShippingMethodsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      console.log("DEBUG: Buscando todos los métodos de envío")

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
            orderBy: {
              zonePriority: "asc",
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
          createdAt: "desc",
        },
      })

      console.log(`DEBUG: Encontrados ${methods.length} métodos de envío`)
      return methods
    } catch (error) {
      console.error("ERROR al buscar métodos de envío:", error)
      throw new InternalServerErrorException("Error al buscar métodos de envío")
    }
  }

  async findAllByStore(storeId: string) {
    try {
      console.log("DEBUG: Buscando métodos de envío para storeId:", storeId)

      const methods = await this.prisma.shippingMethod.findMany({
        where: {
          storeId,
          isActive: true,
        },
        include: {
          prices: {
            where: {
              isZoneActive: true,
            },
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
            orderBy: {
              zonePriority: "asc",
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
          createdAt: "desc",
        },
      })

      console.log(`DEBUG: Encontrados ${methods.length} métodos de envío para la tienda ${storeId}`)
      return methods
    } catch (error) {
      console.error("ERROR al buscar métodos de envío por tienda:", error)
      throw new InternalServerErrorException("Error al buscar métodos de envío por tienda")
    }
  }

  async findByGeographicLocation(
    storeId: string,
    countryCode?: string,
    stateCode?: string,
    cityName?: string,
    postalCode?: string,
  ) {
    try {
      console.log("DEBUG: Buscando métodos de envío por ubicación geográfica:", {
        storeId,
        countryCode,
        stateCode,
        cityName,
        postalCode,
      })

      // Construir las condiciones OR dinámicamente
      const orConditions: any[] = []

      if (countryCode) {
        orConditions.push({
          countryCodes: {
            has: countryCode,
          },
        })
      }

      if (stateCode) {
        orConditions.push({
          stateCodes: {
            has: stateCode,
          },
        })
      }

      if (cityName) {
        orConditions.push({
          cityNames: {
            has: cityName,
          },
        })
      }

      if (postalCode) {
        // Coincidencia exacta por código postal
        orConditions.push({
          postalCodes: {
            has: postalCode,
          },
        })

        // Coincidencia por patrón (buscar patrones que coincidan con el código postal)
        orConditions.push({
          postalCodePatterns: {
            hasSome: [postalCode.substring(0, 3) + "*", postalCode.substring(0, 2) + "*"],
          },
        })
      }

      const methods = await this.prisma.shippingMethod.findMany({
        where: {
          storeId,
          isActive: true,
          prices: {
            some: {
              isZoneActive: true,
              ...(orConditions.length > 0 && { OR: orConditions }),
            },
          },
        },
        include: {
          prices: {
            where: {
              isZoneActive: true,
              ...(orConditions.length > 0 && { OR: orConditions }),
            },
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
          createdAt: "desc",
        },
      })

      console.log(`DEBUG: Encontrados ${methods.length} métodos de envío para la ubicación especificada`)
      return methods
    } catch (error) {
      console.error("ERROR al buscar métodos de envío por ubicación:", error)
      throw new InternalServerErrorException("Error al buscar métodos de envío por ubicación")
    }
  }

  async create(createShippingMethodDto: CreateShippingMethodDto) {
    const { storeId, prices, ...methodData } = createShippingMethodDto

    // Verificar que prices es un array y tiene elementos
    if (!prices || !Array.isArray(prices) || prices.length === 0) {
      throw new BadRequestException("Se requiere al menos un precio para el método de envío")
    }

    console.log("DEBUG: Creando método de envío con datos:", {
      ...methodData,
      storeId,
      prices,
    })

    try {
      return await this.prisma.shippingMethod.create({
        data: {
          ...methodData,
          store: {
            connect: {
              id: storeId,
            },
          },
          prices: {
            createMany: {
              data: prices.map((price) => ({
                currencyId: price.currencyId,
                price: price.price,
                zoneName: price.zoneName,
                zoneDescription: price.zoneDescription,
                countryCodes: price.countryCodes || [],
                stateCodes: price.stateCodes || [],
                cityNames: price.cityNames || [],
                postalCodes: price.postalCodes || [],
                postalCodePatterns: price.postalCodePatterns || [],
                pricePerKg: price.pricePerKg || 0,
                freeWeightLimit: price.freeWeightLimit || 0,
                zonePriority: price.zonePriority || 0,
                isZoneActive: price.isZoneActive ?? true,
              })),
            },
          },
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
            orderBy: {
              zonePriority: "asc",
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    } catch (error) {
      console.error("ERROR al crear método de envío:", error)
      throw new InternalServerErrorException("Error al crear el método de envío")
    }
  }

  async update(id: string, updateShippingMethodDto: UpdateShippingMethodDto) {
    const { prices, ...methodData } = updateShippingMethodDto

    console.log("DEBUG: Actualizando método de envío con ID:", id)
    console.log("DEBUG: Datos de actualización:", updateShippingMethodDto)

    try {
      // Primero, obtener el método existente para verificar que existe
      const existingMethod = await this.prisma.shippingMethod.findUnique({
        where: { id },
      })

      if (!existingMethod) {
        throw new NotFoundException(`Método de envío con ID ${id} no encontrado`)
      }

      // Crear un objeto de actualización
      const updateData: any = {
        ...methodData,
      }

      // Si hay precios para actualizar
      if (prices && Array.isArray(prices)) {
        // Primero eliminar todos los precios existentes
        await this.prisma.shippingMethodPrice.deleteMany({
          where: { shippingMethodId: id },
        })

        // Luego añadir los nuevos precios con todos los campos
        updateData.prices = {
          createMany: {
            data: prices.map((price) => ({
              currencyId: price.currencyId,
              price: price.price,
              zoneName: price.zoneName,
              zoneDescription: price.zoneDescription,
              countryCodes: price.countryCodes || [],
              stateCodes: price.stateCodes || [],
              cityNames: price.cityNames || [],
              postalCodes: price.postalCodes || [],
              postalCodePatterns: price.postalCodePatterns || [],
              pricePerKg: price.pricePerKg || 0,
              freeWeightLimit: price.freeWeightLimit || 0,
              zonePriority: price.zonePriority || 0,
              isZoneActive: price.isZoneActive ?? true,
            })),
          },
        }
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
            orderBy: {
              zonePriority: "asc",
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    } catch (error) {
      console.error("ERROR al actualizar método de envío:", error)
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error al actualizar el método de envío")
    }
  }

  async remove(id: string) {
    try {
      console.log("DEBUG: Eliminando método de envío con ID:", id)

      // Verificar que el método existe
      const method = await this.prisma.shippingMethod.findUnique({
        where: { id },
        include: { prices: true },
      })

      if (!method) {
        throw new NotFoundException(`Método de envío con ID ${id} no encontrado`)
      }

      // Usar una transacción para asegurar que todas las operaciones se completen o ninguna
      return await this.prisma.$transaction(async (prisma) => {
        // Primero eliminar todos los precios asociados
        console.log(`DEBUG: Eliminando ${method.prices.length} precios asociados al método de envío`)
        await prisma.shippingMethodPrice.deleteMany({
          where: { shippingMethodId: id },
        })

        // Luego eliminar el método de envío
        console.log("DEBUG: Eliminando el método de envío")
        await prisma.shippingMethod.delete({
          where: { id },
        })

        return { message: `Método de envío con ID ${id} eliminado correctamente` }
      })
    } catch (error) {
      console.error("ERROR al eliminar método de envío:", error)
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new InternalServerErrorException("Error al eliminar el método de envío")
    }
  }

  async calculateShippingCost(
    shippingMethodId: string,
    weight: number,
    countryCode?: string,
    stateCode?: string,
    cityName?: string,
    postalCode?: string,
  ) {
    try {
      // Construir las condiciones OR dinámicamente
      const orConditions: any[] = []

      if (countryCode) {
        orConditions.push({
          countryCodes: { has: countryCode },
        })
      }

      if (stateCode) {
        orConditions.push({
          stateCodes: { has: stateCode },
        })
      }

      if (cityName) {
        orConditions.push({
          cityNames: { has: cityName },
        })
      }

      if (postalCode) {
        orConditions.push({
          postalCodes: { has: postalCode },
        })
      }

      const method = await this.prisma.shippingMethod.findUnique({
        where: { id: shippingMethodId },
        include: {
          prices: {
            where: {
              isZoneActive: true,
              ...(orConditions.length > 0 && { OR: orConditions }),
            },
            include: {
              currency: true,
            },
            orderBy: {
              zonePriority: "asc",
            },
          },
        },
      })

      if (!method || method.prices.length === 0) {
        throw new NotFoundException("No se encontró precio de envío para la ubicación especificada")
      }

      // Tomar el primer precio (mayor prioridad)
      const priceConfig = method.prices[0]
      let totalCost = Number(priceConfig.price)

      // Calcular costo adicional por peso si aplica
      if (weight > Number(priceConfig.freeWeightLimit)) {
        const extraWeight = weight - Number(priceConfig.freeWeightLimit)
        totalCost += extraWeight * Number(priceConfig.pricePerKg)
      }

      return {
        basePrice: Number(priceConfig.price),
        weightCharge: totalCost - Number(priceConfig.price),
        totalCost,
        currency: priceConfig.currency,
        zoneName: priceConfig.zoneName,
        estimatedDeliveryTime: method.estimatedDeliveryTime,
      }
    } catch (error) {
      console.error("ERROR al calcular costo de envío:", error)
      throw new InternalServerErrorException("Error al calcular el costo de envío")
    }
  }

  // Métodos para obtener datos geográficos
  async getGeographicData(countryCode?: string, stateId?: string) {
    try {
      // Si no se proporciona ningún parámetro, devolver todos los países
      if (!countryCode && !stateId) {
        console.log("DEBUG: Obteniendo todos los países")

        const countries = await this.prisma.country.findMany({
          where: {
            isActive: true,
          },
          select: {
            id: true,
            code: true,
            code3: true,
            name: true,
            nameLocal: true,
            phoneCode: true,
            currency: true,
          },
          orderBy: {
            name: "asc",
          },
        })

        console.log(`DEBUG: Encontrados ${countries.length} países`)
        return {
          type: "countries",
          data: countries,
        }
      }

      // Si se proporciona countryCode pero no stateId, devolver estados del país
      if (countryCode && !stateId) {
        console.log(`DEBUG: Obteniendo estados para el país: ${countryCode}`)

        const states = await this.prisma.state.findMany({
          where: {
            countryCode,
            isActive: true,
          },
          include: {
            country: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        })

        console.log(`DEBUG: Encontrados ${states.length} estados para el país ${countryCode}`)
        return {
          type: "states",
          countryCode,
          data: states,
        }
      }

      // Si se proporciona stateId, devolver ciudades del estado
      if (stateId) {
        console.log(`DEBUG: Obteniendo ciudades para el estado: ${stateId}`)

        const cities = await this.prisma.city.findMany({
          where: {
            stateId,
            isActive: true,
          },
          include: {
            state: {
              select: {
                id: true,
                code: true,
                name: true,
                countryCode: true,
                country: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        })

        console.log(`DEBUG: Encontradas ${cities.length} ciudades para el estado ${stateId}`)
        return {
          type: "cities",
          stateId,
          data: cities,
        }
      }

      throw new BadRequestException("Parámetros inválidos para obtener datos geográficos")
    } catch (error) {
      console.error("ERROR al obtener datos geográficos:", error)
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException("Error al obtener datos geográficos")
    }
  }

  async searchGeographicData(searchTerm: string, type?: "country" | "state" | "city") {
    try {
      console.log(`DEBUG: Buscando datos geográficos con término: ${searchTerm}, tipo: ${type}`)

      const results: any = {
        countries: [],
        states: [],
        cities: [],
      }

      // Buscar en países si no se especifica tipo o si es 'country'
      if (!type || type === "country") {
        results.countries = await this.prisma.country.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { nameLocal: { contains: searchTerm, mode: "insensitive" } },
              { code: { contains: searchTerm, mode: "insensitive" } },
              { code3: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            code: true,
            code3: true,
            name: true,
            nameLocal: true,
            phoneCode: true,
            currency: true,
          },
          take: 10,
          orderBy: {
            name: "asc",
          },
        })
      }

      // Buscar en estados si no se especifica tipo o si es 'state'
      if (!type || type === "state") {
        results.states = await this.prisma.state.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { nameLocal: { contains: searchTerm, mode: "insensitive" } },
              { code: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
          include: {
            country: {
              select: {
                code: true,
                name: true,
              },
            },
          },
          take: 10,
          orderBy: {
            name: "asc",
          },
        })
      }

      // Buscar en ciudades si no se especifica tipo o si es 'city'
      if (!type || type === "city") {
        results.cities = await this.prisma.city.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { nameLocal: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
          include: {
            state: {
              select: {
                id: true,
                code: true,
                name: true,
                countryCode: true,
                country: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
          take: 10,
          orderBy: {
            name: "asc",
          },
        })
      }

      const totalResults = results.countries.length + results.states.length + results.cities.length
      console.log(`DEBUG: Encontrados ${totalResults} resultados para la búsqueda: ${searchTerm}`)

      return {
        searchTerm,
        type: type || "all",
        results,
        totalResults,
      }
    } catch (error) {
      console.error("ERROR al buscar datos geográficos:", error)
      throw new InternalServerErrorException("Error al buscar datos geográficos")
    }
  }
}

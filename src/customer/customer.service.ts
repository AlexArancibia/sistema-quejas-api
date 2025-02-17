import { Injectable, UnauthorizedException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { JwtService } from '@nestjs/jwt';
import { encrypt, compare } from '../../lib/bcrypt';

@Injectable()
export class CustomerService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { addresses, password, ...customerData } = createCustomerDto
  
    const hashedPassword = password ? await encrypt(password) : null // Solo encripta si hay contraseña
  
    return this.prisma.$transaction(async (prisma) => {
      const customerCreateData: any = {
        ...customerData,
        ...(hashedPassword && { password: hashedPassword }), // Solo agrega password si existe
      }
  
      if (addresses && addresses.length > 0) {
        customerCreateData.addresses = {
          create: addresses.map((address, index) => ({
            ...address,
            isDefault: index === 0, // Establece la primera dirección como predeterminada
          })),
        }
      }
  
      const customer = await prisma.customer.create({
        data: customerCreateData,
        include: {
          addresses: true,
        },
      })
  
      // Elimina la contraseña del objeto de respuesta
      const { password, ...customerWithoutPassword } = customer
      return customerWithoutPassword
    })
  }
  

  async login(loginCustomerDto: LoginCustomerDto) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { email: loginCustomerDto.email },
      })

      if (!customer) {
        throw new UnauthorizedException("Email o contraseña inválidos.")
      }

      const isPasswordMatch = await compare(loginCustomerDto.password, customer.password)

      if (!isPasswordMatch) {
        throw new UnauthorizedException("Email o contraseña inválidos.")
      }

      const { password, ...customerWithoutPassword } = customer
      const access_token = await this.jwtService.signAsync(customerWithoutPassword)
      return { access_token, userInfo: customerWithoutPassword }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error
      }
      console.log(error)
      throw new InternalServerErrorException("Error al hacer login",error)
      
    }
  }

  async findAll() {
    return this.prisma.customer.findMany({
      include: {
        addresses: true,
      },
    })
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
      },
    })

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`)
    }

    return customer
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const { addresses, ...customerData } = updateCustomerDto

    return this.prisma.$transaction(async (prisma) => {
      const updatedCustomer = await prisma.customer.update({
        where: { id },
        data: {
          ...customerData,
          addresses: addresses
            ? {
                upsert: addresses.map((address) => ({
                  where: { id: address.id || "new" }, // 'new' for creating new addresses
                  create: {
                    address1: address.address1,
                    address2: address.address2,
                    city: address.city,
                    province: address.province,
                    zip: address.zip,
                    country: address.country,
                    phone: address.phone,
                    isDefault: address.isDefault,
                  },
                  update: {
                    address1: address.address1,
                    address2: address.address2,
                    city: address.city,
                    province: address.province,
                    zip: address.zip,
                    country: address.country,
                    phone: address.phone,
                    isDefault: address.isDefault,
                  },
                })),
              }
            : undefined,
        },
        include: {
          addresses: true,
        },
      })

      return updatedCustomer
    })
  }

  async remove(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { addresses: true },
    })

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`)
    }

    return this.prisma.$transaction(async (prisma) => {
      // Delete all addresses associated with the customer
      await prisma.address.deleteMany({
        where: { customerId: id },
      })

      // Delete the customer
      const deletedCustomer = await prisma.customer.delete({
        where: { id },
      })

      return deletedCustomer
    })
  }
}
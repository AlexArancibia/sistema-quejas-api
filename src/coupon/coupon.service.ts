import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common"
import  { PrismaService } from "../prisma/prisma.service"
import { CreateCouponDto } from "./dto/create-coupon.dto"
import { UpdateCouponDto } from "./dto/update-coupon.dto"
import { DiscountType } from "@prisma/client"
import { ValidateCouponDto } from "./dto/validate-coupon.dto"

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  // Create a new coupon
  async create(createCouponDto: CreateCouponDto) {
    const { applicableProductIds, applicableCategoryIds, applicableCollectionIds, ...couponData } = createCouponDto

    // Check if the code already exists for this store
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: {
        storeId_code: {
          storeId: createCouponDto.storeId,
          code: createCouponDto.code,
        },
      },
    })

    if (existingCoupon) {
      throw new ConflictException(`A coupon with code '${createCouponDto.code}' already exists in this store`)
    }

    // Validate dates
    if (new Date(createCouponDto.startDate) > new Date(createCouponDto.endDate)) {
      throw new BadRequestException("Start date must be before end date")
    }

    // Validate discount value for percentage
    if (createCouponDto.type === DiscountType.PERCENTAGE && createCouponDto.value > 100) {
      throw new BadRequestException("Percentage discount cannot exceed 100%")
    }

    // Create connections for applicable products, categories, and collections
    const data: any = {
      ...couponData,
      usedCount: 0,
    }

    if (applicableProductIds?.length) {
      data.applicableProducts = {
        connect: applicableProductIds.map((id) => ({ id })),
      }
    }

    if (applicableCategoryIds?.length) {
      data.applicableCategories = {
        connect: applicableCategoryIds.map((id) => ({ id })),
      }
    }

    if (applicableCollectionIds?.length) {
      data.applicableCollections = {
        connect: applicableCollectionIds.map((id) => ({ id })),
      }
    }

    // Create the coupon
    return this.prisma.coupon.create({
      data,
      include: {
        applicableProducts: true,
        applicableCategories: true,
        applicableCollections: true,
      },
    })
  }

  // Get all coupons
  async findAll() {
    return this.prisma.coupon.findMany({
      include: {
        applicableProducts: true,
        applicableCategories: true,
        applicableCollections: true,
      },
    })
  }

  // Get all coupons for a specific store
  async findAllByStore(storeId: string, includeInactive = false) {
    const where: any = { storeId }

    if (!includeInactive) {
      where.isActive = true
    }

    return this.prisma.coupon.findMany({
      where,
      include: {
        applicableProducts: {
          select:{
            id:true,
            storeId:true,
            title:true
          }
        }
        ,
        applicableCategories: {
          select:{
            id:true,
            storeId:true,
            name:true
          }
        },
        applicableCollections: {
          select:{
            id:true,
            storeId:true,
            title:true
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  }

  // Get a coupon by ID
  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        applicableProducts: true,
        applicableCategories: true,
        applicableCollections: true,
      },
    })

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`)
    }

    return coupon
  }

  // Get a coupon by code for a specific store
  async findByCode(storeId: string, code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: {
        storeId_code: {
          storeId,
          code,
        },
      },
      include: {
        applicableProducts: true,
        applicableCategories: true,
        applicableCollections: true,
      },
    })

    if (!coupon) {
      throw new NotFoundException(`Coupon with code '${code}' not found in this store`)
    }

    return coupon
  }

  // Update a coupon
  async update(id: string, updateCouponDto: UpdateCouponDto) {
    const { applicableProductIds, applicableCategoryIds, applicableCollectionIds, ...couponData } = updateCouponDto

    // Check if the coupon exists
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { id },
    })

    if (!existingCoupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`)
    }

    // If code is being updated, check if the new code already exists for this store
    if (updateCouponDto.code && updateCouponDto.code !== existingCoupon.code) {
      const codeExists = await this.prisma.coupon.findUnique({
        where: {
          storeId_code: {
            storeId: existingCoupon.storeId,
            code: updateCouponDto.code,
          },
        },
      })

      if (codeExists) {
        throw new ConflictException(`A coupon with code '${updateCouponDto.code}' already exists in this store`)
      }
    }

    // Validate dates if both are provided
    if (updateCouponDto.startDate && updateCouponDto.endDate) {
      if (new Date(updateCouponDto.startDate) > new Date(updateCouponDto.endDate)) {
        throw new BadRequestException("Start date must be before end date")
      }
    } else if (updateCouponDto.startDate && new Date(updateCouponDto.startDate) > new Date(existingCoupon.endDate)) {
      throw new BadRequestException("Start date must be before end date")
    } else if (updateCouponDto.endDate && new Date(existingCoupon.startDate) > new Date(updateCouponDto.endDate)) {
      throw new BadRequestException("Start date must be before end date")
    }

    // Validate discount value for percentage
    if (
      updateCouponDto.type === DiscountType.PERCENTAGE ||
      (existingCoupon.type === DiscountType.PERCENTAGE && updateCouponDto.value && !updateCouponDto.type)
    ) {
      const value = updateCouponDto.value || existingCoupon.value.toNumber()
      if (value > 100) {
        throw new BadRequestException("Percentage discount cannot exceed 100%")
      }
    }

    // Prepare update data
    const data: any = { ...couponData }

    // Update connections for applicable products, categories, and collections
    if (applicableProductIds !== undefined) {
      data.applicableProducts = {
        set: applicableProductIds.map((id) => ({ id })),
      }
    }

    if (applicableCategoryIds !== undefined) {
      data.applicableCategories = {
        set: applicableCategoryIds.map((id) => ({ id })),
      }
    }

    if (applicableCollectionIds !== undefined) {
      data.applicableCollections = {
        set: applicableCollectionIds.map((id) => ({ id })),
      }
    }

    // Update the coupon
    return this.prisma.coupon.update({
      where: { id },
      data,
      include: {
        applicableProducts: true,
        applicableCategories: true,
        applicableCollections: true,
      },
    })
  }

  // Delete a coupon
  async remove(id: string) {
    // Check if the coupon exists
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { id },
    })

    if (!existingCoupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`)
    }

    // Check if the coupon has been used in orders
    const ordersCount = await this.prisma.order.count({
      where: { couponId: id },
    })

    if (ordersCount > 0) {
      // Instead of deleting, just deactivate the coupon
      return this.prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      })
    }

    // Delete the coupon
    return this.prisma.coupon.delete({
      where: { id },
    })
  }

  // Validate a coupon for use
  async validateCoupon(validateCouponDto: ValidateCouponDto) {
    const { code, storeId, cartTotal, productIds, categoryIds, collectionIds } = validateCouponDto

    try {
      // Find the coupon
      const coupon = await this.findByCode(storeId, code)

      // Check if coupon is active
      if (!coupon.isActive) {
        return {
          valid: false,
          message: "This coupon is not active",
        }
      }

      // Check if coupon has expired
      const now = new Date()
      if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
        return {
          valid: false,
          message: "This coupon has expired or is not yet valid",
        }
      }

      // Check if coupon has reached maximum uses
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return {
          valid: false,
          message: "This coupon has reached its maximum number of uses",
        }
      }

      // Check minimum purchase requirement
      if (coupon.minPurchase && cartTotal < coupon.minPurchase.toNumber()) {
        return {
          valid: false,
          message: `This coupon requires a minimum purchase of ${coupon.minPurchase}`,
          minPurchase: coupon.minPurchase.toNumber(),
        }
      }

      // Check if coupon is applicable to the cart items
      if (
        coupon.applicableProducts.length > 0 ||
        coupon.applicableCategories.length > 0 ||
        coupon.applicableCollections.length > 0
      ) {
        let isApplicable = false

        // Check products
        if (coupon.applicableProducts.length > 0 && productIds?.length > 0) {
          const applicableProductIds = coupon.applicableProducts.map((p) => p.id)
          isApplicable = productIds.some((id) => applicableProductIds.includes(id))
        }

        // Check categories
        if (!isApplicable && coupon.applicableCategories.length > 0 && categoryIds?.length > 0) {
          const applicableCategoryIds = coupon.applicableCategories.map((c) => c.id)
          isApplicable = categoryIds.some((id) => applicableCategoryIds.includes(id))
        }

        // Check collections
        if (!isApplicable && coupon.applicableCollections.length > 0 && collectionIds?.length > 0) {
          const applicableCollectionIds = coupon.applicableCollections.map((c) => c.id)
          isApplicable = collectionIds.some((id) => applicableCollectionIds.includes(id))
        }

        if (!isApplicable) {
          return {
            valid: false,
            message: "This coupon is not applicable to the items in your cart",
          }
        }
      }

      // Calculate discount amount
      let discountAmount = 0
      switch (coupon.type) {
        case DiscountType.PERCENTAGE:
          discountAmount = (cartTotal * coupon.value.toNumber()) / 100
          break
        case DiscountType.FIXED_AMOUNT:
          discountAmount = Math.min(coupon.value.toNumber(), cartTotal)
          break
        case DiscountType.FREE_SHIPPING:
          // Discount amount is not applicable for free shipping
          discountAmount = 0
          break
        case DiscountType.BUY_X_GET_Y:
          // This would require more complex logic based on the specific items in the cart
          // For now, we'll just return a placeholder value
          discountAmount = 0
          break
      }

      return {
        valid: true,
        coupon,
        discountAmount,
        discountedTotal: cartTotal - discountAmount,
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          valid: false,
          message: "Invalid coupon code",
        }
      }
      throw error
    }
  }

  // Apply a coupon to an order (increment usedCount)
  async applyCoupon(id: string) {
    // Check if the coupon exists
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { id },
    })

    if (!existingCoupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`)
    }

    // Increment the usedCount
    return this.prisma.coupon.update({
      where: { id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    })
  }
}

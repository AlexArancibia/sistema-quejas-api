import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Patch } from "@nestjs/common"
import  { ProductService } from "./product.service"
import  { CreateProductDto } from "./dto/create-product.dto"
import  { UpdateProductDto } from "./dto/update-product.dto"
import  { CreateProductVariantDto } from "./dto/create-product-variant.dto"
import  { UpdateProductVariantDto } from "./dto/update-product-variant.dto"
import  { CreateVariantPriceDto } from "./dto/create-variant-price.dto"
import  { UpdateVariantPriceDto } from "./dto/update-variant-price.dto"
import  { SearchProductDto } from "./dto/search-product.dto"
import { PublicKeyGuard } from "../auth/guards/public.guard"
import { AuthGuard } from "../auth/guards/auth.guard"
import type { ProductStatus } from "@prisma/client"

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  async findAll(@Query() searchParams: SearchProductDto, @Query('skipPagination') skipPagination?: string) {
    const result = await this.productService.findAll(searchParams)

    // If skipPagination is 'true', return just the data array
    if (skipPagination === "true") {
      return result.data
    }

    // Otherwise return the paginated result with metadata
    return result
  }

  @UseGuards(PublicKeyGuard)
  @Get("store/:storeId")
  async findAllByStore(
    @Param("storeId") storeId: string,
    @Query() searchParams: SearchProductDto,
    @Query('skipPagination') skipPagination?: string,
  ) {
    const result = await this.productService.findAllByStore(storeId, searchParams)

    // If skipPagination is 'true', return just the data array
    if (skipPagination === "true") {
      return result.data
    }

    // Otherwise return the paginated result with metadata
    return result.data
  }

  @UseGuards(PublicKeyGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productService.findOne(id);
  }

  @UseGuards(PublicKeyGuard)
  @Get("by-slug/:storeId/:slug")
  findBySlug(@Param("storeId") storeId: string, @Param("slug") slug: string) {
    return this.productService.findBySlug(storeId, slug)
  }

  @UseGuards(AuthGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto)
  }

  @UseGuards(AuthGuard)
  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() body: { status: ProductStatus }) {
    return this.productService.updateStatus(id, body.status)
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productService.remove(id);
  }

  @UseGuards(PublicKeyGuard)
  @Post(":id/view")
  incrementViewCount(@Param("id") id: string) {
    return this.productService.incrementViewCount(id);
  }

  @UseGuards(PublicKeyGuard)
  @Get("statistics/:storeId")
  getStatisticsByStore(@Param("storeId") storeId: string) {
    return this.productService.getStatisticsByStore(storeId);
  }

  // Product Variant endpoints
  @UseGuards(AuthGuard)
  @Post(":productId/variants")
  createVariant(@Param("productId") productId: string, @Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productService.createVariant(productId, createProductVariantDto)
  }

  @UseGuards(PublicKeyGuard)
  @Get("variants/:id")
  findVariant(@Param("id") id: string) {
    return this.productService.findVariant(id);
  }

  @UseGuards(AuthGuard)
  @Put("variants/:id")
  updateVariant(
    @Param("id") id: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
    @Body('productId') productId?: string,
  ) {
    return this.productService.updateVariant(id, updateProductVariantDto, productId)
  }

  @UseGuards(AuthGuard)
  @Patch("variants/:id/product/:productId")
  updateVariantProduct(
    @Param("id") id: string,
    @Param("productId") productId: string,
    @Body() updateProductVariantDto: UpdateProductVariantDto,
  ) {
    return this.productService.updateVariant(id, updateProductVariantDto, productId)
  }

  @UseGuards(AuthGuard)
  @Delete("variants/:id")
  removeVariant(@Param("id") id: string) {
    return this.productService.removeVariant(id);
  }

  // Variant Price endpoints
  @UseGuards(AuthGuard)
  @Post("variant-prices")
  createVariantPrice(@Body() createVariantPriceDto: CreateVariantPriceDto) {
    return this.productService.createVariantPrice(createVariantPriceDto);
  }

  @UseGuards(PublicKeyGuard)
  @Get("variant-prices/:id")
  findVariantPrice(@Param("id") id: string) {
    return this.productService.findVariantPrice(id);
  }

  @UseGuards(AuthGuard)
  @Put("variant-prices/:id")
  updateVariantPrice(@Param("id") id: string, @Body() updateVariantPriceDto: UpdateVariantPriceDto) {
    return this.productService.updateVariantPrice(id, updateVariantPriceDto)
  }

  @UseGuards(AuthGuard)
  @Delete("variant-prices/:id")
  removeVariantPrice(@Param("id") id: string) {
    return this.productService.removeVariantPrice(id);
  }
}

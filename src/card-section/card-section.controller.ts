import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import   { CardSectionService } from "./card-section.service"
import   { CreateCardSectionDto } from "./dto/create-card-section.dto"
import   { UpdateCardSectionDto } from "./dto/update-card-section.dto"
import { AuthGuard } from "../auth/guards/auth.guard"
import { PublicKeyGuard } from "src/auth/guards/public.guard"

@Controller("card-section")
export class CardSectionController {
  constructor(private readonly cardSectionService: CardSectionService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createCardSectionDto: CreateCardSectionDto) {
    return this.cardSectionService.create(createCardSectionDto);
  }
  @Get()
  @UseGuards(PublicKeyGuard)
  findAll() {
    return this.cardSectionService.findAll()
  }
  @Get('store/:storeId')
  @UseGuards(PublicKeyGuard)
  findAllByStore(@Param('storeId') storeId: string) {
    return this.cardSectionService.findAllByStore(storeId);
  }
 
  @Get(':id')
  @UseGuards(PublicKeyGuard)
  findOne(@Param('id') id: string) {
    return this.cardSectionService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateCardSectionDto: UpdateCardSectionDto) {
    return this.cardSectionService.update(id, updateCardSectionDto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.cardSectionService.remove(id);
  }
}

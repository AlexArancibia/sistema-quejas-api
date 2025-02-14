import { Injectable } from '@nestjs/common';
import { CreateHeroSectionDto } from './dto/create-hero-section.dto';
import { UpdateHeroSectionDto } from './dto/update-hero-section.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HeroSectionService {
  constructor(private prisma: PrismaService) {}

  create(createHeroSectionDto: CreateHeroSectionDto) {
    return this.prisma.heroSection.create({
      data: createHeroSectionDto,
    })
  }

  findAll() {
    return this.prisma.heroSection.findMany()
  }

  findOne(id: string) {
    return this.prisma.heroSection.findUnique({
      where: { id },
    })
  }

  update(id: string, updateHeroSectionDto: UpdateHeroSectionDto) {
    return this.prisma.heroSection.update({
      where: { id },
      data: updateHeroSectionDto,
    })
  }

  remove(id: string) {
    return this.prisma.heroSection.delete({
      where: { id },
    })
  }
}


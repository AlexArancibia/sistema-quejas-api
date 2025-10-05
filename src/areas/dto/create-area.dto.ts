import { IsString, IsOptional, IsBoolean, IsHexColor } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

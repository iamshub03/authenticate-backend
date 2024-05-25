import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ example: '1234567890' })
  @IsNumber()
  phone: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

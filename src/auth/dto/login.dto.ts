import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class LoginDTO {
  @ApiProperty({ example: '1234567890' })
  @IsNumber()
  phone: number;

  @ApiProperty({ example: '********' })
  @IsString()
  password: string;
}

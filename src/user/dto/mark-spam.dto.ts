import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class MarkSpamDTO {
  @ApiProperty()
  @IsNumber()
  phone: number;
}

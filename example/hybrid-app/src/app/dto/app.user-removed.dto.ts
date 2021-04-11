import { Transform } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class AppUserRemovedDto {
  @IsNumber()
  userId: number;

  @IsDate()
  @Transform(params => new Date(params.value))
  date: Date;
}
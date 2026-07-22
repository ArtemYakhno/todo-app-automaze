import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsNotPastDate } from '../../common/validators/is-not-past-date.validator';

export class CreateTaskDto {
  @ApiProperty({ maxLength: 30 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title!: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  priority!: number;

  @ApiPropertyOptional({ type: [String], maxItems: 5 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @IsNotPastDate()
  dueDate?: string;
}

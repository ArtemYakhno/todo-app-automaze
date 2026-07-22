import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../../../generated/prisma/enums';

const SORT_BY_VALUES = ['priority', 'dueDate', 'createdAt'] as const;
export type TaskSortBy = (typeof SORT_BY_VALUES)[number];

const SORT_ORDER_VALUES = ['asc', 'desc'] as const;
export type TaskSortOrder = (typeof SORT_ORDER_VALUES)[number];

const FILTER_VALUES = ['all', 'done', 'undone'] as const;
export type TaskFilter = (typeof FILTER_VALUES)[number];

export class TaskQueryDto {
  @ApiPropertyOptional({
    enum: FILTER_VALUES,
    description:
      'Status bucket per the all/done/undone requirement. Takes precedence over `status` when both are supplied.',
  })
  @IsOptional()
  @IsIn(FILTER_VALUES)
  filter?: TaskFilter;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: SORT_BY_VALUES })
  @IsOptional()
  @IsIn(SORT_BY_VALUES)
  sortBy?: TaskSortBy;

  @ApiPropertyOptional({ enum: SORT_ORDER_VALUES })
  @IsOptional()
  @IsIn(SORT_ORDER_VALUES)
  sortOrder?: TaskSortOrder;

  @ApiPropertyOptional({
    description: 'Text search across title and description',
  })
  @IsOptional()
  @IsString()
  query?: string;
}

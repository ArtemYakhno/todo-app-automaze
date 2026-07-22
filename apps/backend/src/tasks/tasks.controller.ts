import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Task } from '../../generated/prisma/client';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks' })
  @ApiQuery({ name: 'filter', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false })
  @ApiQuery({ name: 'query', required: false })
  @ApiResponse({ status: HttpStatus.OK })
  findAll(@Query() query: TaskQueryDto): Promise<Task[]> {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  findOne(@Param('id') id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a task' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto): Promise<Task> {
    return this.tasksService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change the status of a task' })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
  ): Promise<Task> {
    return this.tasksService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  remove(@Param('id') id: string): Promise<void> {
    return this.tasksService.remove(id);
  }
}

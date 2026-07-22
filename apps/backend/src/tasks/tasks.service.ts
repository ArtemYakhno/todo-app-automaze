import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Task, TaskStatus } from '../../generated/prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({ data: dto });
  }

  findAll(query: TaskQueryDto): Promise<Task[]> {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    return this.prisma.task.findMany({
      where: {
        ...this.statusWhere(query),
        ...(query.query
          ? {
              OR: [
                { title: { contains: query.query, mode: 'insensitive' } },
                { description: { contains: query.query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { [sortBy]: sortOrder },
    });
  }

  async findOne(id: string): Promise<Task> {
    return this.findOrThrow(id);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    await this.findOrThrow(id);

    return this.prisma.task.update({
      where: { id },
      data: dto,
    });
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    await this.findOrThrow(id);

    return this.prisma.task.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);

    await this.prisma.task.delete({ where: { id } });
  }

  private statusWhere(query: TaskQueryDto): Prisma.TaskWhereInput {
    if (query.filter === 'done') {
      return { status: 'done' };
    }

    if (query.filter === 'undone') {
      return { status: { in: ['todo', 'in_progress'] } };
    }

    if (query.filter === 'all') {
      return {};
    }

    return query.status ? { status: query.status } : {};
  }

  private async findOrThrow(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }
}

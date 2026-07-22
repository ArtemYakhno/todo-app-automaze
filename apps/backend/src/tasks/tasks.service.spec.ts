import { NotFoundException } from '@nestjs/common';
import { Task } from '../../generated/prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    task: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const task: Task = {
    id: 'task-1',
    title: 'Write tests',
    description: null,
    priority: 3,
    tags: [],
    dueDate: null,
    status: 'todo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    service = new TasksService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('creates a task from the given dto', async () => {
      prisma.task.create.mockResolvedValue(task);

      const dto = { title: 'Write tests', priority: 3 };
      const result = await service.create(dto);

      expect(prisma.task.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(task);
    });
  });

  describe('findAll', () => {
    it('defaults to sorting by createdAt desc and no status filter when no query params are given', async () => {
      prisma.task.findMany.mockResolvedValue([task]);

      await service.findAll({});

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
      });
    });

    it('filters by status when provided', async () => {
      prisma.task.findMany.mockResolvedValue([task]);

      await service.findAll({ status: 'done' });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { status: 'done' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('sorts by the given field and direction when provided', async () => {
      prisma.task.findMany.mockResolvedValue([task]);

      await service.findAll({ sortBy: 'priority', sortOrder: 'asc' });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { priority: 'asc' },
      });
    });

    it('combines a status filter with custom sorting', async () => {
      prisma.task.findMany.mockResolvedValue([task]);

      await service.findAll({
        status: 'in_progress',
        sortBy: 'dueDate',
        sortOrder: 'desc',
      });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { status: 'in_progress' },
        orderBy: { dueDate: 'desc' },
      });
    });

    it('searches by title or description when query is provided', async () => {
      prisma.task.findMany.mockResolvedValue([task]);

      await service.findAll({ query: 'tests' });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'tests', mode: 'insensitive' } },
            { description: { contains: 'tests', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('combines a query search with a status filter', async () => {
      prisma.task.findMany.mockResolvedValue([task]);

      await service.findAll({ query: 'tests', status: 'done' });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {
          status: 'done',
          OR: [
            { title: { contains: 'tests', mode: 'insensitive' } },
            { description: { contains: 'tests', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('filters to done tasks when filter=done', async () => {
      prisma.task.findMany.mockResolvedValue([task]);

      await service.findAll({ filter: 'done' });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { status: 'done' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('filters to todo/in_progress tasks when filter=undone', async () => {
      prisma.task.findMany.mockResolvedValue([task]);

      await service.findAll({ filter: 'undone' });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { status: { in: ['todo', 'in_progress'] } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('applies no status filter when filter=all', async () => {
      prisma.task.findMany.mockResolvedValue([task]);

      await service.findAll({ filter: 'all' });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
      });
    });

    it('ignores status when filter is also provided', async () => {
      prisma.task.findMany.mockResolvedValue([task]);

      await service.findAll({ filter: 'done', status: 'todo' });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { status: 'done' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('returns the task when it exists', async () => {
      prisma.task.findUnique.mockResolvedValue(task);

      await expect(service.findOne(task.id)).resolves.toEqual(task);
    });

    it('throws NotFoundException when the task does not exist', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates the task when it exists', async () => {
      prisma.task.findUnique.mockResolvedValue(task);
      prisma.task.update.mockResolvedValue({
        ...task,
        title: 'Updated',
      });

      const result = await service.update(task.id, { title: 'Updated' });

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: task.id },
        data: { title: 'Updated' },
      });
      expect(result.title).toBe('Updated');
    });

    it('throws NotFoundException when the task does not exist', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('updates the status when the task exists', async () => {
      prisma.task.findUnique.mockResolvedValue(task);
      prisma.task.update.mockResolvedValue({
        ...task,
        status: 'done',
      });

      const result = await service.updateStatus(task.id, 'done');

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: task.id },
        data: { status: 'done' },
      });
      expect(result.status).toBe('done');
    });

    it('throws NotFoundException when the task does not exist', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('missing-id', 'done')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes the task when it exists', async () => {
      prisma.task.findUnique.mockResolvedValue(task);

      await service.remove(task.id);

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: task.id },
      });
    });

    it('throws NotFoundException when the task does not exist', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

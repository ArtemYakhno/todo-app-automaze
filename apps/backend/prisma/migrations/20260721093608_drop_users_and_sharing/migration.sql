-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dueDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

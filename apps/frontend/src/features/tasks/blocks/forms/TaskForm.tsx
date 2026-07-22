"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTaskMutation } from "@/queries/tasks/useCreateTaskMutation";
import { useUpdateTaskMutation } from "@/queries/tasks/useUpdateTaskMutation";
import {
  createTaskFormSchema,
  createTaskSchema,
} from "@/schemas/task.schema";
import type { CreateTaskFormValues, Task } from "@/types/task";
import { TagsInput } from "../components/TagsInput";

const todayStr = new Date().toISOString().slice(0, 10);

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const isEdit = !!task;
  const createMutation = useCreateTaskMutation();
  const updateMutation = useUpdateTaskMutation();
  const mutation = isEdit ? updateMutation : createMutation;

  const initialDueDate = task?.dueDate?.slice(0, 10) ?? "";

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(isEdit ? createTaskSchema : createTaskFormSchema),
    defaultValues: {
      title: task?.title ?? "",
      priority: task?.priority ?? 5,
      description: task?.description ?? "",
      tags: task?.tags ?? [],
      dueDate: initialDueDate,
    },
  });

  const onSubmit = (values: CreateTaskFormValues) => {
    const dto = {
      title: values.title,
      priority: values.priority,
      description: values.description ?? "",
      tags: values.tags ?? [],
      // Create: send the date if set. Edit: only send it when changed, so
      // saving an unchanged (possibly past) date doesn't hit @IsNotPastDate.
      ...((isEdit ? values.dueDate !== initialDueDate : Boolean(values.dueDate))
        ? values.dueDate
          ? { dueDate: new Date(values.dueDate).toISOString() }
          : {}
        : {}),
    };

    const handlers = {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    };

    if (isEdit) {
      updateMutation.mutate({ id: task.id, dto }, handlers);
    } else {
      createMutation.mutate(dto, handlers);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="priority">Priority (1–10)</Label>
        <Input
          id="priority"
          type="number"
          min={1}
          max={10}
          {...register("priority", { valueAsNumber: true })}
        />
        {errors.priority && (
          <p className="text-sm text-destructive">{errors.priority.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dueDate">Due date</Label>
        <Input id="dueDate" type="date" min={todayStr} {...register("dueDate")} />
        {errors.dueDate && (
          <p className="text-sm text-destructive">{errors.dueDate.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Tags</Label>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <TagsInput value={field.value ?? []} onChange={field.onChange} />
          )}
        />
        {errors.tags && (
          <p className="text-sm text-destructive">{errors.tags.message}</p>
        )}
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {isEdit ? "Saving…" : "Adding…"}
          </>
        ) : isEdit ? (
          "Save changes"
        ) : (
          "Add task"
        )}
      </Button>
    </form>
  );
}

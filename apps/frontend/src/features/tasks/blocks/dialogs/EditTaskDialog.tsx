"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Task } from "@/types/task";
import { TaskForm } from "../forms/TaskForm";

export function EditTaskDialog({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit task"
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>
        <TaskForm task={task} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

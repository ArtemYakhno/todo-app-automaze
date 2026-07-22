"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTaskMutation } from "@/queries/tasks/useDeleteTaskMutation";

interface DeleteTaskButtonProps {
  taskId: string;
  taskTitle: string;
}

export function DeleteTaskButton({ taskId, taskTitle }: DeleteTaskButtonProps) {
  const [open, setOpen] = useState(false);
  const mutation = useDeleteTaskMutation();

  const handleDelete = () => {
    mutation.mutate(taskId, { onSuccess: () => setOpen(false) });
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) mutation.reset();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete task"
          className="size-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &ldquo;{taskTitle}&rdquo;. This can&apos;t
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAX_TAGS = 5;

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

export function TagsInput({ value, onChange, disabled }: TagsInputProps) {
  const [draft, setDraft] = useState("");
  const isFull = value.length >= MAX_TAGS;

  const addTag = () => {
    const tag = draft.trim();
    if (!tag || value.includes(tag) || isFull) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    } else if (event.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1.5",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="font-normal">
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 rounded-full hover:text-foreground"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          value={draft}
          disabled={disabled || isFull}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={
            isFull
              ? "Remove a tag to add more"
              : "Press Enter or comma to add"
          }
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {isFull ? `Maximum of ${MAX_TAGS} tags reached` : `Up to ${MAX_TAGS} tags`}
        {" · "}
        {value.length}/{MAX_TAGS}
      </p>
    </div>
  );
}

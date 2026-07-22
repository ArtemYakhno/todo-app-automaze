"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { TaskQueryParams } from "@/types/task";
import type { useTaskFilters } from "./hooks/useTaskFilters";
import { FILTER_OPTIONS } from "./constants/filter";
import { SORT_OPTIONS } from "./constants/sort";




interface TaskFiltersProps {
  params: TaskQueryParams;
  updateParams: ReturnType<typeof useTaskFilters>["updateParams"];
}

export function TaskFilters({ params, updateParams }: TaskFiltersProps) {
  const [search, setSearch] = useState(params.query ?? "");
  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    if (debouncedSearch !== (params.query ?? "")) {
      updateParams({ query: debouncedSearch });
    }
  }, [debouncedSearch, params.query, updateParams]);

  const sortValue = `${params.sortBy ?? "createdAt"}:${params.sortOrder ?? "desc"}`;

  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks…"
          aria-label="Search tasks"
          className="pl-8"
        />
      </div>

      <Select
        value={params.filter ?? "all"}
        onValueChange={(value) => updateParams({ filter: value })}
      >
        <SelectTrigger className="sm:w-32" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sortValue}
        onValueChange={(value) => {
          const [sortBy, sortOrder] = value.split(":");
          updateParams({ sortBy, sortOrder });
        }}
      >
        <SelectTrigger className="sm:w-36" aria-label="Sort tasks">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

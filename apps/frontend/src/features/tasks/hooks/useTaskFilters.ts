"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  getSearchWith,
  normalizeParam,
  searchParamsToObject,
  type SearchParams,
} from "@/lib/searchParams";
import { taskQuerySchema } from "@/schemas/task.schema";
import type { TaskQueryParams } from "@/types/task";

type FilterKey = keyof TaskQueryParams;

const TASK_FILTER_DEFAULTS: Partial<Record<FilterKey, string>> = {
  filter: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
  query: "",
};

export function useTaskFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params: TaskQueryParams = taskQuerySchema.parse(
    searchParamsToObject(searchParams),
  );

  const updateParams = useCallback(
    (updates: Partial<Record<FilterKey, string>>) => {
      const normalized: SearchParams = {};
      for (const [key, value] of Object.entries(updates)) {
        normalized[key] = normalizeParam(
          value,
          TASK_FILTER_DEFAULTS[key as FilterKey],
        );
      }

      const qs = getSearchWith(searchParams, normalized);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  return { params, updateParams };
}

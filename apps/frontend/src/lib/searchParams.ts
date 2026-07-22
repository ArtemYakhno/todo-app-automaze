export type SearchParams = {
  [key: string]: string | string[] | null | undefined;
};

// Immutably apply a set of updates to the current params and return the new
// query string. `null` deletes a key, `undefined` leaves it untouched, arrays
// replace all values for a key.
export function getSearchWith(
  currentParams: URLSearchParams,
  paramsToUpdate: SearchParams,
): string {
  const newParams = new URLSearchParams(currentParams.toString());

  Object.entries(paramsToUpdate).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (value === null) {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.delete(key);

      value.forEach((part) => {
        newParams.append(key, part);
      });
    } else {
      newParams.set(key, value);
    }
  });

  return newParams.toString();
}

// Prepare a value for the URL: default/empty values become `null` (removed from
// the URL, keeping links clean), everything else becomes a string.
export const normalizeParam = <T>(value: T | undefined, defaultValue?: T) => {
  if (value === undefined) return undefined;
  if (value === defaultValue) return null;
  if (value === null) return null;
  if (typeof value === "string" && !value.trim()) return null;
  return String(value);
};

export const searchParamsToObject = (searchParams: URLSearchParams) => {
  return Object.fromEntries(searchParams.entries());
};

export function toQueryString(
  params: Record<string, string | undefined>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, value);
    }
  }

  return search.toString();
}

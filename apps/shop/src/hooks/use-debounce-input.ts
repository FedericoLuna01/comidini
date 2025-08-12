import { useEffect, useState } from "react";

export const useDebounceInput = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value.trim());

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

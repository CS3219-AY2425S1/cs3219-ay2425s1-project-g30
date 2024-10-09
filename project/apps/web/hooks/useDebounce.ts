import { useState, useEffect, startTransition } from "react";

const useDebounce = <T>(
  value: T,
  delay: number,
  onDebounceStart?: () => void,
  onDebounceEnd?: () => void,
): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    if (onDebounceStart) {
      onDebounceStart();
    }

    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedValue(value);

        if (onDebounceEnd) {
          onDebounceEnd();
        }
      });
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;

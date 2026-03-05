import { useEffect, useRef } from "react";

/**
 * A custom hook that debounces the execution of an effect.
 * Useful for auto-save functionality to prevent excessive updates.
 *
 * @param effect - The effect function to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @param deps - The dependency array for the effect
 */
export function useDebouncedEffect(
  effect: () => void,
  delay = 500,
  deps: React.DependencyList = [],
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectRef = useRef(effect);
  const delayRef = useRef(delay);
  effectRef.current = effect;
  delayRef.current = delay;

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      effectRef.current();
    }, delayRef.current);

    // Cleanup function to clear timeout on unmount or deps change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);
}

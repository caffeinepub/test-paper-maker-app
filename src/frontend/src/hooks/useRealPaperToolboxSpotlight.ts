import { useEffect, useState } from "react";

export const TOOLBOX_SPOTLIGHT_STORAGE_KEY =
  "real-paper-toolbox-spotlight-completed";

export function useRealPaperToolboxSpotlight() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOOLBOX_SPOTLIGHT_STORAGE_KEY);
      setIsCompleted(stored === "true");
    } catch (error) {
      console.error("Failed to load toolbox spotlight state:", error);
      setIsCompleted(false);
    }
    setIsInitialized(true);
  }, []);

  const complete = () => {
    try {
      localStorage.setItem(TOOLBOX_SPOTLIGHT_STORAGE_KEY, "true");
      setIsCompleted(true);
    } catch (error) {
      console.error("Failed to save toolbox spotlight state:", error);
    }
  };

  const reset = () => {
    try {
      localStorage.removeItem(TOOLBOX_SPOTLIGHT_STORAGE_KEY);
      setIsCompleted(false);
    } catch (error) {
      console.error("Failed to reset toolbox spotlight state:", error);
    }
  };

  return {
    shouldShow: isInitialized && !isCompleted,
    complete,
    reset,
  };
}

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseUndoRedoOptions<T> {
  maxHistorySize?: number;
  onStateChange?: (state: T) => void;
}

interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (initialState: T) => void;
}

export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions<T> = {}
): UseUndoRedoReturn<T> {
  const { maxHistorySize = 50, onStateChange } = options;

  const [state, setStateInternal] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setStateInternal((prev) => {
        const nextState = typeof newState === 'function' ? (newState as (prev: T) => T)(prev) : newState;

        if (!isUndoRedoAction.current) {
          // Add to history
          setHistory((h) => {
            const newHistory = h.slice(0, currentIndex + 1);
            newHistory.push(nextState);
            // Limit history size
            if (newHistory.length > maxHistorySize) {
              newHistory.shift();
              setCurrentIndex((i) => i - 1);
            }
            return newHistory;
          });
          setCurrentIndex((i) => (history.length >= maxHistorySize ? i : i + 1));
        }

        if (onStateChange) {
          onStateChange(nextState);
        }

        return nextState;
      });
    },
    [currentIndex, history.length, maxHistorySize, onStateChange]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoRedoAction.current = true;
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setStateInternal(history[newIndex]);
      if (onStateChange) {
        onStateChange(history[newIndex]);
      }
      setTimeout(() => {
        isUndoRedoAction.current = false;
      }, 0);
    }
  }, [currentIndex, history, onStateChange]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setStateInternal(history[newIndex]);
      if (onStateChange) {
        onStateChange(history[newIndex]);
      }
      setTimeout(() => {
        isUndoRedoAction.current = false;
      }, 0);
    }
  }, [currentIndex, history, onStateChange]);

  const reset = useCallback((newInitialState: T) => {
    setStateInternal(newInitialState);
    setHistory([newInitialState]);
    setCurrentIndex(0);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}

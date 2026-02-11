import { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableFloatingPanelOptions {
  initialPosition?: Position;
  storageKey?: string;
  constrainToViewport?: boolean;
  elementSize?: { width: number; height: number };
}

export function useDraggableFloatingPanel({
  initialPosition = { x: 20, y: 100 },
  storageKey,
  constrainToViewport = true,
  elementSize = { width: 300, height: 400 },
}: UseDraggableFloatingPanelOptions = {}) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const elementStartPos = useRef<Position>({ x: 0, y: 0 });

  // Load position from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPosition(parsed);
        }
      } catch (error) {
        console.error('Failed to load panel position:', error);
      }
    }
  }, [storageKey]);

  // Save position to localStorage when it changes
  useEffect(() => {
    if (storageKey && !isDragging) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(position));
      } catch (error) {
        console.error('Failed to save panel position:', error);
      }
    }
  }, [position, storageKey, isDragging]);

  const constrainPosition = useCallback((pos: Position, elWidth: number, elHeight: number): Position => {
    if (!constrainToViewport) return pos;

    const maxX = window.innerWidth - elWidth - 20;
    const maxY = window.innerHeight - elHeight - 20;

    return {
      x: Math.max(20, Math.min(pos.x, maxX)),
      y: Math.max(20, Math.min(pos.y, maxY)),
    };
  }, [constrainToViewport]);

  const handleMouseDown = useCallback((e: React.MouseEvent, elementRef: HTMLElement | null) => {
    if (!elementRef) return;
    
    e.preventDefault();
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = position;
  }, [position]);

  const handleTouchStart = useCallback((e: React.TouchEvent, elementRef: HTMLElement | null) => {
    if (!elementRef || e.touches.length === 0) return;
    
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    elementStartPos.current = position;
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      const newPos = {
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY,
      };

      setPosition(constrainPosition(newPos, elementSize.width, elementSize.height));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartPos.current.x;
      const deltaY = touch.clientY - dragStartPos.current.y;

      const newPos = {
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY,
      };

      setPosition(constrainPosition(newPos, elementSize.width, elementSize.height));
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, constrainPosition, elementSize]);

  return {
    position,
    isDragging,
    handleMouseDown,
    handleTouchStart,
  };
}

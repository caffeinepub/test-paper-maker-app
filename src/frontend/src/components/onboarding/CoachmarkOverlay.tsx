import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CoachmarkOverlayProps {
  title: string;
  description: string;
  targetSelector: string;
  position?: "top" | "bottom" | "left" | "right";
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export function CoachmarkOverlay({
  title,
  description,
  targetSelector,
  position = "right",
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: CoachmarkOverlayProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [calloutRect, setCalloutRect] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const calloutRef = useRef<HTMLDivElement>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const maxRetries = 15;
    const retryDelay = 300;

    const updateTargetRect = () => {
      const target = document.querySelector(targetSelector);
      if (target && isMounted) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        setShowFallback(false);
        setRetryCount(0);
        return true;
      }
      return false;
    };

    const attemptUpdate = () => {
      if (!updateTargetRect() && retryCount < maxRetries && isMounted) {
        setRetryCount((prev) => prev + 1);
        retryTimerRef.current = setTimeout(attemptUpdate, retryDelay);
      } else if (retryCount >= maxRetries && isMounted) {
        setShowFallback(true);
      }
    };

    // Reset targetRect when selector changes
    setTargetRect(null);
    setRetryCount(0);
    setShowFallback(false);

    // Initial attempt
    attemptUpdate();

    // Set up MutationObserver to watch for DOM changes
    observerRef.current = new MutationObserver(() => {
      if (isMounted) {
        // Use requestAnimationFrame to throttle updates
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
          updateTargetRect();
        });
      }
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Listen to scroll and resize with throttling
    const handleUpdate = () => {
      if (isMounted) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
          updateTargetRect();
        });
      }
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      isMounted = false;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [targetSelector, retryCount]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: title and description are used to re-measure layout when content changes
  useEffect(() => {
    if (calloutRef.current) {
      const rect = calloutRef.current.getBoundingClientRect();
      setCalloutRect({ width: rect.width, height: rect.height });
    }
  }, [title, description]);

  // Fallback UI when target is not found
  if (showFallback || !targetRect) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
        <Card
          ref={calloutRef}
          className="w-80 max-w-[calc(100vw-32px)] shadow-2xl"
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <CardTitle className="text-lg">{title}</CardTitle>
                </div>
                <CardDescription className="mt-1">
                  {description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              {showFallback
                ? "The highlighted element is not currently visible. You can continue the tour or skip it."
                : "Loading tutorial step..."}
            </p>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {stepIndex + 1}/{totalSteps}
                </span>
                {stepIndex > 0 && (
                  <Button variant="outline" size="sm" onClick={onPrev}>
                    Previous
                  </Button>
                )}
                {stepIndex < totalSteps - 1 ? (
                  <Button size="sm" onClick={onNext}>
                    Next
                  </Button>
                ) : (
                  <Button size="sm" onClick={onNext}>
                    Finish
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const spotlightPadding = 12;
  const spotlightX = targetRect.left - spotlightPadding;
  const spotlightY = targetRect.top - spotlightPadding;
  const spotlightWidth = targetRect.width + spotlightPadding * 2;
  const spotlightHeight = targetRect.height + spotlightPadding * 2;

  const getCalloutPosition = () => {
    const gap = 20;
    const padding = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const calloutWidth = calloutRect?.width || 320;
    const calloutHeight = calloutRect?.height || 200;

    let left: number | undefined;
    let top: number | undefined;
    let right: number | undefined;
    let bottom: number | undefined;

    switch (position) {
      case "right":
        left = targetRect.right + gap;
        top = targetRect.top;
        if (left + calloutWidth > viewportWidth - padding) {
          left = viewportWidth - calloutWidth - padding;
        }
        if (top + calloutHeight > viewportHeight - padding) {
          top = viewportHeight - calloutHeight - padding;
        }
        if (top < padding) {
          top = padding;
        }
        break;

      case "left":
        right = viewportWidth - targetRect.left + gap;
        top = targetRect.top;
        if (viewportWidth - right + calloutWidth > viewportWidth - padding) {
          right = viewportWidth - calloutWidth - padding;
        }
        if (top + calloutHeight > viewportHeight - padding) {
          top = viewportHeight - calloutHeight - padding;
        }
        if (top < padding) {
          top = padding;
        }
        break;

      case "bottom":
        left = targetRect.left;
        top = targetRect.bottom + gap;
        if (left + calloutWidth > viewportWidth - padding) {
          left = viewportWidth - calloutWidth - padding;
        }
        if (left < padding) {
          left = padding;
        }
        if (top + calloutHeight > viewportHeight - padding) {
          top = viewportHeight - calloutHeight - padding;
        }
        break;

      case "top":
        left = targetRect.left;
        bottom = viewportHeight - targetRect.top + gap;
        if (left + calloutWidth > viewportWidth - padding) {
          left = viewportWidth - calloutWidth - padding;
        }
        if (left < padding) {
          left = padding;
        }
        if (
          viewportHeight - bottom + calloutHeight >
          viewportHeight - padding
        ) {
          bottom = viewportHeight - calloutHeight - padding;
        }
        break;
    }

    return { left, top, right, bottom };
  };

  const getConnectorPath = () => {
    const calloutPos = getCalloutPosition();
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    let calloutX = 0;
    let calloutY = 0;

    if (calloutPos.left !== undefined) {
      calloutX = calloutPos.left + (calloutRect?.width || 320) / 2;
    } else if (calloutPos.right !== undefined) {
      calloutX =
        window.innerWidth - calloutPos.right - (calloutRect?.width || 320) / 2;
    }

    if (calloutPos.top !== undefined) {
      calloutY = calloutPos.top + (calloutRect?.height || 200) / 2;
    } else if (calloutPos.bottom !== undefined) {
      calloutY =
        window.innerHeight -
        calloutPos.bottom -
        (calloutRect?.height || 200) / 2;
    }

    return `M ${calloutX} ${calloutY} L ${targetCenterX} ${targetCenterY}`;
  };

  const calloutPosition = getCalloutPosition();

  return (
    <div className="fixed inset-0 z-[9999] print:hidden pointer-events-none">
      {/* Four blurred panels creating spotlight hole effect */}
      {/* Top panel */}
      <div
        className="absolute left-0 right-0 bg-black/60 backdrop-blur-sm"
        style={{
          top: 0,
          height: `${Math.max(0, spotlightY)}px`,
        }}
      />

      {/* Bottom panel */}
      <div
        className="absolute left-0 right-0 bg-black/60 backdrop-blur-sm"
        style={{
          top: `${spotlightY + spotlightHeight}px`,
          bottom: 0,
        }}
      />

      {/* Left panel */}
      <div
        className="absolute bg-black/60 backdrop-blur-sm"
        style={{
          top: `${spotlightY}px`,
          left: 0,
          width: `${Math.max(0, spotlightX)}px`,
          height: `${spotlightHeight}px`,
        }}
      />

      {/* Right panel */}
      <div
        className="absolute bg-black/60 backdrop-blur-sm"
        style={{
          top: `${spotlightY}px`,
          left: `${spotlightX + spotlightWidth}px`,
          right: 0,
          height: `${spotlightHeight}px`,
        }}
      />

      {/* Spotlight highlight border with purple primary */}
      <div
        className="absolute rounded-md border-2 border-primary shadow-[0_0_0_4px_rgba(var(--primary-rgb),0.3),0_0_20px_rgba(var(--primary-rgb),0.4)]"
        style={{
          left: `${spotlightX}px`,
          top: `${spotlightY}px`,
          width: `${spotlightWidth}px`,
          height: `${spotlightHeight}px`,
          pointerEvents: "none",
        }}
      />

      {/* Connector line with arrowhead - purple primary */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
        aria-hidden="true"
        role="presentation"
      >
        <defs>
          <marker
            id="arrowhead-primary"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="hsl(var(--primary))" />
          </marker>
        </defs>
        <path
          d={getConnectorPath()}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead-primary)"
        />
      </svg>

      {/* Callout card - enable pointer events */}
      <Card
        ref={calloutRef}
        className="absolute w-80 max-w-[calc(100vw-32px)] shadow-2xl pointer-events-auto"
        style={{
          left:
            calloutPosition.left !== undefined
              ? `${calloutPosition.left}px`
              : undefined,
          top:
            calloutPosition.top !== undefined
              ? `${calloutPosition.top}px`
              : undefined,
          right:
            calloutPosition.right !== undefined
              ? `${calloutPosition.right}px`
              : undefined,
          bottom:
            calloutPosition.bottom !== undefined
              ? `${calloutPosition.bottom}px`
              : undefined,
        }}
      >
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {stepIndex + 1}/{totalSteps}
              </span>
              {stepIndex > 0 && (
                <Button variant="outline" size="sm" onClick={onPrev}>
                  Previous
                </Button>
              )}
              {stepIndex < totalSteps - 1 ? (
                <Button size="sm" onClick={onNext}>
                  Next
                </Button>
              ) : (
                <Button size="sm" onClick={onNext}>
                  Finish
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

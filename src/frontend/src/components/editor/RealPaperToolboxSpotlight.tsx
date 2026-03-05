import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb, X } from "lucide-react";
import { useEffect, useState } from "react";

interface RealPaperToolboxSpotlightProps {
  onComplete: () => void;
}

export function RealPaperToolboxSpotlight({
  onComplete,
}: RealPaperToolboxSpotlightProps) {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [_position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Find the toolbox element
    const findTarget = () => {
      const desktop = document.querySelector(
        '[data-coachmark="real-paper-toolbox"]',
      ) as HTMLElement;
      const mobile = document.querySelector(
        '[data-coachmark="mobile-real-paper-toolbox"]',
      ) as HTMLElement;
      return desktop || mobile;
    };

    let attempts = 0;
    const maxAttempts = 15;
    const interval = setInterval(() => {
      const target = findTarget();
      if (target) {
        setTargetElement(target);
        clearInterval(interval);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [targetElement]);

  if (!targetElement) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Toolbox Tutorial
            </CardTitle>
            <CardDescription>
              The toolbox is loading. If it doesn't appear, you can dismiss this
              message.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onComplete} className="w-full">
              Got it
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rect = targetElement.getBoundingClientRect();
  const calloutLeft = rect.right + 20;
  const calloutTop = rect.top + rect.height / 2;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
        onClick={onComplete}
        onKeyDown={(e) => e.key === "Escape" && onComplete()}
        role="button"
        tabIndex={0}
        aria-label="Close tutorial"
      />

      {/* Highlight */}
      <div
        className="fixed z-[9999] rounded-lg border-4 border-dashed border-primary shadow-2xl pointer-events-none"
        style={{
          top: `${rect.top - 8}px`,
          left: `${rect.left - 8}px`,
          width: `${rect.width + 16}px`,
          height: `${rect.height + 16}px`,
        }}
      />

      {/* Callout */}
      <Card
        className="fixed z-[9999] max-w-sm shadow-2xl"
        style={{
          top: `${calloutTop}px`,
          left: `${calloutLeft}px`,
          transform: "translateY(-50%)",
        }}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Real Paper Toolbox</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onComplete}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Use this floating toolbox to add questions directly to your paper.
            Select a section and heading, then choose a question type to insert.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onComplete} className="w-full">
            Got it
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

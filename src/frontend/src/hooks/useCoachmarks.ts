import { useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useMockStore } from "../state/mockStore";

interface CoachmarkStep {
  title: string;
  description: string;
  targetSelector: string;
  position: "top" | "bottom" | "left" | "right";
}

const coachmarkSteps: CoachmarkStep[] = [
  {
    title: "Welcome to Test Paper Maker",
    description:
      "Let's take a quick tour of the key features to help you get started.",
    targetSelector: "#create-paper-cta",
    position: "bottom",
  },
  {
    title: "Create New Papers",
    description:
      "Click here to start creating a new test paper. You can set up sections, marks, and time limits.",
    targetSelector: "#nav-create-paper",
    position: "right",
  },
  {
    title: "Question Bank",
    description:
      "Browse starter questions or manage your personal question library here.",
    targetSelector: "#nav-question-bank",
    position: "right",
  },
  {
    title: "AI Assistant",
    description:
      "Use the AI button to generate question suggestions based on your topics and preferences.",
    targetSelector: '[data-coachmark="ai-button"]',
    position: "left",
  },
];

export function useCoachmarks() {
  const { completeOnboarding } = useMockStore();
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Check for tutorial start flag on mount and location changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: location.pathname detects navigation changes
  useEffect(() => {
    const shouldStartTutorial =
      localStorage.getItem("start-tutorial") === "true";

    if (shouldStartTutorial && !isActive) {
      // Clear the flag
      localStorage.removeItem("start-tutorial");

      // Delay to ensure DOM is ready and navigation is complete
      const timer = setTimeout(() => {
        setIsActive(true);
        setStepIndex(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isActive]);

  const nextStep = useCallback(() => {
    if (stepIndex < coachmarkSteps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      setIsActive(false);
      completeOnboarding();
    }
  }, [stepIndex, completeOnboarding]);

  const prevStep = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }, [stepIndex]);

  const skip = useCallback(() => {
    setIsActive(false);
    completeOnboarding();
  }, [completeOnboarding]);

  return {
    isActive,
    currentStep: isActive ? coachmarkSteps[stepIndex] : null,
    stepIndex,
    totalSteps: coachmarkSteps.length,
    nextStep,
    prevStep,
    skip,
  };
}

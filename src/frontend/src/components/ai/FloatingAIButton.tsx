import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function FloatingAIButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: "/ai" });
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg"
      aria-label="Open AI Assistant"
      data-coachmark="ai-button"
    >
      <Sparkles className="h-6 w-6" />
    </Button>
  );
}

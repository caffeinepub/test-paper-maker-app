import { useNavigate } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export function OnboardingWireframe() {
  const navigate = useNavigate();
  const { completeOnboarding } = useMockStore();

  const handleStartTutorial = () => {
    // Set flag to start tutorial and complete onboarding to allow navigation
    localStorage.setItem('start-tutorial', 'true');
    completeOnboarding();
    navigate({ to: '/home' });
  };

  const handleSkip = () => {
    // Clear any tutorial flags and complete onboarding
    localStorage.removeItem('start-tutorial');
    completeOnboarding();
    navigate({ to: '/home' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome to Test Paper Maker</CardTitle>
          <CardDescription className="text-base">
            Create professional exam papers quickly and easily
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">
              This app helps teachers design unit tests, manage question banks, and export print-ready PDFs.
            </p>
            <p className="text-muted-foreground">
              We'll show you around with an interactive tutorial highlighting key features.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={handleStartTutorial} className="sm:min-w-[200px]">
              Start Interactive Tutorial
            </Button>
            <Button size="lg" variant="outline" onClick={handleSkip} className="sm:min-w-[200px]">
              Skip Tutorial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

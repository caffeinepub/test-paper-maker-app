import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { NavigationDrawer } from '../navigation/NavigationDrawer';
import { CoachmarkOverlay } from '../onboarding/CoachmarkOverlay';
import { useMockStore } from '../../state/mockStore';
import { useCoachmarks } from '../../hooks/useCoachmarks';
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isInitialized, isLoggedIn, onboardingCompleted } = useMockStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const coachmarks = useCoachmarks();

  const isLoginPage = location.pathname === '/';
  const isOnboardingPage = location.pathname === '/onboarding';

  useEffect(() => {
    // Wait for store to initialize before redirecting
    if (!isInitialized) return;

    // Check if tutorial is being started
    const startingTutorial = localStorage.getItem('start-tutorial') === 'true';

    if (!isLoggedIn && !isLoginPage) {
      navigate({ to: '/' });
    } else if (isLoggedIn && !onboardingCompleted && !isOnboardingPage && !isLoginPage && !startingTutorial) {
      navigate({ to: '/onboarding' });
    } else if (isLoggedIn && onboardingCompleted && (isLoginPage || isOnboardingPage) && !startingTutorial) {
      // User completed onboarding, redirect to home
      navigate({ to: '/home' });
    }
  }, [isInitialized, isLoggedIn, onboardingCompleted, isLoginPage, isOnboardingPage, navigate]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoginPage || isOnboardingPage) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-border bg-card">
        <NavigationDrawer onNavigate={() => {}} />
      </aside>

      {/* Mobile Layout */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavigationDrawer onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold text-foreground">Test Paper Maker</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Coachmark Overlay */}
      {coachmarks.isActive && coachmarks.currentStep && (
        <CoachmarkOverlay
          title={coachmarks.currentStep.title}
          description={coachmarks.currentStep.description}
          targetSelector={coachmarks.currentStep.targetSelector}
          position={coachmarks.currentStep.position}
          stepIndex={coachmarks.stepIndex}
          totalSteps={coachmarks.totalSteps}
          onNext={coachmarks.nextStep}
          onPrev={coachmarks.prevStep}
          onSkip={coachmarks.skip}
        />
      )}
    </div>
  );
}

import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { NavigationDrawer } from '../navigation/NavigationDrawer';
import { CoachmarkOverlay } from '../onboarding/CoachmarkOverlay';
import { useMockStore } from '../../state/mockStore';
import { useCoachmarks } from '../../hooks/useCoachmarks';
import { useTheme } from '../../hooks/useTheme';
import { useEffect, useState } from 'react';
import { Menu, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { safeGetItem } from '../../lib/storage/safeStorage';

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isInitialized, initializationError, isLoggedIn, onboardingCompleted, retryInitialization, logout } = useMockStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const coachmarks = useCoachmarks();
  
  // Initialize theme at the shell level to ensure it's applied globally
  useTheme();

  const isLoginPage = location.pathname === '/';
  const isOnboardingPage = location.pathname === '/onboarding';

  useEffect(() => {
    // Wait for store to initialize before redirecting
    if (!isInitialized) return;

    // Check if tutorial is being started
    const startingTutorial = safeGetItem('start-tutorial') === 'true';

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
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show initialization error with recovery options
  if (initializationError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Storage Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Cannot Access Local Storage</AlertTitle>
              <AlertDescription className="mt-2">
                {initializationError}
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>This app requires local storage to save your data. Please:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Check your browser's privacy settings</li>
                <li>Disable private/incognito mode</li>
                <li>Allow cookies and site data</li>
                <li>Try a different browser</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={retryInitialization} className="flex-1">
                Retry
              </Button>
              <Button onClick={() => navigate({ to: '/' })} variant="outline" className="flex-1">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoginPage || isOnboardingPage) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-dvh overflow-hidden bg-background">
      {/* Desktop Sidebar - White in light mode */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-sidebar-border bg-sidebar">
        <NavigationDrawer onNavigate={() => {}} />
      </aside>

      {/* Mobile Layout */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header - White in light mode */}
        <header className="flex items-center gap-4 border-b border-sidebar-border bg-sidebar px-4 py-3 lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
              <NavigationDrawer onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold text-sidebar-foreground">Test Paper Maker</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>

      {/* Coachmark Overlay */}
      {coachmarks.isActive && coachmarks.currentStep && (
        <CoachmarkOverlay
          targetSelector={coachmarks.currentStep.targetSelector}
          position={coachmarks.currentStep.position}
          title={coachmarks.currentStep.title}
          description={coachmarks.currentStep.description}
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

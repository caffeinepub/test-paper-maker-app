import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function LoginWireframe() {
  const navigate = useNavigate();
  const { login: mockLogin, isLoggedIn, onboardingCompleted } = useMockStore();
  const { login: iiLogin, loginStatus } = useInternetIdentity();

  useEffect(() => {
    // Redirect if already logged in
    if (isLoggedIn) {
      if (onboardingCompleted) {
        navigate({ to: '/home' });
      } else {
        navigate({ to: '/onboarding' });
      }
    }
  }, [isLoggedIn, onboardingCompleted, navigate]);

  const handleInternetIdentityLogin = () => {
    iiLogin();
    mockLogin(false);
    if (onboardingCompleted) {
      navigate({ to: '/home' });
    } else {
      navigate({ to: '/onboarding' });
    }
  };

  const handleGuestLogin = () => {
    mockLogin(true);
    if (onboardingCompleted) {
      navigate({ to: '/home' });
    } else {
      navigate({ to: '/onboarding' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Test Paper Maker</CardTitle>
          <CardDescription>Create professional exam papers with ease</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleInternetIdentityLogin}
            className="w-full"
            size="lg"
            disabled={loginStatus === 'logging-in'}
          >
            {loginStatus === 'logging-in' ? 'Connecting...' : 'Login with Internet Identity'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button onClick={handleGuestLogin} variant="outline" className="w-full" size="lg">
            Continue as Guest
          </Button>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Guest mode:</strong> Your work is saved locally in your browser. Data may be
              lost if you clear browser storage. Login with Internet Identity for secure cloud
              storage.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

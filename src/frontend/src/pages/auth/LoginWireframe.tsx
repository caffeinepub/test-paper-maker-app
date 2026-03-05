import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { LogIn, UserCircle } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useMockStore } from "../../state/mockStore";

export function LoginWireframe() {
  const navigate = useNavigate();
  const { login: iiLogin, loginStatus } = useInternetIdentity();
  const { login } = useMockStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleInternetIdentityLogin = async () => {
    setIsLoggingIn(true);
    try {
      await iiLogin();
      login();
      navigate({ to: "/home" });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = () => {
    login();
    navigate({ to: "/home" });
  };

  const isLoading = isLoggingIn || loginStatus === "logging-in";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Test Paper Maker</CardTitle>
          <CardDescription className="mt-2">
            Create professional test papers with ease
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleInternetIdentityLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            {isLoading ? "Logging in..." : "Login with Internet Identity"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            onClick={handleGuestLogin}
            variant="outline"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            <UserCircle className="mr-2 h-5 w-5" />
            Continue as Guest
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Guest mode stores data locally on your device
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

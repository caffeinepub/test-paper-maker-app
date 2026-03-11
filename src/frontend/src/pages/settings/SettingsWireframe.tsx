import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  Globe,
  Monitor,
  Moon,
  RotateCcw,
  Settings,
  Sun,
  Trash2,
} from "lucide-react";
import { TOOLBOX_SPOTLIGHT_STORAGE_KEY } from "../../hooks/useRealPaperToolboxSpotlight";
import { useTheme } from "../../hooks/useTheme";
import { LANGUAGES } from "../../lib/i18n/translations";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { useMockStore } from "../../state/mockStore";

export function SettingsWireframe() {
  const navigate = useNavigate();
  const { resetTutorial, clearAllData } = useMockStore();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleResetTutorial = () => {
    resetTutorial();
    try {
      localStorage.removeItem(TOOLBOX_SPOTLIGHT_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to reset toolbox spotlight:", error);
    }
    localStorage.setItem("start-tutorial", "true");
    navigate({ to: "/home" });
  };

  const handleClearData = () => {
    clearAllData();
    navigate({ to: "/" });
  };

  const handleThemeChange = (value: string) => {
    if (value === "light" || value === "dark" || value === "system") {
      setTheme(value);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <Settings className="h-8 w-8 text-primary" />
          {t("heading.settings")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your app preferences and data
        </p>
      </div>

      <div className="space-y-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {t("label.language")}
            </CardTitle>
            <CardDescription>
              Choose your preferred language for the app interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="language-select">{t("label.language")}</Label>
              <Select
                value={language}
                onValueChange={(val) => setLanguage(val as typeof language)}
              >
                <SelectTrigger
                  id="language-select"
                  className="w-full"
                  data-ocid="settings.language.select"
                >
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{lang.nativeLabel}</span>
                        <span className="text-xs text-muted-foreground">
                          {lang.label}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("label.appearance")}</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme-select">{t("label.theme")}</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger
                  id="theme-select"
                  className="w-full"
                  data-ocid="settings.theme.select"
                >
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tutorial Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Tutorial</CardTitle>
            <CardDescription>Restart the interactive tutorial</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  data-ocid="settings.tutorial.button"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Tutorial
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Tutorial?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will restart the interactive tutorial from the
                    beginning. You'll be taken to the home screen where the
                    tutorial will start automatically.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("btn.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetTutorial}>
                    {t("btn.reset")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Separator />

        {/* Data Management */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  data-ocid="settings.clear_data.button"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Data & Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    all your papers, questions, and profile data from this
                    device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("btn.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

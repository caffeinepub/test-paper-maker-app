import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  FilePenLine,
  FileText,
  Home,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  Upload,
  User,
} from "lucide-react";
import { createNewPaper } from "../../lib/papers/createNewPaper";
import { useMockStore } from "../../state/mockStore";

interface NavigationDrawerProps {
  onNavigate: () => void;
}

export function NavigationDrawer({ onNavigate }: NavigationDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isInitialized, profile, addPaper, logout } = useMockStore();

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    onNavigate();
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
    onNavigate();
  };

  const handleCreatePaper = () => {
    // Wait for store to be initialized before creating paper
    if (!isInitialized) return;

    const newPaper = createNewPaper(profile);
    addPaper(newPaper);
    navigate({ to: `/editor/${newPaper.id}` });
    onNavigate();
  };

  const isActive = (path: string) => {
    if (path === "/ocr/upload") {
      return location.pathname.startsWith("/ocr");
    }
    return location.pathname === path;
  };

  const navBtnClass = (path: string) =>
    isActive(path)
      ? "w-full justify-start bg-accent text-foreground font-medium"
      : "w-full justify-start text-foreground hover:bg-muted hover:text-foreground";

  return (
    <div
      className="flex h-full flex-col bg-white"
      style={{ colorScheme: "light" }}
    >
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-xl font-bold text-foreground">Test Paper Maker</h2>
        <p className="text-sm text-muted-foreground">
          {profile.teacherName || "Teacher"}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <Button
          data-coachmark="nav-create-paper"
          id="nav-create-paper"
          variant="ghost"
          className={
            isActive("/editor")
              ? "w-full justify-start bg-accent text-foreground font-medium"
              : "w-full justify-start text-foreground hover:bg-muted hover:text-foreground"
          }
          onClick={handleCreatePaper}
          disabled={!isInitialized}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Paper
        </Button>

        <Button
          variant="ghost"
          className={navBtnClass("/home")}
          onClick={() => handleNavigation("/home")}
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>

        <Button
          variant="ghost"
          className={navBtnClass("/papers")}
          onClick={() => handleNavigation("/papers")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Generated Papers
        </Button>

        <Button
          variant="ghost"
          className={navBtnClass("/draft")}
          onClick={() => handleNavigation("/draft")}
        >
          <FilePenLine className="mr-2 h-4 w-4" />
          Draft
        </Button>

        <Button
          data-coachmark="nav-question-bank"
          id="nav-question-bank"
          variant="ghost"
          className={navBtnClass("/question-bank")}
          onClick={() => handleNavigation("/question-bank")}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Question Bank
        </Button>

        <Button
          variant="ghost"
          className={navBtnClass("/ai")}
          onClick={() => handleNavigation("/ai")}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Assistant
        </Button>

        <Button
          variant="ghost"
          className={navBtnClass("/ocr/upload")}
          onClick={() => handleNavigation("/ocr/upload")}
        >
          <Upload className="mr-2 h-4 w-4" />
          OCR Upload
        </Button>

        <Separator className="my-2 bg-border" />

        <Button
          variant="ghost"
          className={navBtnClass("/profile")}
          onClick={() => handleNavigation("/profile")}
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>

        <Button
          variant="ghost"
          className={navBtnClass("/settings")}
          onClick={() => handleNavigation("/settings")}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-foreground hover:bg-muted hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

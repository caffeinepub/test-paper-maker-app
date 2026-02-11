import { useNavigate, useLocation } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Home, FileText, BookOpen, Sparkles, Upload, Settings, LogOut, Plus, User, FilePenLine } from 'lucide-react';
import { createNewPaper } from '../../lib/papers/createNewPaper';

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
    navigate({ to: '/' });
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
    if (path === '/ocr/upload') {
      return location.pathname.startsWith('/ocr');
    }
    return location.pathname === path;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-xl font-bold text-foreground">Test Paper Maker</h2>
        <p className="text-sm text-muted-foreground">{profile.teacherName || 'Teacher'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <Button
          data-coachmark="nav-create-paper"
          id="nav-create-paper"
          variant={isActive('/editor') ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={handleCreatePaper}
          disabled={!isInitialized}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Paper
        </Button>

        <Button
          variant={isActive('/home') ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => handleNavigation('/home')}
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>

        <Button
          variant={isActive('/papers') ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => handleNavigation('/papers')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Generated Papers
        </Button>

        <Button
          variant={isActive('/draft') ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => handleNavigation('/draft')}
        >
          <FilePenLine className="mr-2 h-4 w-4" />
          Draft
        </Button>

        <Button
          data-coachmark="nav-question-bank"
          id="nav-question-bank"
          variant={isActive('/question-bank') ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => handleNavigation('/question-bank')}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Question Bank
        </Button>

        <Button
          variant={isActive('/ai') ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => handleNavigation('/ai')}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Assistant
        </Button>

        <Button
          variant={isActive('/ocr/upload') ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => handleNavigation('/ocr/upload')}
        >
          <Upload className="mr-2 h-4 w-4" />
          OCR Upload
        </Button>

        <Separator className="my-4" />

        <Button
          variant={isActive('/profile') ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => handleNavigation('/profile')}
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>

        <Button
          data-coachmark="nav-settings"
          variant={isActive('/settings') ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => handleNavigation('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

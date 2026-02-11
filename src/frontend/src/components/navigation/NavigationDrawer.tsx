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
    <div className="flex h-full flex-col bg-sidebar">
      {/* Header */}
      <div className="border-b border-sidebar-border p-4 bg-sidebar">
        <h2 className="text-xl font-bold text-sidebar-foreground">Test Paper Maker</h2>
        <p className="text-sm text-sidebar-foreground/80">{profile.teacherName || 'Teacher'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 bg-sidebar">
        <Button
          data-coachmark="nav-create-paper"
          id="nav-create-paper"
          variant={isActive('/editor') ? 'default' : 'ghost'}
          className={
            isActive('/editor')
              ? 'w-full justify-start bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
              : 'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
          onClick={handleCreatePaper}
          disabled={!isInitialized}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Paper
        </Button>

        <Button
          variant="ghost"
          className={
            isActive('/home')
              ? 'w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground'
              : 'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
          onClick={() => handleNavigation('/home')}
        >
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>

        <Button
          variant="ghost"
          className={
            isActive('/papers')
              ? 'w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground'
              : 'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
          onClick={() => handleNavigation('/papers')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Generated Papers
        </Button>

        <Button
          variant="ghost"
          className={
            isActive('/draft')
              ? 'w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground'
              : 'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
          onClick={() => handleNavigation('/draft')}
        >
          <FilePenLine className="mr-2 h-4 w-4" />
          Draft
        </Button>

        <Button
          data-coachmark="nav-question-bank"
          id="nav-question-bank"
          variant="ghost"
          className={
            isActive('/question-bank')
              ? 'w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground'
              : 'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
          onClick={() => handleNavigation('/question-bank')}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Question Bank
        </Button>

        <Button
          variant="ghost"
          className={
            isActive('/ai')
              ? 'w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground'
              : 'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
          onClick={() => handleNavigation('/ai')}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Assistant
        </Button>

        <Button
          variant="ghost"
          className={
            isActive('/ocr/upload')
              ? 'w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground'
              : 'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
          onClick={() => handleNavigation('/ocr/upload')}
        >
          <Upload className="mr-2 h-4 w-4" />
          OCR Upload
        </Button>

        <Separator className="my-2 bg-sidebar-border" />

        <Button
          variant="ghost"
          className={
            isActive('/profile')
              ? 'w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground'
              : 'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
          onClick={() => handleNavigation('/profile')}
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>

        <Button
          variant="ghost"
          className={
            isActive('/settings')
              ? 'w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground'
              : 'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
          onClick={() => handleNavigation('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4 bg-sidebar">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}


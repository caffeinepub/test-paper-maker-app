import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertCircle, RefreshCw } from 'lucide-react';

interface DraftItem {
  id: string;
  title: string;
  lastModified: string;
  type: string;
}

export function DraftWireframe() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDrafts = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Attempt to load drafts from localStorage
      const storedDrafts = localStorage.getItem('app-drafts');
      
      if (storedDrafts) {
        const parsed = JSON.parse(storedDrafts);
        setDrafts(Array.isArray(parsed) ? parsed : []);
      } else {
        setDrafts([]);
      }
    } catch (err) {
      console.error('Failed to load drafts:', err);
      setError('Failed to load drafts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading drafts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Error Loading Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={loadDrafts} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button onClick={() => navigate({ to: '/home' })} variant="secondary">
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Drafts</h1>
        <p className="text-muted-foreground mt-2">
          Your saved drafts and work in progress
        </p>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No Drafts Yet</CardTitle>
            <CardDescription className="text-center mb-6 max-w-md">
              You don't have any saved drafts. Start creating a new test paper or add questions to your question bank.
            </CardDescription>
            <div className="flex gap-2">
              <Button onClick={() => navigate({ to: '/home' })}>
                Go to Home
              </Button>
              <Button onClick={() => navigate({ to: '/papers' })} variant="outline">
                View Papers
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <Card key={draft.id} className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {draft.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Last modified: {draft.lastModified}
                    </CardDescription>
                  </div>
                  <Button size="sm">Open</Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { safeGetItem, isStorageAvailable, getStorageError } from '../../lib/storage/safeStorage';

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

    // Check storage availability first
    if (!isStorageAvailable()) {
      const storageError = getStorageError() || 'Storage is not available';
      setError(`Cannot access storage: ${storageError}`);
      setIsLoading(false);
      return;
    }

    try {
      // Attempt to load drafts from localStorage
      const storedDrafts = safeGetItem('app-drafts');
      
      if (storedDrafts) {
        const parsed = JSON.parse(storedDrafts);
        setDrafts(Array.isArray(parsed) ? parsed : []);
      } else {
        setDrafts([]);
      }
    } catch (err) {
      console.error('Failed to load drafts:', err);
      setError('Failed to load drafts. Storage may be blocked or corrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="container mx-auto max-w-4xl p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="text-muted-foreground">Loading drafts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-background">
        <div className="container mx-auto max-w-4xl p-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Error Loading Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Storage Access Error</AlertTitle>
                <AlertDescription className="mt-2">
                  {error}
                </AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <p>To fix this issue:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check your browser's privacy settings</li>
                  <li>Disable private/incognito mode</li>
                  <li>Allow cookies and site data for this site</li>
                  <li>Clear browser cache and reload</li>
                </ul>
              </div>
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
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Drafts</h1>
          <p className="text-muted-foreground mt-2">
            Your saved drafts and work in progress
          </p>
        </div>

        {drafts.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <CardTitle className="mb-2 text-foreground">No Drafts Yet</CardTitle>
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
          <div className="grid gap-4 md:grid-cols-2">
            {drafts.map((draft) => (
              <Card key={draft.id} className="border-border bg-card hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-foreground">{draft.title}</CardTitle>
                  <CardDescription>
                    {draft.type} • Last modified: {new Date(draft.lastModified).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Open Draft
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

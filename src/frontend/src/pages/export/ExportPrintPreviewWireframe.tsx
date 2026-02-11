import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaperSurface } from '../../components/paper/PaperSurface';
import { PaperActionOverflowMenu } from '../../components/paper/PaperActionOverflowMenu';
import { AlertCircle, Sparkles, Info } from 'lucide-react';

export function ExportPrintPreviewWireframe() {
  const navigate = useNavigate();
  const { paperId } = useParams({ from: '/export/$paperId' });
  const { getPaperById, updatePaper, profile } = useMockStore();

  const paper = getPaperById(paperId);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [previewTab, setPreviewTab] = useState<'original' | 'professional'>('original');

  const currentLayoutMode = paper?.layoutMode || 'original';

  const handleOpenCleanup = () => {
    setShowCleanupDialog(true);
    setPreviewTab('original');
  };

  const handleSaveCleanedVersion = () => {
    if (paper) {
      updatePaper(paperId, { layoutMode: 'professional' });
    }
    setShowCleanupDialog(false);
  };

  const handleKeepOriginal = () => {
    if (paper) {
      updatePaper(paperId, { layoutMode: 'original' });
    }
    setShowCleanupDialog(false);
  };

  if (!paper) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Paper Not Found</CardTitle>
            </div>
            <CardDescription>
              The paper you're trying to export doesn't exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => navigate({ to: '/papers' })}>View All Papers</Button>
            <Button variant="outline" onClick={() => navigate({ to: '/home' })}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProfessionalMode = currentLayoutMode === 'professional';

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Export & Print Preview</h1>
          <p className="mt-2 text-muted-foreground">Review and export your paper</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate({ to: `/editor/${paperId}/real-paper` })}>
            Back to Editor
          </Button>
          <PaperActionOverflowMenu paperId={paperId} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Actions */}
        <div className="space-y-4 lg:col-span-1 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
              <CardDescription>Current layout mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">
                  Active Mode: <span className="text-primary">{isProfessionalMode ? 'Professional' : 'Original'}</span>
                </p>
              </div>
              <Button variant="outline" className="w-full" size="lg" onClick={handleOpenCleanup}>
                <Sparkles className="mr-2 h-4 w-4" />
                Auto Format (Layout Only)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Print Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Paper Size: A4</p>
              <p>• Margins: Standard</p>
              <p>• Include Logo: {profile.schoolLogo ? 'Yes' : 'No'}</p>
              <p>• Layout Mode: {isProfessionalMode ? 'Professional' : 'Original'}</p>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Use your browser's print dialog to save as PDF or adjust print settings.
            </AlertDescription>
          </Alert>
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-2">
          <Card className="print:border-0 print:shadow-none">
            <CardHeader className="print:hidden">
              <CardTitle>Paper Preview</CardTitle>
              <CardDescription>This is how your paper will look when printed</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PaperSurface paper={paper} isEditable={false} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Professional Cleanup Dialog with Comparison */}
      <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Professional Auto Format (Layout Only)
            </DialogTitle>
            <DialogDescription>
              Compare the original and professionally formatted versions. <strong>No text content, wording, or spelling will be changed</strong> — only spacing, alignment, and layout will be improved.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={previewTab} onValueChange={(v) => setPreviewTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original">Original Version</TabsTrigger>
              <TabsTrigger value="professional">Cleaned Version</TabsTrigger>
            </TabsList>

            <TabsContent value="original" className="mt-4">
              <div className="max-h-[60vh] overflow-y-auto rounded-lg border-2 border-border">
                <PaperSurface paper={{ ...paper, layoutMode: 'original' }} isEditable={false} />
              </div>
            </TabsContent>

            <TabsContent value="professional" className="mt-4">
              <div className="max-h-[60vh] overflow-y-auto rounded-lg border-2 border-primary">
                <PaperSurface paper={{ ...paper, layoutMode: 'professional' }} isEditable={false} />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleKeepOriginal} className="w-full sm:w-auto">
              Keep Original Version
            </Button>
            <Button onClick={handleSaveCleanedVersion} className="w-full sm:w-auto">
              <Sparkles className="mr-2 h-4 w-4" />
              Save Cleaned Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

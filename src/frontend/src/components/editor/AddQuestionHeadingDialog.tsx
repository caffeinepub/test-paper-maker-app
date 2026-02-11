import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuestionHeading } from '../../state/mockData';

interface AddQuestionHeadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (heading: Omit<QuestionHeading, 'id'>) => void;
}

export function AddQuestionHeadingDialog({ open, onOpenChange, onAdd }: AddQuestionHeadingDialogProps) {
  const [title, setTitle] = useState('');
  const [plannedCount, setPlannedCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      plannedCount: plannedCount,
    });

    // Reset form
    setTitle('');
    setPlannedCount(5);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Question Heading</DialogTitle>
            <DialogDescription>
              Create a new heading to organize questions within this section.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="heading-title">Heading Title</Label>
              <Input
                id="heading-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Short Answer Questions"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planned-count">Planned Question Count</Label>
              <Input
                id="planned-count"
                type="number"
                min="0"
                value={plannedCount}
                onChange={(e) => setPlannedCount(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Approximate number of questions you plan to add under this heading
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Add Heading
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

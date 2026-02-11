import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuestionHeading } from '../../state/mockData';

interface AddQuestionHeadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (heading: Omit<QuestionHeading, 'id'>) => void;
}

export function AddQuestionHeadingDialog({
  open,
  onOpenChange,
  onAdd,
}: AddQuestionHeadingDialogProps) {
  const [title, setTitle] = useState('');
  const [plannedCount, setPlannedCount] = useState(1);

  const handleAdd = () => {
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        plannedQuestionCount: plannedCount,
      });
      setTitle('');
      setPlannedCount(1);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setPlannedCount(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
              placeholder="e.g., MCQ, True or False, Fill in the Blanks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd();
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="planned-count">Number of Questions</Label>
            <Input
              id="planned-count"
              type="number"
              min="0"
              value={plannedCount}
              onChange={(e) => setPlannedCount(Math.max(0, parseInt(e.target.value) || 0))}
            />
            <p className="text-xs text-muted-foreground">
              Planned number of questions under this heading
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!title.trim()}>
            Add Heading
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

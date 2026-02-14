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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BOARDS, STANDARDS, QUESTION_TYPES } from '../../lib/questionBank/questionBankTaxonomy';

interface QuestionCategorizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (metadata: { board: string; standard: string; questionType: string }) => void;
  defaultBoard?: string;
  defaultStandard?: string;
}

export function QuestionCategorizationDialog({
  open,
  onOpenChange,
  onConfirm,
  defaultBoard,
  defaultStandard,
}: QuestionCategorizationDialogProps) {
  const [board, setBoard] = useState(defaultBoard || BOARDS[0]);
  const [standard, setStandard] = useState(defaultStandard || STANDARDS[9]); // Default to Standard 10
  const [questionType, setQuestionType] = useState('short-answer');

  const handleConfirm = () => {
    onConfirm({ board, standard, questionType });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Categorize Questions</DialogTitle>
          <DialogDescription>
            Select the board, standard, and question type for these questions to organize them in your Question Bank.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="board">Board</Label>
            <Select value={board} onValueChange={setBoard}>
              <SelectTrigger id="board">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOARDS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="standard">Standard</Label>
            <Select value={standard} onValueChange={setStandard}>
              <SelectTrigger id="standard">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STANDARDS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="questionType">Question Type</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger id="questionType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.filter((t) => t.value !== 'all').map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

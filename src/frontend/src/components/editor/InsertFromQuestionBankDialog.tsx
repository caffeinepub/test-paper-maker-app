import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { BOARDS, STANDARDS } from "../../lib/questionBank/questionBankTaxonomy";

interface InsertFromQuestionBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (board: string, standard: string) => void;
}

export function InsertFromQuestionBankDialog({
  open,
  onOpenChange,
  onConfirm,
}: InsertFromQuestionBankDialogProps) {
  const [board, setBoard] = useState<string>(BOARDS[0]);
  const [standard, setStandard] = useState<string>(STANDARDS[9]); // Default to Standard 10

  const handleConfirm = () => {
    onConfirm(board, standard);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Board and Standard</DialogTitle>
          <DialogDescription>
            Choose the board and standard to browse questions from your Question
            Bank.
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

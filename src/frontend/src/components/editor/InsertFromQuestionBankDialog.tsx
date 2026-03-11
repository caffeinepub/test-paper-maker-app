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
import { BOARDS } from "../../lib/questionBank/questionBankTaxonomy";
import { useMockStore } from "../../state/mockStore";

interface InsertFromQuestionBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Now passes board + standardId (the id in standards array) */
  onConfirm: (board: string, standardId: string) => void;
}

export function InsertFromQuestionBankDialog({
  open,
  onOpenChange,
  onConfirm,
}: InsertFromQuestionBankDialogProps) {
  const { standards } = useMockStore();
  const defaultStandardId =
    standards.find((s) => s.name === "Standard 10")?.id ||
    standards[9]?.id ||
    standards[0]?.id ||
    "";
  const [board, setBoard] = useState<string>(BOARDS[0]);
  const [standardId, setStandardId] = useState<string>(defaultStandardId);

  const handleConfirm = () => {
    onConfirm(board, standardId);
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
            <Select value={standardId} onValueChange={setStandardId}>
              <SelectTrigger id="standard">
                <SelectValue placeholder="Select standard" />
              </SelectTrigger>
              <SelectContent>
                {standards.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
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

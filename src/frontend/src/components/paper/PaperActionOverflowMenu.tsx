import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { FileDown, Key, MoreVertical, Printer, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMockStore } from "../../state/mockStore";

interface PaperActionOverflowMenuProps {
  paperId: string;
}

export function PaperActionOverflowMenu({
  paperId,
}: PaperActionOverflowMenuProps) {
  const navigate = useNavigate();
  const { getPaperById, deletePaper } = useMockStore();
  const paper = getPaperById(paperId);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleGoToExport = () => {
    navigate({ to: `/export/${paperId}` });
  };

  const handleDelete = () => {
    deletePaper(paperId);
    navigate({ to: "/papers" });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGoToExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export / Save as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleGoToExport}>
            <Key className="mr-2 h-4 w-4" />
            Answer Key
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Paper
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Paper</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {paper?.title || "Untitled Paper"}"? This action cannot be undone
              and you will be redirected to the papers list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

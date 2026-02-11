import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Printer, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaperActionOverflowMenuProps {
  paperId: string;
}

export function PaperActionOverflowMenu({ paperId }: PaperActionOverflowMenuProps) {
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
    toast.success('Use your browser\'s print dialog to save as PDF');
  };

  const handleShare = async () => {
    setIsSharing(true);

    const shareData = {
      title: 'Test Paper',
      text: 'Check out this test paper I created!',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handlePreview = () => {
    navigate({ to: `/export/${paperId}` });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MoreVertical className="h-4 w-4" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <Download className="mr-2 h-4 w-4" />
          Export (PDF)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleShare} disabled={isSharing}>
          <Share2 className="mr-2 h-4 w-4" />
          {isSharing ? 'Sharing...' : 'Share/Send'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePreview}>
          Preview & Format
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PaperSurface } from "../../components/paper/PaperSurface";
import { useActor } from "../../hooks/useActor";
import { getSharedPaper } from "../../lib/storage/shareStorage";
import type { Paper } from "../../state/mockData";

export function SharedPaperViewWireframe() {
  const navigate = useNavigate();
  const { shareId } = useParams({ from: "/share/$shareId" });
  const { actor } = useActor();
  const [paper, setPaper] = useState<Paper | null | undefined>(undefined);

  useEffect(() => {
    if (!shareId) {
      setPaper(null);
      return;
    }

    const found = getSharedPaper(shareId);
    if (found) {
      setPaper(found);
      return;
    }

    // Not in localStorage — try backend
    if (actor) {
      (actor as any)
        .getPaper(shareId)
        .then((result: string | null | undefined) => {
          if (result) {
            try {
              const parsed = JSON.parse(result) as Paper;
              setPaper(parsed);
              // Cache locally
              try {
                const key = `shared_paper_${shareId}`;
                localStorage.setItem(key, result);
              } catch {
                // ignore storage errors
              }
            } catch {
              setPaper(null);
            }
          } else {
            setPaper(null);
          }
        })
        .catch(() => setPaper(null));
    } else {
      setPaper(null);
    }
  }, [shareId, actor]);

  const handlePrint = () => {
    setTimeout(() => window.print(), 200);
    toast.info(
      "In the print dialog: set Paper = A4, Margins = None, enable Background Graphics, then Save as PDF",
      { duration: 6000 },
    );
  };

  // Still loading
  if (paper === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading shared paper…</p>
      </div>
    );
  }

  // Not found
  if (paper === null) {
    return (
      <div className="container mx-auto max-w-2xl p-4 py-16">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Link Expired or Invalid</CardTitle>
            </div>
            <CardDescription>
              This link may have been created on another device. Make sure you
              have an internet connection and try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3 flex-wrap">
            <Button
              onClick={() => navigate({ to: "/home" })}
              data-ocid="share.primary_button"
            >
              Go to Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/papers" })}
              data-ocid="share.secondary_button"
            >
              View My Papers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 py-8">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{paper.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared paper — read-only view
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/home" })}
            data-ocid="share.link"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            data-ocid="share.primary_button"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <PaperSurface paper={paper} isEditable={false} />
      </div>
    </div>
  );
}

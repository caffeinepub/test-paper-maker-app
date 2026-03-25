import { Button } from "@/components/ui/button";
import { useParams } from "@tanstack/react-router";
import { Printer, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PaperSurface } from "../../components/paper/PaperSurface";
import type { Paper } from "../../state/mockData";
import { useMockStore } from "../../state/mockStore";

export function PDFPreviewPage() {
  const { paperId } = useParams({ from: "/pdf-preview/$paperId" });
  const { getPaperById, isInitialized } = useMockStore();

  // Try sessionStorage first (written by editor before opening tab) — avoids race condition
  const [sessionPaper] = useState<Paper | null>(() => {
    try {
      const raw = sessionStorage.getItem("pdf_preview_paper");
      if (raw) {
        const parsed = JSON.parse(raw) as Paper;
        // Clean up so it doesn't linger
        sessionStorage.removeItem("pdf_preview_paper");
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const storePaper = isInitialized ? getPaperById(paperId) : null;
  const paper = sessionPaper ?? storePaper;

  // Force white background on entire document for this page
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.background = "white";
    html.style.colorScheme = "light";
    body.style.background = "white";
    body.style.colorScheme = "light";
    if (paper) document.title = `PDF Preview — ${paper.title || "Paper"}`;
    return () => {
      html.style.background = "";
      html.style.colorScheme = "";
      body.style.background = "";
      body.style.colorScheme = "";
    };
  }, [paper]);

  if (!sessionPaper && !isInitialized) {
    return (
      <div className="pdf-preview-shell">
        <p style={{ textAlign: "center", paddingTop: "80px", color: "#666" }}>
          Loading paper...
        </p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="pdf-preview-shell">
        <p style={{ textAlign: "center", paddingTop: "80px", color: "#666" }}>
          Paper not found. Please go back and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="pdf-preview-shell">
      {/* Toolbar — hidden when printing */}
      <div className="pdf-preview-toolbar print:hidden">
        <div className="pdf-preview-toolbar-left">
          <span className="pdf-preview-paper-title">
            {paper.title || "Untitled Paper"}
          </span>
          <span className="pdf-preview-hint">
            In print dialog: set Margins = <strong>None</strong> · Enable{" "}
            <strong>Background graphics</strong>
          </span>
        </div>
        <div className="pdf-preview-toolbar-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.close()}
            className="pdf-preview-close-btn"
          >
            <X className="h-4 w-4 mr-1" />
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="pdf-preview-print-btn"
          >
            <Printer className="h-4 w-4 mr-1" />
            Save as PDF / Print
          </Button>
        </div>
      </div>

      {/* A4 paper wrapper */}
      <div className="pdf-preview-page-area">
        <div className="pdf-a4-wrapper">
          {/* Border box visible on screen */}
          <div className="pdf-screen-border" aria-hidden="true" />

          {/* Paper content */}
          <PaperSurface paper={paper} isEditable={false} />

          {/* Page number visible on screen */}
          <div className="pdf-screen-page-number" aria-label="Page 1">
            — 1 —
          </div>
        </div>
      </div>
    </div>
  );
}

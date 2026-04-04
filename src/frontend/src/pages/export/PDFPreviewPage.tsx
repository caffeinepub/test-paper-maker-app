import { Button } from "@/components/ui/button";
import { useParams } from "@tanstack/react-router";
import { Printer, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PaperSurface } from "../../components/paper/PaperSurface";
import type { Paper } from "../../state/mockData";
import { useMockStore } from "../../state/mockStore";

// A4 at 96 dpi = 794px wide
const A4_PX_WIDTH = 794;

export function PDFPreviewPage() {
  const { paperId } = useParams({ from: "/pdf-preview/$paperId" });
  const { getPaperById, isInitialized } = useMockStore();
  const hasCleanedUpRef = useRef(false);

  // Try localStorage key first (written synchronously by the editor before navigating here)
  const [paper] = useState<Paper | null>(() => {
    try {
      const raw = localStorage.getItem(`pdf_preview_${paperId}`);
      if (raw) return JSON.parse(raw) as Paper;
    } catch {
      // ignore
    }
    return null;
  });

  // Fallback: try to get from store after it initializes
  const storePaper = isInitialized ? getPaperById(paperId) : null;
  const resolvedPaper = paper ?? storePaper ?? null;
  const paperTitle = resolvedPaper?.title ?? null;

  // Clean up the localStorage key once we've read it
  useEffect(() => {
    if (!hasCleanedUpRef.current && resolvedPaper) {
      hasCleanedUpRef.current = true;
      setTimeout(() => {
        localStorage.removeItem(`pdf_preview_${paperId}`);
      }, 5000);
    }
  }, [resolvedPaper, paperId]);

  // Force white background and light color-scheme for this page
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");
    html.style.setProperty("background", "white", "important");
    html.style.setProperty("color-scheme", "light", "important");
    body.style.setProperty("background", "white", "important");
    body.style.setProperty("color-scheme", "light", "important");
    if (root) root.style.setProperty("background", "white", "important");
    if (paperTitle) document.title = `PDF Preview \u2014 ${paperTitle}`;
    return () => {
      html.style.removeProperty("background");
      html.style.removeProperty("color-scheme");
      body.style.removeProperty("background");
      body.style.removeProperty("color-scheme");
      if (root) root.style.removeProperty("background");
    };
  }, [paperTitle]);

  // ── Google-Drive-style scale-to-fit ──────────────────────────────────────
  // The A4 page is always rendered at 794px internally.
  // We measure the outer shell width and compute a scale factor so the
  // page fits without horizontal scrolling on any screen size.
  // CSS transform doesn't affect layout flow, so we compensate the height
  // manually via a wrapper div that matches the scaled visual height.
  const shellRef = useRef<HTMLDivElement>(null);
  const a4Ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState(1123);

  useEffect(() => {
    const shell = shellRef.current;
    const a4 = a4Ref.current;
    if (!shell || !a4) return;

    const recalc = () => {
      // Measure the shell width (full viewport width minus any padding)
      const available = shell.getBoundingClientRect().width;
      const newScale = available >= A4_PX_WIDTH ? 1 : available / A4_PX_WIDTH;

      // Measure the a4 element's NATURAL (unscaled) height.
      // We temporarily remove transform so getBoundingClientRect gives true height.
      const prevTransform = a4.style.transform;
      a4.style.transform = "scale(1)";
      const naturalHeight = a4.getBoundingClientRect().height;
      a4.style.transform = prevTransform;

      setScale(newScale);
      // The wrapper must be exactly naturalHeight * scale tall so
      // surrounding content flows correctly.
      setScaledHeight(naturalHeight * newScale);
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(shell);
    // Also re-measure if paper content changes
    const mo = new MutationObserver(recalc);
    mo.observe(a4, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ResizeObserver and MutationObserver handle all changes

  if (!paper && !isInitialized) {
    return (
      <div className="pdf-preview-shell">
        <p style={{ textAlign: "center", paddingTop: "80px", color: "#666" }}>
          Loading paper...
        </p>
      </div>
    );
  }

  if (!resolvedPaper) {
    return (
      <div className="pdf-preview-shell">
        <p style={{ textAlign: "center", paddingTop: "80px", color: "#d00" }}>
          Paper not found. Please go back to the editor and try again.
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
            {resolvedPaper.title || "Untitled Paper"}
          </span>
          <span className="pdf-preview-hint">
            In print dialog: set Margins = <strong>None</strong> &middot; Enable{" "}
            <strong>Background graphics</strong>
          </span>
        </div>
        <div className="pdf-preview-toolbar-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => history.back()}
            className="pdf-preview-close-btn"
          >
            ← Back
          </Button>
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

      {/*
        Outer shell — full width, measured by ResizeObserver.
        We use a grey background to create the "document viewer" look
        like Google Drive.
      */}
      <div ref={shellRef} className="pdf-shell-outer">
        {/*
          Height-compensation wrapper:
          Because CSS transform doesn't affect layout, the transformed A4
          div would leave a giant gap. This wrapper is set to the SCALED
          height so surrounding content flows correctly.
        */}
        <div style={{ height: `${scaledHeight}px`, display: "block" }}>
          {/* The actual A4 page — always 794px wide, scaled down by transform */}
          <div
            ref={a4Ref}
            className="pdf-a4-page"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {/* Visible border box — wraps all content, grows naturally */}
            <div className="pdf-content-border">
              {/* Print-only fixed overlay border */}
              <div className="print-page-border" aria-hidden="true" />
              <PaperSurface paper={resolvedPaper} isEditable={false} />
              {/* Page number — inside the border, always visible */}
              <div className="pdf-page-number" aria-label="Page 1">
                — 1 —
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

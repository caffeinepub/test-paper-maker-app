import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  BookCopy,
  Check,
  Copy,
  Eye,
  FileText,
  Info,
  Key,
  Printer,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PaperActionOverflowMenu } from "../../components/paper/PaperActionOverflowMenu";
import { PaperSurface } from "../../components/paper/PaperSurface";
import { useActor } from "../../hooks/useActor";
import { saveTemplate } from "../../lib/editor/paperTemplates";
import { exportPaperAsDocx } from "../../lib/export/paperDocxExport";
import { downloadPaperAsText } from "../../lib/export/paperTextExport";
import { saveSharedPaper } from "../../lib/storage/shareStorage";
import { useMockStore } from "../../state/mockStore";

export function ExportPrintPreviewWireframe() {
  const navigate = useNavigate();
  const { paperId } = useParams({ from: "/export/$paperId" });
  const { getPaperById, updatePaper, profile } = useMockStore();
  const { actor } = useActor();

  const paper = getPaperById(paperId);
  const activePaper = paper;

  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [previewTab, setPreviewTab] = useState<"original" | "cleaned">(
    "original",
  );
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // No longer loading from base64 URL — shared papers now use short IDs via /share/$shareId

  const currentLayoutMode = activePaper?.layoutMode || "original";

  const handleOpenCleanup = () => {
    setShowCleanupDialog(true);
    setPreviewTab("original");
  };

  const handleSaveCleanedVersion = () => {
    if (activePaper) {
      updatePaper(paperId, { layoutMode: "cleaned" });
    }
    setShowCleanupDialog(false);
  };

  const handleKeepOriginal = () => {
    if (activePaper) {
      updatePaper(paperId, { layoutMode: "original" });
    }
    setShowCleanupDialog(false);
  };

  const handleCopyLink = async () => {
    if (!activePaper) {
      toast.error("No paper loaded");
      return;
    }

    // Reuse existing share ID or generate a new one
    let id: string;
    if (shareUrl) {
      const parts = shareUrl.split("/share/");
      id = parts[1] || saveSharedPaper(activePaper);
    } else {
      id = saveSharedPaper(activePaper);
    }

    const url = `${window.location.origin}/share/${id}`;
    setShareUrl(url);

    // Also save to backend canister for cross-device access
    if (actor) {
      try {
        await (actor as any).savePaper(id, JSON.stringify(activePaper));
      } catch {
        // Backend save failed — link still works on this device
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied! Works on any device.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadText = () => {
    if (!activePaper) {
      toast.error("Paper not found");
      return;
    }

    try {
      downloadPaperAsText(activePaper);
      toast.success("Text file downloaded successfully");
    } catch (_error) {
      toast.error("Failed to download text file");
    }
  };

  const handleExportDocx = async () => {
    if (!activePaper) {
      toast.error("Paper not found");
      return;
    }
    try {
      await exportPaperAsDocx(activePaper);
      toast.success("Word document downloaded successfully");
    } catch (_error) {
      toast.error("Failed to export Word document");
    }
  };

  const getAnswerKeyItems = () => {
    if (!activePaper) return [];
    let qNum = 0;
    const items: { number: number; text: string; answer: string }[] = [];
    for (const section of activePaper.sections) {
      for (const question of section.questions) {
        qNum++;
        let answer = "Not provided";
        if (
          question.questionType === "mcq" &&
          question.mcqOptions?.correctAnswer !== undefined
        ) {
          const optIdx = question.mcqOptions.correctAnswer;
          const optText = question.mcqOptions.options?.[optIdx];
          answer = `${String.fromCharCode(65 + optIdx)}${optText ? `. ${optText}` : ""}`;
        } else if (
          question.questionType === "true-false" &&
          question.trueFalseData?.correctAnswer !== undefined
        ) {
          answer = question.trueFalseData.correctAnswer ? "True" : "False";
        } else if (question.answer) {
          answer = question.answer;
        }
        items.push({
          number: qNum,
          text:
            question.text.slice(0, 80) + (question.text.length > 80 ? "…" : ""),
          answer,
        });
      }
    }
    return items;
  };

  const handlePrintAnswerKey = () => {
    const items = getAnswerKeyItems();
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Answer Key — ${activePaper?.title ?? "Paper"}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
  h1 { font-size: 1.4rem; margin-bottom: 8px; }
  h2 { font-size: 1rem; color: #555; margin-bottom: 24px; }
  .item { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #eee; }
  .num { font-weight: 700; min-width: 32px; }
  .q { font-size: 0.85rem; color: #555; }
  .ans { font-weight: 600; color: #5b21b6; margin-top: 2px; }
  .not-provided { color: #999; font-style: italic; }
</style>
</head>
<body>
<h1>Answer Key</h1>
<h2>${activePaper?.title ?? ""}</h2>
${items.map((item) => `<div class="item"><div class="num">Q${item.number}.</div><div><div class="q">${item.text}</div><div class="ans ${item.answer === "Not provided" ? "not-provided" : ""}">${item.answer}</div></div></div>`).join("")}
</body>
</html>`;
    const w = window.open("", "_blank", "width=700,height=600");
    if (!w) {
      toast.error("Could not open print window. Please allow popups.");
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
    }, 300);
  };

  const handlePrint = () => {
    // Slight delay to allow the browser to prepare the print layout
    setTimeout(() => {
      window.print();
    }, 200);
    toast.info(
      "In the print dialog: set Paper = A4, Margins = None, enable Background Graphics, then Save as PDF",
      { duration: 6000 },
    );
  };

  const getDifficultyStats = () => {
    if (!activePaper)
      return { easy: 0, medium: 0, hard: 0, untagged: 0, total: 0 };
    let easy = 0;
    let medium = 0;
    let hard = 0;
    let untagged = 0;
    for (const section of activePaper.sections) {
      for (const q of section.questions) {
        const d = (q as any).difficulty;
        if (d === "easy") easy++;
        else if (d === "medium") medium++;
        else if (d === "hard") hard++;
        else untagged++;
      }
    }
    const total = easy + medium + hard + untagged;
    return { easy, medium, hard, untagged, total };
  };

  const handleSaveTemplate = () => {
    if (!activePaper) return;
    const name = templateName.trim();
    if (!name) {
      toast.error("Please enter a template name");
      return;
    }
    saveTemplate({
      id: `tmpl-${Date.now()}`,
      name,
      description: `Saved from paper: ${activePaper.title}`,
      createdAt: new Date().toISOString(),
      totalMarks: activePaper.totalMarks,
      timeMinutes: activePaper.timeMinutes,
      board: activePaper.board,
      sections: activePaper.sections.map((s) => ({
        title: s.title,
        marks: s.marks,
        totalMarks: s.totalMarks,
        headings: (s.headings || []).map((h) => ({
          title: h.title,
          plannedCount: h.plannedCount,
        })),
      })),
    });
    toast.success("Template saved!");
    setShowSaveTemplate(false);
    setTemplateName("");
  };

  if (!activePaper) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Paper Not Found</CardTitle>
            </div>
            <CardDescription>
              The paper you're trying to export doesn't exist or has been
              deleted.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={() => navigate({ to: "/papers" })}>
              View All Papers
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/home" })}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCleanedMode = currentLayoutMode === "cleaned";

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Export & Print Preview
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review and export your paper
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate({ to: `/editor/${paperId}/real-paper` })}
          >
            Back to Editor
          </Button>
          <PaperActionOverflowMenu paperId={paperId} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Actions */}
        <div className="space-y-4 lg:col-span-1 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
              <CardDescription>Current layout mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium">
                  Active Mode:{" "}
                  <span className="text-primary">
                    {isCleanedMode ? "Cleaned" : "Original"}
                  </span>
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleOpenCleanup}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Auto Format (Layout Only)
              </Button>
            </CardContent>
          </Card>

          {/* Paper Stats Card */}
          {(() => {
            const stats = getDifficultyStats();
            const pct = (n: number) =>
              stats.total > 0 ? Math.round((n / stats.total) * 100) : 0;
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Paper Stats</CardTitle>
                  <CardDescription className="text-xs">
                    Quick overview before printing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                      <p className="text-lg font-bold text-foreground">
                        {stats.total}
                      </p>
                      <p className="text-xs text-muted-foreground">Questions</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                      <p className="text-lg font-bold text-foreground">
                        {activePaper.totalMarks}
                      </p>
                      <p className="text-xs text-muted-foreground">Marks</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                      <p className="text-lg font-bold text-foreground">
                        {activePaper.sections.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Sections</p>
                    </div>
                  </div>
                  {stats.total > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Difficulty Breakdown
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {stats.easy > 0 && (
                          <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
                            Easy {stats.easy} ({pct(stats.easy)}%)
                          </span>
                        )}
                        {stats.medium > 0 && (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                            Medium {stats.medium} ({pct(stats.medium)}%)
                          </span>
                        )}
                        {stats.hard > 0 && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-800">
                            Hard {stats.hard} ({pct(stats.hard)}%)
                          </span>
                        )}
                        {stats.untagged > 0 && (
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                            Untagged {stats.untagged} ({pct(stats.untagged)}%)
                          </span>
                        )}
                      </div>
                      {/* Proportional progress bar */}
                      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                        {stats.easy > 0 && (
                          <div
                            className="bg-green-400"
                            style={{ width: `${pct(stats.easy)}%` }}
                          />
                        )}
                        {stats.medium > 0 && (
                          <div
                            className="bg-amber-400"
                            style={{ width: `${pct(stats.medium)}%` }}
                          />
                        )}
                        {stats.hard > 0 && (
                          <div
                            className="bg-red-400"
                            style={{ width: `${pct(stats.hard)}%` }}
                          />
                        )}
                        {stats.untagged > 0 && (
                          <div
                            className="bg-muted-foreground/30"
                            style={{ width: `${pct(stats.untagged)}%` }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Download and share your paper</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => setShowFullPreview(true)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Full Preview
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print / Save as PDF
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowAnswerKey(true)}
              >
                <Key className="mr-2 h-4 w-4" />
                Export Answer Key
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownloadText}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download as Text
              </Button>
              <div className="space-y-0.5">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportDocx}
                  data-ocid="export.secondary_button"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export as Word (.docx)
                </Button>
                <p className="text-xs text-muted-foreground pl-1">
                  Text only — tables and images not included
                </p>
              </div>

              {/* Save as Template */}
              {showSaveTemplate ? (
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                  <p className="text-sm font-medium">Save as Template</p>
                  <Input
                    autoFocus
                    placeholder="Template name..."
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTemplate();
                      if (e.key === "Escape") {
                        setShowSaveTemplate(false);
                        setTemplateName("");
                      }
                    }}
                    data-ocid="export.input"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={handleSaveTemplate}
                      data-ocid="export.save_button"
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowSaveTemplate(false);
                        setTemplateName("");
                      }}
                      data-ocid="export.cancel_button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowSaveTemplate(true);
                    setTemplateName(activePaper.title);
                  }}
                  data-ocid="export.open_modal_button"
                >
                  <BookCopy className="mr-2 h-4 w-4" />
                  Save as Template
                </Button>
              )}

              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Share Link</p>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl || "Click Copy to generate link"}
                    readOnly
                    className="flex-1 text-xs"
                    data-ocid="export.input"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                    data-ocid="export.primary_button"
                    title="Copy share link"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Works on any device — share via WhatsApp, email, or SMS.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Print Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Paper Size: A4</p>
              <p>• Margins: Standard</p>
              <p>• Include Logo: {profile.schoolLogo ? "Yes" : "No"}</p>
              <p>• Layout Mode: {isCleanedMode ? "Cleaned" : "Original"}</p>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Use your browser's print dialog to save as PDF or adjust print
              settings.
            </AlertDescription>
          </Alert>
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-2">
          <Card className="print:border-0 print:shadow-none">
            <CardHeader className="print:hidden">
              <CardTitle>Paper Preview</CardTitle>
              <CardDescription>
                This is how your paper will look when printed
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PaperSurface paper={activePaper} isEditable={false} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Preview Modal */}
      <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
        <DialogContent className="max-h-[90vh] max-w-4xl w-full overflow-y-auto print:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Full Paper Preview
              </span>
            </DialogTitle>
            <DialogDescription>
              Read-only preview of your paper as it will appear when printed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-2">
            <PaperSurface paper={activePaper} isEditable={false} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFullPreview(false)}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print / Save as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Answer Key Modal */}
      <Dialog open={showAnswerKey} onOpenChange={setShowAnswerKey}>
        <DialogContent className="max-h-[90vh] max-w-4xl w-full overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Answer Key — {activePaper.title}
            </DialogTitle>
            <DialogDescription>
              Print or save the answer key for this paper. Questions without a
              stored answer are shown as "Not provided."
            </DialogDescription>
          </DialogHeader>

          {/* Answer key content — also targeted by print CSS */}
          <div id="answer-key-print-content" className="space-y-2 py-2">
            <h2 className="text-lg font-bold text-foreground print:block hidden">
              Answer Key — {activePaper.title}
            </h2>
            {getAnswerKeyItems().length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No questions found in this paper.
              </p>
            ) : (
              <div className="divide-y divide-border rounded-lg border">
                {getAnswerKeyItems().map((item) => (
                  <div
                    key={item.number}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    <span className="w-8 shrink-0 text-sm font-semibold text-foreground">
                      Q{item.number}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">
                        {item.text}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        →{" "}
                        <span
                          className={
                            item.answer === "Not provided"
                              ? "text-muted-foreground italic"
                              : "text-primary"
                          }
                        >
                          {item.answer}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnswerKey(false)}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button onClick={handlePrintAnswerKey}>
              <Printer className="mr-2 h-4 w-4" />
              Print Answer Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cleanup Dialog with Comparison */}
      <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Auto Format (Layout Only)
            </DialogTitle>
            <DialogDescription>
              Compare the original and cleaned versions.{" "}
              <strong>
                No text content, wording, or spelling will be changed
              </strong>{" "}
              — only spacing, alignment, and layout will be improved.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={previewTab}
            onValueChange={(v) => setPreviewTab(v as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="original">Original Version</TabsTrigger>
              <TabsTrigger value="cleaned">Cleaned Version</TabsTrigger>
            </TabsList>

            <TabsContent value="original" className="mt-4">
              <div className="max-h-[60vh] overflow-y-auto rounded-lg border-2 border-border">
                <PaperSurface
                  paper={{ ...activePaper, layoutMode: "original" }}
                  isEditable={false}
                />
              </div>
            </TabsContent>

            <TabsContent value="cleaned" className="mt-4">
              <div className="max-h-[60vh] overflow-y-auto rounded-lg border-2 border-primary">
                <PaperSurface
                  paper={{ ...activePaper, layoutMode: "cleaned" }}
                  isEditable={false}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleKeepOriginal}
              className="w-full sm:w-auto"
            >
              Keep Original Version
            </Button>
            <Button
              onClick={handleSaveCleanedVersion}
              className="w-full sm:w-auto"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Save Cleaned Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

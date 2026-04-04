import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  FileDown,
  Image as ImageIcon,
  Redo,
  Undo,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AddQuestionHeadingDialog } from "../../components/editor/AddQuestionHeadingDialog";
import { FloatingRealPaperToolbox } from "../../components/editor/FloatingRealPaperToolbox";
import { MobileRealPaperFabToolbox } from "../../components/editor/MobileRealPaperFabToolbox";
import { RealPaperToolboxSpotlight } from "../../components/editor/RealPaperToolboxSpotlight";
import { PaperActionOverflowMenu } from "../../components/paper/PaperActionOverflowMenu";
import { PaperSurface } from "../../components/paper/PaperSurface";
import { useDebouncedEffect } from "../../hooks/useDebouncedEffect";
import { useRealPaperToolboxSpotlight } from "../../hooks/useRealPaperToolboxSpotlight";
import { useUndoRedo } from "../../hooks/useUndoRedo";
import type {
  Paper,
  Question,
  QuestionHeading,
  QuestionType,
} from "../../state/mockData";
import { useMockStore } from "../../state/mockStore";

export function RealPaperEditorWireframe() {
  const navigate = useNavigate();
  const { paperId } = useParams({ from: "/editor/$paperId/real-paper" });
  const { isInitialized, getPaperById, updatePaper } = useMockStore();
  const toolboxSpotlight = useRealPaperToolboxSpotlight();

  const paper = getPaperById(paperId);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [selectedHeadingId, setSelectedHeadingId] = useState<string | null>(
    null,
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "saved" | "saving" | "idle"
  >("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [showAddHeadingDialog, setShowAddHeadingDialog] = useState(false);
  const [autoFocusQuestionId, setAutoFocusQuestionId] = useState<string | null>(
    null,
  );
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isInitialLoadRef = useRef(true);

  const {
    state: paperState,
    setState: setPaperState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  } = useUndoRedo<Paper | null>(paper || null, {
    maxHistorySize: 50,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally only re-runs when paperId or init status changes
  useEffect(() => {
    if (paper && isInitialized) {
      isInitialLoadRef.current = true;
      reset(paper);
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 100);
    }
  }, [paper?.id, isInitialized]);

  useEffect(() => {
    if (paperState && paperState.sections.length > 0 && !selectedSectionId) {
      const firstSection = paperState.sections[0];
      setSelectedSectionId(firstSection.id);
      if (firstSection.headings && firstSection.headings.length > 0) {
        setSelectedHeadingId(firstSection.headings[0].id);
      }
    }
  }, [paperState, selectedSectionId]);

  useDebouncedEffect(
    () => {
      if (!paperState || !isInitialized || isInitialLoadRef.current) {
        return;
      }

      setAutoSaveStatus("saving");
      const computedTotal = paperState.sections.reduce(
        (total, section) =>
          total +
          section.questions.reduce((sTotal, q) => sTotal + (q.marks || 0), 0),
        0,
      );
      const updatedPaper = { ...paperState, totalMarks: computedTotal };
      updatePaper(paperId, updatedPaper);

      setTimeout(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        setLastSavedTime(`${displayHours}:${minutes} ${ampm}`);
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 3000);
      }, 300);
    },
    500,
    [paperState, isInitialized],
  );

  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const section = paperState?.sections.find((s) => s.id === sectionId);
    if (section?.headings && section.headings.length > 0) {
      setSelectedHeadingId(section.headings[0].id);
    } else {
      setSelectedHeadingId(null);
    }
  };

  const handleAddQuestion = (
    sectionId: string,
    headingId: string,
    questionType: QuestionType,
  ) => {
    if (!paperState) return;

    const section = paperState.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: "",
      marks: section.marks,
      type: "General",
      questionType,
      headingId: headingId,
      imageAttachment: null,
      ...(questionType === "mcq" && {
        mcqOptions: { options: ["", "", "", ""] },
      }),
      ...(questionType === "fill-in-blank" && {
        fillInBlankData: { blanks: [""] },
      }),
      ...(questionType === "true-false" && {
        trueFalseData: {},
      }),
      ...(questionType === "match-pairs" && {
        matchPairsData: { pairs: [{ left: "", right: "" }] },
      }),
      ...(questionType === "table" && {
        tableData: {
          rows: 2,
          cols: 2,
          cells: [
            ["", ""],
            ["", ""],
          ],
        },
      }),
      ...(questionType === "assertion-reason" && {
        assertionReasonData: { assertion: "", reason: "" },
      }),
      ...(questionType === "case-based" && {
        caseBasedData: { passage: "", subQuestions: [""] },
      }),
      ...(questionType === "numerical" && {
        numericalData: { unit: "" },
      }),
    };

    setPaperState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id === sectionId) {
            return { ...s, questions: [...s.questions, newQuestion] };
          }
          return s;
        }),
      };
    });

    setSelectedQuestionId(newQuestion.id);
    setAutoFocusQuestionId(newQuestion.id);
    toast.success("Question added");
  };

  const handleUpdateQuestion = (
    sectionId: string,
    questionId: string,
    updates: Partial<Question>,
  ) => {
    setPaperState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id === sectionId) {
            return {
              ...s,
              questions: s.questions.map((q) =>
                q.id === questionId ? { ...q, ...updates } : q,
              ),
            };
          }
          return s;
        }),
      };
    });
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    setPaperState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id === sectionId) {
            return {
              ...s,
              questions: s.questions.filter((q) => q.id !== questionId),
            };
          }
          return s;
        }),
      };
    });
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null);
    }
    toast.success("Question deleted");
  };

  const handleSelectQuestion = (questionId: string | null) => {
    setSelectedQuestionId(questionId);
    if (questionId) {
      setAutoFocusQuestionId(questionId);
    }
  };

  const handleAutoFocusComplete = () => {
    setAutoFocusQuestionId(null);
  };

  const handleUpdatePaperMeta = (updates: Partial<Paper>) => {
    setPaperState((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  };

  const handleAddHeading = (heading: Omit<QuestionHeading, "id">) => {
    if (!selectedSectionId) return;

    const newHeading: QuestionHeading = {
      id: `heading-${Date.now()}`,
      ...heading,
    };

    setPaperState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) => {
          if (s.id === selectedSectionId) {
            return {
              ...s,
              headings: [...(s.headings || []), newHeading],
            };
          }
          return s;
        }),
      };
    });

    setSelectedHeadingId(newHeading.id);
    setShowAddHeadingDialog(false);
    toast.success("Heading added");
  };

  const handleInsertImage = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedQuestionId || !selectedSectionId) {
      toast.error("Please select a question first");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleUpdateQuestion(selectedSectionId, selectedQuestionId, {
        imageAttachment: base64,
      });
      toast.success("Image attached to question");
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleOpenPdfPreview = () => {
    if (paperState) {
      const computedTotal = paperState.sections.reduce(
        (total, section) =>
          total +
          section.questions.reduce((sTotal, q) => sTotal + (q.marks || 0), 0),
        0,
      );
      const updatedPaper = { ...paperState, totalMarks: computedTotal };

      // Write synchronously to localStorage BEFORE navigation
      // (localStorage is shared between same-origin navigations in the same tab)
      try {
        localStorage.setItem(
          `pdf_preview_${paperId}`,
          JSON.stringify(updatedPaper),
        );
      } catch {
        // storage full — proceed anyway, will fallback to store
      }

      // Also persist to the main store
      updatePaper(paperId, updatedPaper);
    }

    // Navigate in the same tab — PDFPreviewPage reads from localStorage
    navigate({ to: `/pdf-preview/${paperId}` });
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!paperState) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Paper not found or has been deleted.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-muted/30">
      <div className="print-page-border" aria-hidden="true" />
      {/* Fixed Top Bar */}
      <div className="sticky top-0 z-10 border-b bg-background shadow-sm print:hidden">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: `/editor/${paperId}` })}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {paperState.title || "Untitled Paper"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {autoSaveStatus === "saving" && "Saving..."}
                {autoSaveStatus === "saved" && lastSavedTime
                  ? `Last saved at ${lastSavedTime} · `
                  : autoSaveStatus === "saved"
                    ? "Saved · "
                    : ""}
                {autoSaveStatus === "idle" && lastSavedTime
                  ? `Last saved at ${lastSavedTime} · `
                  : autoSaveStatus === "idle"
                    ? ""
                    : ""}
                Total:{" "}
                {paperState.sections.reduce(
                  (total, section) =>
                    total +
                    section.questions.reduce(
                      (sTotal, q) => sTotal + (q.marks || 0),
                      0,
                    ),
                  0,
                )}{" "}
                marks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleInsertImage}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Insert Image
            </Button>
            {/* PDF Preview button — navigates to exact A4 preview in same tab */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenPdfPreview}
              title="Preview exact PDF layout"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Eye className="mr-2 h-4 w-4" />
              PDF Preview
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate({ to: `/export/${paperId}` })}
              title="Export, Print & Answer Key"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </Button>
            <PaperActionOverflowMenu paperId={paperId} />
          </div>
        </div>
      </div>

      {/* Difficulty Distribution Bar */}
      {(() => {
        const allQs = paperState.sections.flatMap((s) => s.questions);
        const total = allQs.length;
        const easy = allQs.filter((q) => q.difficulty === "easy").length;
        const medium = allQs.filter((q) => q.difficulty === "medium").length;
        const hard = allQs.filter((q) => q.difficulty === "hard").length;
        const untagged = total - easy - medium - hard;
        const tagged = easy + medium + hard;
        if (total === 0 || tagged === 0) return null;

        const pct = (n: number) => `${Math.round((n / total) * 100)}%`;

        return (
          <div className="border-b bg-background px-4 py-2 print:hidden">
            <div className="container mx-auto max-w-4xl space-y-1.5">
              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="font-medium text-muted-foreground shrink-0">
                  Difficulty mix:
                </span>
                <div className="flex flex-wrap gap-2">
                  {easy > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Easy {easy} ({pct(easy)})
                    </span>
                  )}
                  {medium > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Medium {medium} ({pct(medium)})
                    </span>
                  )}
                  {hard > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      Hard {hard} ({pct(hard)})
                    </span>
                  )}
                  {untagged > 0 && (
                    <span className="text-muted-foreground">
                      {untagged} untagged
                    </span>
                  )}
                </div>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                {easy > 0 && (
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: pct(easy) }}
                  />
                )}
                {medium > 0 && (
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: pct(medium) }}
                  />
                )}
                {hard > 0 && (
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: pct(hard) }}
                  />
                )}
                {untagged > 0 && (
                  <div
                    className="h-full bg-muted-foreground/20 transition-all duration-300"
                    style={{ width: pct(untagged) }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Paper Surface */}
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <PaperSurface
          paper={paperState}
          isEditable
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={handleSelectQuestion}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          autoFocusQuestionId={autoFocusQuestionId}
          onAutoFocusComplete={handleAutoFocusComplete}
          onUpdatePaperMeta={handleUpdatePaperMeta}
        />
      </div>

      {/* Desktop Toolbox */}
      <div className="hidden lg:block">
        <FloatingRealPaperToolbox
          paper={paperState}
          selectedSectionId={selectedSectionId}
          selectedHeadingId={selectedHeadingId}
          onSelectSection={handleSelectSection}
          onSelectHeading={setSelectedHeadingId}
          onAddQuestion={handleAddQuestion}
          onAddHeading={() => setShowAddHeadingDialog(true)}
        />
      </div>

      {/* Mobile Toolbox */}
      <div className="lg:hidden">
        <MobileRealPaperFabToolbox
          paper={paperState}
          selectedSectionId={selectedSectionId}
          selectedHeadingId={selectedHeadingId}
          onSelectSection={handleSelectSection}
          onSelectHeading={setSelectedHeadingId}
          onAddQuestion={handleAddQuestion}
          onAddHeading={() => setShowAddHeadingDialog(true)}
        />
      </div>

      {showAddHeadingDialog && selectedSectionId && (
        <AddQuestionHeadingDialog
          open={showAddHeadingDialog}
          onOpenChange={setShowAddHeadingDialog}
          onAdd={handleAddHeading}
        />
      )}

      {toolboxSpotlight.shouldShow && (
        <RealPaperToolboxSpotlight onComplete={toolboxSpotlight.complete} />
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelected}
      />
    </div>
  );
}

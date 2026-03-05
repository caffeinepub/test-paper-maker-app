import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
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

  // Initialize state from paper
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

  // Initialize section and heading selection
  useEffect(() => {
    if (paperState && paperState.sections.length > 0 && !selectedSectionId) {
      const firstSection = paperState.sections[0];
      setSelectedSectionId(firstSection.id);
      if (firstSection.headings && firstSection.headings.length > 0) {
        setSelectedHeadingId(firstSection.headings[0].id);
      }
    }
  }, [paperState, selectedSectionId]);

  // Debounced autosave
  useDebouncedEffect(
    () => {
      if (!paperState || !isInitialized || isInitialLoadRef.current) {
        return;
      }

      setAutoSaveStatus("saving");
      updatePaper(paperId, paperState);

      setTimeout(() => {
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      }, 300);
    },
    500,
    [paperState, isInitialized],
  );

  // Update heading selection when section changes
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

    // Set both selected and autofocus
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
    // Also trigger autofocus when clicking existing questions
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
      {/* Fixed Top Bar */}
      <div className="sticky top-0 z-10 border-b bg-background shadow-sm">
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
                {autoSaveStatus === "saved" && "Saved"}
                {autoSaveStatus === "idle" && "Real Paper Editor"}
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
            <PaperActionOverflowMenu paperId={paperId} />
          </div>
        </div>
      </div>

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

      {/* Add Heading Dialog */}
      {showAddHeadingDialog && selectedSectionId && (
        <AddQuestionHeadingDialog
          open={showAddHeadingDialog}
          onOpenChange={setShowAddHeadingDialog}
          onAdd={handleAddHeading}
        />
      )}

      {/* Toolbox Spotlight */}
      {toolboxSpotlight.shouldShow && (
        <RealPaperToolboxSpotlight onComplete={toolboxSpotlight.complete} />
      )}

      {/* Hidden file input */}
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

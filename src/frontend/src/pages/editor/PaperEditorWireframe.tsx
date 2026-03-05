import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  FileEdit,
  Info,
  Plus,
  Redo,
  Trash2,
  Undo,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FloatingAIButton } from "../../components/ai/FloatingAIButton";
import { useDebouncedEffect } from "../../hooks/useDebouncedEffect";
import { useUndoRedo } from "../../hooks/useUndoRedo";
import type { QuestionHeading } from "../../state/mockData";
import { useMockStore } from "../../state/mockStore";

interface PaperEditorState {
  paperData: {
    title: string;
    totalMarks: number;
    timeMinutes: number;
    board: string;
    standard: string;
    medium: string;
  };
  sections: Array<{
    id: string;
    title: string;
    totalMarks: number;
    marks: number;
    questions: number;
    headings: QuestionHeading[];
  }>;
}

export function PaperEditorWireframe() {
  const navigate = useNavigate();
  const { paperId } = useParams({ from: "/editor/$paperId" });
  const { isInitialized, profile, getPaperById, updatePaper } = useMockStore();

  const paper = getPaperById(paperId);

  const isInitialLoadRef = useRef(true);
  const lastSavedDataRef = useRef<string>("");
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "saved" | "saving" | "idle"
  >("idle");
  const [showSuggestion, setShowSuggestion] = useState(true);

  const initialState: PaperEditorState = {
    paperData: {
      title: "",
      totalMarks: 25,
      timeMinutes: 45,
      board: profile.preferredBoard,
      standard: profile.defaultStandard || "",
      medium: profile.medium,
    },
    sections: [],
  };

  const { state, setState, undo, redo, canUndo, canRedo, reset } =
    useUndoRedo<PaperEditorState>(initialState, {
      maxHistorySize: 50,
    });

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally tracks paperId to reload when paper changes
  useEffect(() => {
    if (paper && isInitialized) {
      isInitialLoadRef.current = true;

      const loadedState: PaperEditorState = {
        paperData: {
          title: paper.title,
          totalMarks: paper.totalMarks,
          timeMinutes: paper.timeMinutes,
          board: paper.board,
          standard: paper.standard || "",
          medium: paper.medium,
        },
        sections: paper.sections.map((s) => ({
          id: s.id,
          title: s.title,
          totalMarks: s.totalMarks,
          marks: s.marks,
          questions: s.questions.length,
          headings: s.headings || [],
        })),
      };

      reset(loadedState);
      lastSavedDataRef.current = JSON.stringify(loadedState);

      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 100);
    }
  }, [paperId, isInitialized, paper, reset]);

  useDebouncedEffect(
    () => {
      if (!paper || !isInitialized || isInitialLoadRef.current) {
        return;
      }

      const currentStateStr = JSON.stringify(state);

      if (currentStateStr !== lastSavedDataRef.current) {
        setAutoSaveStatus("saving");

        const updatedPaper = {
          ...state.paperData,
          sections: state.sections.map((s) => {
            const existingSection = paper.sections.find((ps) => ps.id === s.id);
            return {
              ...s,
              questions: existingSection?.questions || [],
            };
          }),
        };

        updatePaper(paperId, updatedPaper);
        lastSavedDataRef.current = currentStateStr;

        setTimeout(() => {
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        }, 300);
      }
    },
    500,
    [state, isInitialized, paper?.id],
  );

  const handleAddSection = (marks: number) => {
    setState((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `section-${Date.now()}`,
          title: `Section ${String.fromCharCode(65 + prev.sections.length)}`,
          totalMarks: 0,
          marks,
          questions: 0,
          headings: [],
        },
      ],
    }));
  };

  const handleRemoveSection = (id: string) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  };

  const handleAddHeading = (sectionId: string) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id === sectionId) {
          const newHeading: QuestionHeading = {
            id: `heading-${Date.now()}`,
            title: "",
            plannedCount: 0,
          };
          return { ...s, headings: [...s.headings, newHeading] };
        }
        return s;
      }),
    }));
  };

  const handleUpdateHeading = (
    sectionId: string,
    headingId: string,
    updates: Partial<QuestionHeading>,
  ) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            headings: s.headings.map((h) =>
              h.id === headingId ? { ...h, ...updates } : h,
            ),
          };
        }
        return s;
      }),
    }));
  };

  const handleRemoveHeading = (sectionId: string, headingId: string) => {
    setState((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            headings: s.headings.filter((h) => h.id !== headingId),
          };
        }
        return s;
      }),
    }));
  };

  const handleContinueToPaper = () => {
    navigate({ to: `/editor/${paperId}/real-paper` });
  };

  const canContinueToPaper =
    state.paperData.title.trim() !== "" && state.sections.length > 0;

  if (!isInitialized) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Paper Not Found</AlertTitle>
          <AlertDescription>
            The paper you're trying to edit doesn't exist or has been deleted.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Paper Details</h1>
          <p className="mt-2 text-muted-foreground">
            Configure your test paper structure and sections
          </p>
        </div>
        <div className="flex items-center gap-2">
          {autoSaveStatus === "saving" && (
            <span className="text-sm text-muted-foreground">Saving...</span>
          )}
          {autoSaveStatus === "saved" && (
            <span className="text-sm text-success">Saved</span>
          )}
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
        </div>
      </div>

      {showSuggestion && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Tip: Use the Real Paper Editor</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              For a better editing experience with WYSIWYG preview, try the Real
              Paper Editor after setting up your sections.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestion(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Set the title and general details for your paper
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Paper Title</Label>
            <Input
              id="title"
              value={state.paperData.title}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  paperData: { ...prev.paperData, title: e.target.value },
                }))
              }
              placeholder="e.g., Mathematics Mid-Term Exam"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                value={state.paperData.totalMarks}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    paperData: {
                      ...prev.paperData,
                      totalMarks: Number.parseInt(e.target.value) || 0,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeMinutes">Time (minutes)</Label>
              <Input
                id="timeMinutes"
                type="number"
                value={state.paperData.timeMinutes}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    paperData: {
                      ...prev.paperData,
                      timeMinutes: Number.parseInt(e.target.value) || 0,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="board">Board</Label>
              <Input
                id="board"
                value={state.paperData.board}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    paperData: { ...prev.paperData, board: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="standard">Standard/Class</Label>
              <Input
                id="standard"
                value={state.paperData.standard}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    paperData: { ...prev.paperData, standard: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium">Medium</Label>
              <Input
                id="medium"
                value={state.paperData.medium}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    paperData: { ...prev.paperData, medium: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sections & Question Headings</CardTitle>
          <CardDescription>
            Organize your paper into sections with different mark values and
            question headings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.sections.map((section, idx) => (
            <Card key={section.id}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">
                      Section {String.fromCharCode(65 + idx)} ({section.marks}{" "}
                      mark{section.marks > 1 ? "s" : ""} each)
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Question Headings
                    </Label>
                    {section.headings.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No headings yet. Add headings to organize questions in
                        this section.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {section.headings.map((heading) => (
                          <div
                            key={heading.id}
                            className="flex items-center gap-2"
                          >
                            <Input
                              placeholder="Heading title (e.g., Short Answer Questions)"
                              value={heading.title}
                              onChange={(e) =>
                                handleUpdateHeading(section.id, heading.id, {
                                  title: e.target.value,
                                })
                              }
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Count"
                              value={heading.plannedCount}
                              onChange={(e) =>
                                handleUpdateHeading(section.id, heading.id, {
                                  plannedCount:
                                    Number.parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-20"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveHeading(section.id, heading.id)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddHeading(section.id)}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Heading
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
            <Button
              variant="outline"
              onClick={() => handleAddSection(1)}
              className="flex-1"
            >
              <Plus className="mr-1 h-4 w-4" />
              <span className="text-sm sm:text-base">1 Mark</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAddSection(2)}
              className="flex-1"
            >
              <Plus className="mr-1 h-4 w-4" />
              <span className="text-sm sm:text-base">2 Marks</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAddSection(3)}
              className="flex-1"
            >
              <Plus className="mr-1 h-4 w-4" />
              <span className="text-sm sm:text-base">3 Marks</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAddSection(4)}
              className="flex-1"
            >
              <Plus className="mr-1 h-4 w-4" />
              <span className="text-sm sm:text-base">4 Marks</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate({ to: "/papers" })}>
          Cancel
        </Button>
        <Button onClick={handleContinueToPaper} disabled={!canContinueToPaper}>
          <FileEdit className="mr-2 h-4 w-4" />
          Continue to Real Paper Editor
        </Button>
      </div>

      <FloatingAIButton />
    </div>
  );
}

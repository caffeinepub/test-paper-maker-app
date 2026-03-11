import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  FileInput,
  Plus,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { detectQuestionType } from "../../lib/questionBank/detectQuestionType";
import {
  BOARDS,
  QUESTION_TYPES,
} from "../../lib/questionBank/questionBankTaxonomy";
import type { Question, QuestionType } from "../../state/mockData";
import { useMockStore } from "../../state/mockStore";

interface QuestionDraft {
  id: string;
  text: string;
  detectedType: QuestionType | null;
  confirmedType: QuestionType | null;
  needsConfirmation: boolean;
  answer: string;
  tags: string[];
}

// Sentinel values: never allow empty string "" as a Select value (Radix disallows it)
const LOADING_SENTINEL = "__loading__";
const NONE_SENTINEL = "__none__";

export function AddQuestionsWireframe() {
  const navigate = useNavigate();
  const {
    addPersonalQuestion,
    personalQuestions,
    profile,
    standards,
    addSubject,
  } = useMockStore();

  const [board, setBoard] = useState<string>(profile.preferredBoard || "CBSE");

  const [standardId, setStandardId] = useState<string>(
    () =>
      standards.find(
        (s) => s.name === (profile.defaultStandard || "Standard 10"),
      )?.id ||
      standards[0]?.id ||
      LOADING_SENTINEL,
  );

  // Guard: if standards loads asynchronously and standardId is a sentinel, set a valid one
  useEffect(() => {
    if (
      (standardId === LOADING_SENTINEL || standardId === "") &&
      standards.length > 0
    ) {
      setStandardId(standards[0].id);
    }
  }, [standards, standardId]);

  const selectedStandard = standards.find((s) => s.id === standardId);
  const availableSubjects = selectedStandard?.subjects ?? [];
  const [subjectId, setSubjectId] = useState<string>(
    () => availableSubjects[0]?.id || NONE_SENTINEL,
  );

  // Guard: sync subjectId when standard changes
  useEffect(() => {
    const subs = standards.find((s) => s.id === standardId)?.subjects ?? [];
    if (subs.length > 0) {
      if (!subs.find((s) => s.id === subjectId)) {
        setSubjectId(subs[0].id);
      }
    } else {
      setSubjectId(NONE_SENTINEL);
    }
  }, [standardId, standards, subjectId]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);

  const [questionText, setQuestionText] = useState("");
  const [questionDrafts, setQuestionDrafts] = useState<QuestionDraft[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | "none"
  >("none");
  // Import from Text state
  const [importText, setImportText] = useState("");
  const [importCount, setImportCount] = useState(0);

  const [duplicateWarning, setDuplicateWarning] = useState<{
    pendingDraft: QuestionDraft;
    show: boolean;
  } | null>(null);

  const handleBack = () => {
    navigate({ to: "/question-bank" });
  };

  const handleStandardChange = (newStdId: string) => {
    setStandardId(newStdId);
    const std = standards.find((s) => s.id === newStdId);
    setSubjectId(std?.subjects[0]?.id || NONE_SENTINEL);
  };

  /** Simple word-overlap similarity: returns 0–1 */
  const wordOverlap = (a: string, b: string): number => {
    const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
    const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
    if (wordsA.size === 0 || wordsB.size === 0) return 0;
    let common = 0;
    for (const w of wordsA) if (wordsB.has(w)) common++;
    return common / Math.max(wordsA.size, wordsB.size);
  };

  const commitDraft = (text: string) => {
    const detectedType = detectQuestionType(text);
    const newDraft: QuestionDraft = {
      id: `draft-${Date.now()}-${Math.random()}`,
      text,
      detectedType,
      confirmedType: null,
      needsConfirmation: true,
      answer: "",
      tags: [],
    };
    setQuestionDrafts((prev) => [...prev, newDraft]);
    setQuestionText("");
    setIsProcessing(false);
  };

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      alert("Please enter a question");
      return;
    }
    setIsProcessing(true);
    const trimmed = questionText.trim();

    // Duplicate detection: check personal questions for >70% word overlap
    const isDuplicate = personalQuestions.some(
      (q) => wordOverlap(q.text, trimmed) >= 0.7,
    );

    if (isDuplicate) {
      const detectedType = detectQuestionType(trimmed);
      const pendingDraft: QuestionDraft = {
        id: `draft-${Date.now()}-${Math.random()}`,
        text: trimmed,
        detectedType,
        confirmedType: null,
        needsConfirmation: true,
        answer: "",
        tags: [],
      };
      setDuplicateWarning({ pendingDraft, show: true });
      setIsProcessing(false);
      return;
    }

    commitDraft(trimmed);
  };

  const handleDuplicateAddAnyway = () => {
    if (!duplicateWarning) return;
    setQuestionDrafts((prev) => [...prev, duplicateWarning.pendingDraft]);
    setQuestionText("");
    setDuplicateWarning(null);
  };

  const handleDuplicateCancel = () => {
    setDuplicateWarning(null);
    setIsProcessing(false);
  };

  const handleConfirmType = (draftId: string, isCorrect: boolean) => {
    setQuestionDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id === draftId) {
          if (isCorrect && draft.detectedType) {
            return {
              ...draft,
              confirmedType: draft.detectedType,
              needsConfirmation: false,
            };
          }
          return { ...draft, needsConfirmation: false };
        }
        return draft;
      }),
    );
  };

  const handleSelectType = (draftId: string, type: QuestionType) => {
    setQuestionDrafts((prev) =>
      prev.map((draft) =>
        draft.id === draftId ? { ...draft, confirmedType: type } : draft,
      ),
    );
  };

  const handleRemoveDraft = (draftId: string) => {
    setQuestionDrafts((prev) => prev.filter((d) => d.id !== draftId));
  };

  const handleUpdateDraftAnswer = (draftId: string, answer: string) => {
    setQuestionDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, answer } : d)),
    );
  };

  const handleAddTag = (draftId: string, tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) return;
    setQuestionDrafts((prev) =>
      prev.map((d) =>
        d.id === draftId && !d.tags.includes(trimmed)
          ? { ...d, tags: [...d.tags, trimmed] }
          : d,
      ),
    );
  };

  const handleRemoveTag = (draftId: string, tag: string) => {
    setQuestionDrafts((prev) =>
      prev.map((d) =>
        d.id === draftId ? { ...d, tags: d.tags.filter((t) => t !== tag) } : d,
      ),
    );
  };

  const handleSaveAll = () => {
    const unconfirmed = questionDrafts.filter((d) => !d.confirmedType);
    if (unconfirmed.length > 0) {
      alert("Please confirm or select a type for all questions before saving");
      return;
    }
    if (questionDrafts.length === 0) {
      alert("No questions to save");
      return;
    }

    if (standardId === LOADING_SENTINEL || standardId === "") {
      alert("Please select a standard before saving");
      return;
    }
    if (
      subjectId === NONE_SENTINEL &&
      (standards.find((s) => s.id === standardId)?.subjects ?? []).length > 0
    ) {
      alert("Please select a subject before saving");
      return;
    }

    const stdObj = standards.find((s) => s.id === standardId);
    const subjObj = stdObj?.subjects.find((s) => s.id === subjectId);

    for (const draft of questionDrafts) {
      const effectiveDifficulty =
        difficulty !== "none" ? difficulty : undefined;
      const newQuestion: Question = {
        id: `q-${Date.now()}-${Math.random()}`,
        text: draft.text,
        marks: 2,
        type: effectiveDifficulty
          ? effectiveDifficulty.charAt(0).toUpperCase() +
            effectiveDifficulty.slice(1)
          : "General",
        questionType: draft.confirmedType!,
        headingId: null,
        imageAttachment: null,
        board,
        standard: stdObj?.name || "",
        subject: subjObj?.name || "",
        ...(effectiveDifficulty ? { difficulty: effectiveDifficulty } : {}),
        ...(draft.answer.trim() ? { answer: draft.answer.trim() } : {}),
        ...(draft.tags && draft.tags.length > 0 ? { tags: draft.tags } : {}),
      };
      addPersonalQuestion(newQuestion);
    }

    alert(`${questionDrafts.length} question(s) added to your personal bank!`);
    navigate({ to: "/question-bank" });
  };

  const getQuestionTypeLabel = (type: QuestionType | null) => {
    if (!type) return "Unknown";
    const found = QUESTION_TYPES.find((qt) => qt.value === type);
    return found ? found.label : type;
  };

  const handleAddNewSubject = () => {
    if (!newSubjectName.trim() || !standardId) return;
    addSubject(standardId, newSubjectName.trim());
    setNewSubjectName("");
    setShowAddSubject(false);
    // Re-derive the new subject id after state update (will reflect on next render)
  };

  const handleParseImportText = () => {
    if (!importText.trim()) return;
    // Split by blank lines or numbered question patterns
    const blocks = importText
      .split(/\n{2,}|\r\n{2,}/)
      .map((b) => b.trim())
      .filter(Boolean);

    let added = 0;
    for (const block of blocks) {
      const detectedType = detectQuestionType(block);
      const newDraft: QuestionDraft = {
        id: `draft-${Date.now()}-${Math.random()}-${added}`,
        text: block,
        detectedType,
        confirmedType: null,
        needsConfirmation: true,
        answer: "",
        tags: [],
      };
      setQuestionDrafts((prev) => [...prev, newDraft]);
      added++;
    }
    setImportCount(added);
    setImportText("");
  };

  const currentSubjects =
    standards.find((s) => s.id === standardId)?.subjects ?? [];

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Question Bank
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Add Questions</h1>
        <p className="mt-2 text-muted-foreground">
          Add questions manually to your personal question bank
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>
            Select board, standard and subject for your questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
              {standards.length === 0 ? (
                <div className="rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  Loading standards...
                </div>
              ) : (
                <Select
                  value={
                    standardId === LOADING_SENTINEL
                      ? (standards[0]?.id ?? LOADING_SENTINEL)
                      : standardId
                  }
                  onValueChange={handleStandardChange}
                >
                  <SelectTrigger id="standard">
                    <SelectValue placeholder="Select standard" />
                  </SelectTrigger>
                  <SelectContent>
                    {standards
                      .filter((s) => s.id && s.id !== "")
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <div className="flex gap-2">
              {currentSubjects.length === 0 ? (
                <div className="flex-1 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  No subjects yet — add one below
                </div>
              ) : (
                <Select
                  value={
                    subjectId === NONE_SENTINEL
                      ? (currentSubjects[0]?.id ?? NONE_SENTINEL)
                      : subjectId
                  }
                  onValueChange={(v) => {
                    if (v !== NONE_SENTINEL) setSubjectId(v);
                  }}
                >
                  <SelectTrigger id="subject" className="flex-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentSubjects
                      .filter((s) => s.id && s.id !== "")
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddSubject((v) => !v)}
                title="Add new subject"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {showAddSubject && (
              <div className="flex items-center gap-2 rounded-lg border p-2">
                <Input
                  autoFocus
                  placeholder="New subject name"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddNewSubject();
                    if (e.key === "Escape") {
                      setShowAddSubject(false);
                      setNewSubjectName("");
                    }
                  }}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddNewSubject}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAddSubject(false);
                    setNewSubjectName("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty (Optional)</Label>
            <Select
              value={difficulty}
              onValueChange={(v) =>
                setDifficulty(v as "easy" | "medium" | "hard" | "none")
              }
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Question Text</Label>
            <Textarea
              id="question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter or paste your question here..."
              rows={4}
            />
          </div>

          <Button
            onClick={handleAddQuestion}
            disabled={isProcessing || !questionText.trim()}
            data-ocid="add_question.primary_button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>

          <Separator className="my-2" />

          {/* Import from Text */}
          <div className="space-y-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <FileInput className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Import from Text
              </p>
              {importCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {importCount} question{importCount !== 1 ? "s" : ""} detected
                </Badge>
              )}
            </div>
            <Textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                // Live count preview: split by blank lines
                const blocks = e.target.value
                  .split(/\n{2,}|\r\n{2,}/)
                  .map((b) => b.trim())
                  .filter(Boolean);
                setImportCount(blocks.length);
              }}
              placeholder="Paste multiple questions here, one per line or separated by blank lines..."
              rows={5}
              className="bg-background text-sm"
              data-ocid="add_question.textarea"
            />
            <Button
              variant="outline"
              onClick={handleParseImportText}
              disabled={!importText.trim()}
              className="w-full"
              data-ocid="add_question.secondary_button"
            >
              <FileInput className="mr-2 h-4 w-4" />
              Parse &amp; Add{" "}
              {importCount > 0 ? `(${importCount} questions)` : "Questions"}
            </Button>
          </div>

          {/* Duplicate warning */}
          {duplicateWarning?.show && (
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="flex flex-col gap-2">
                <span className="text-amber-800 dark:text-amber-200">
                  A similar question already exists in your personal bank. Add
                  it anyway?
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDuplicateAddAnyway}
                    data-ocid="add_question.confirm_button"
                  >
                    Yes, Add Anyway
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDuplicateCancel}
                    data-ocid="add_question.cancel_button"
                  >
                    No, Cancel
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {questionDrafts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Questions to Add ({questionDrafts.length})</CardTitle>
            <CardDescription>
              Confirm or change the detected question type for each question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionDrafts.map((draft) => (
              <Card key={draft.id} className="border-2">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <p className="text-foreground">{draft.text}</p>

                    {/* Per-draft answer */}
                    <div className="space-y-1">
                      <Label
                        htmlFor={`draft-answer-${draft.id}`}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Answer (optional)
                      </Label>
                      <Textarea
                        id={`draft-answer-${draft.id}`}
                        value={draft.answer}
                        onChange={(e) =>
                          handleUpdateDraftAnswer(draft.id, e.target.value)
                        }
                        placeholder="Leave blank to skip"
                        rows={2}
                        className="text-xs"
                      />
                    </div>

                    {/* Tags */}
                    <div className="space-y-1">
                      <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        Tags (optional)
                      </p>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {draft.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(draft.id, tag)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={tagInputs[draft.id] || ""}
                          onChange={(e) =>
                            setTagInputs((prev) => ({
                              ...prev,
                              [draft.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              handleAddTag(draft.id, tagInputs[draft.id] || "");
                              setTagInputs((prev) => ({
                                ...prev,
                                [draft.id]: "",
                              }));
                            }
                          }}
                          placeholder="Add tag, press Enter"
                          className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleAddTag(draft.id, tagInputs[draft.id] || "");
                            setTagInputs((prev) => ({
                              ...prev,
                              [draft.id]: "",
                            }));
                          }}
                          className="h-7 rounded-md border border-input px-2 text-xs hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {draft.needsConfirmation && draft.detectedType && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Detected as{" "}
                          <strong>
                            {getQuestionTypeLabel(draft.detectedType)}
                          </strong>
                          . Is this correct?
                        </AlertDescription>
                      </Alert>
                    )}

                    {draft.needsConfirmation && draft.detectedType && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleConfirmType(draft.id, true)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Yes, Correct
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirmType(draft.id, false)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          No, Let Me Choose
                        </Button>
                      </div>
                    )}

                    {!draft.needsConfirmation && !draft.confirmedType && (
                      <div className="space-y-2">
                        <Label>Select Question Type</Label>
                        <Select
                          value={draft.confirmedType || "__choose__"}
                          onValueChange={(value) => {
                            if (value !== "__choose__")
                              handleSelectType(draft.id, value as QuestionType);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a question type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__choose__" disabled>
                              Choose a question type...
                            </SelectItem>
                            {QUESTION_TYPES.filter(
                              (qt) => qt.value !== "all",
                            ).map((qt) => (
                              <SelectItem key={qt.value} value={qt.value}>
                                {qt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {draft.confirmedType && (
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                          {getQuestionTypeLabel(draft.confirmedType)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveDraft(draft.id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveAll} className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Save All to Question Bank
              </Button>
              <Button variant="outline" onClick={() => setQuestionDrafts([])}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

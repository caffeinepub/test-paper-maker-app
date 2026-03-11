import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Check, Info, Plus, Search, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingAIButton } from "../../components/ai/FloatingAIButton";
import {
  insertQuestionIntoHeading,
  insertQuestionIntoSection,
  insertQuestionsIntoHeading,
} from "../../lib/editor/insertQuestionsIntoPaper";
import {
  clearSectionInsertContext,
  getSectionInsertContext,
} from "../../lib/editor/sectionInsertContext";
import {
  QUESTION_TYPES,
  type QuestionTypeFilter,
  SUBJECT_COLOURS,
} from "../../lib/questionBank/questionBankTaxonomy";
import type { Question } from "../../state/mockData";
import { useMockStore } from "../../state/mockStore";

export function QuestionBankBoardStandardWireframe() {
  const navigate = useNavigate();
  const { board, standardId, subjectId } = useParams({
    from: "/question-bank/$board/$standardId/subjects/$subjectId",
  });
  const search = useSearch({ strict: false }) as {
    tab?: string;
    subjectName?: string;
  };
  const {
    getStarterQuestions,
    personalQuestions,
    getPaperById,
    updatePaper,
    updatePersonalQuestion,
    standards,
  } = useMockStore();
  const [selectedTab] = useState(search?.tab || "personal");
  const [selectedType, setSelectedType] = useState<QuestionTypeFilter>("all");
  const [insertContext, setInsertContext] = useState(getSectionInsertContext());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    setInsertContext(getSectionInsertContext());
  }, []);

  const isMultiSelectMode = insertContext?.headingId !== undefined;

  const standard = standards.find((s) => s.id === standardId);
  const subject = standard?.subjects.find((s) => s.id === subjectId);
  const subjectName = search?.subjectName || subject?.name || "";
  const standardName = standard?.name || "";

  const subjectColour = subject
    ? SUBJECT_COLOURS[subject.colourIndex % SUBJECT_COLOURS.length]
    : "#7c3aed";

  const allQuestions =
    selectedTab === "starter" ? getStarterQuestions() : personalQuestions;

  const filteredQuestions = allQuestions.filter((q) => {
    const matchesBoard = q.board === board;
    const matchesStandard = q.standard === standardName;
    const matchesSubject = subjectName ? q.subject === subjectName : true;
    const matchesType =
      selectedType === "all" || q.questionType === selectedType;
    const matchesTag =
      !tagFilter.trim() ||
      (q.tags ?? []).some((t) =>
        t.toLowerCase().includes(tagFilter.trim().toLowerCase()),
      );
    return (
      matchesBoard &&
      matchesStandard &&
      matchesSubject &&
      matchesType &&
      matchesTag
    );
  });

  const handleBack = () => {
    navigate({
      to: "/question-bank/$board/$standardId/subjects",
      params: { board, standardId },
      search: { tab: selectedTab },
    });
  };

  const handleUseQuestion = (question: Question) => {
    if (!insertContext) {
      alert("No paper context found. Please navigate from the paper editor.");
      return;
    }

    const paper = getPaperById(insertContext.paperId);
    if (!paper) {
      alert("Paper not found");
      return;
    }

    let updatedSections: ReturnType<typeof insertQuestionIntoHeading>;
    if (insertContext.headingId) {
      updatedSections = insertQuestionIntoHeading(
        paper,
        insertContext.sectionId,
        insertContext.headingId,
        question,
      );
    } else {
      updatedSections = insertQuestionIntoSection(
        paper,
        insertContext.sectionId,
        question,
      );
    }

    updatePaper(insertContext.paperId, { sections: updatedSections });
    clearSectionInsertContext();
    alert("Question added to paper!");
    navigate({ to: `/editor/${insertContext.paperId}/real-paper` });
  };

  const handleToggleSelect = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleInsertSelected = () => {
    if (!insertContext || !insertContext.headingId) {
      alert("No heading context found");
      return;
    }

    if (selectedQuestions.size === 0) {
      alert("Please select at least one question");
      return;
    }

    const paper = getPaperById(insertContext.paperId);
    if (!paper) {
      alert("Paper not found");
      return;
    }

    const questionsToInsert = filteredQuestions.filter((q) =>
      selectedQuestions.has(q.id),
    );
    const updatedSections = insertQuestionsIntoHeading(
      paper,
      insertContext.sectionId,
      insertContext.headingId,
      questionsToInsert,
    );

    updatePaper(insertContext.paperId, { sections: updatedSections });
    clearSectionInsertContext();
    alert(`${questionsToInsert.length} question(s) added to paper!`);
    navigate({ to: `/editor/${insertContext.paperId}/real-paper` });
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditText(question.text);
    setEditTags(question.tags ? [...question.tags] : []);
    setTagInput("");
  };

  const handleSaveEdit = (questionId: string) => {
    if (selectedTab === "personal") {
      updatePersonalQuestion(questionId, {
        text: editText,
        tags: editTags.length > 0 ? editTags : undefined,
      });
    }
    setEditingId(null);
    setEditText("");
    setEditTags([]);
    setTagInput("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditTags([]);
    setTagInput("");
  };

  const handleAddEditTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed || editTags.includes(trimmed)) return;
    setEditTags((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const handleRemoveEditTag = (tag: string) => {
    setEditTags((prev) => prev.filter((t) => t !== tag));
  };

  const getSectionLabel = () => {
    if (!insertContext) return null;
    const paper = getPaperById(insertContext.paperId);
    if (!paper) return null;
    const sectionIndex = paper.sections.findIndex(
      (s) => s.id === insertContext.sectionId,
    );
    if (sectionIndex === -1) return null;

    let label = `Section ${String.fromCharCode(65 + sectionIndex)}`;

    if (insertContext.headingId) {
      const section = paper.sections[sectionIndex];
      const heading = section.headings?.find(
        (h) => h.id === insertContext.headingId,
      );
      if (heading) {
        label += ` - ${heading.title}`;
      }
    }

    return label;
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8 page-with-floating-ui">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {standardName || "Subjects"}
      </Button>

      <div className="mb-6">
        <div className="flex items-center gap-2">
          {/* Colour dot before subject name */}
          <span
            className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
            style={{ backgroundColor: subjectColour }}
          />
          <h1 className="text-2xl font-bold text-foreground">
            {subjectName || "Questions"}
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {board} &middot; {standardName} &middot;{" "}
          {selectedTab === "starter" ? "Starter Questions" : "My Questions"}
        </p>
      </div>

      {insertContext && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {isMultiSelectMode ? (
              <>
                Adding questions to <strong>{getSectionLabel()}</strong> for
                paper{" "}
                <strong>{getPaperById(insertContext.paperId)?.title}</strong>.
                Select multiple questions and click "Insert Selected".
              </>
            ) : (
              <>
                Adding question to <strong>{getSectionLabel()}</strong> for
                paper{" "}
                <strong>{getPaperById(insertContext.paperId)?.title}</strong>.
                Click "Use" on any question.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 space-y-3">
        <div>
          <label
            htmlFor="question-type-filter"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Find questions using question type
          </label>
          <Select
            value={selectedType}
            onValueChange={(value: QuestionTypeFilter) =>
              setSelectedType(value)
            }
          >
            <SelectTrigger
              id="question-type-filter"
              className="max-w-xs"
              data-ocid="questions.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUESTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="max-w-xs">
          <label
            htmlFor="tag-filter"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Filter by tag
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="tag-filter"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder="Filter by tag..."
              className="pl-8"
              data-ocid="questions.search_input"
            />
            {tagFilter && (
              <button
                type="button"
                onClick={() => setTagFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isMultiSelectMode && selectedQuestions.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border bg-card p-4">
          <span className="text-sm font-medium">
            {selectedQuestions.size} question
            {selectedQuestions.size > 1 ? "s" : ""} selected
          </span>
          <Button onClick={handleInsertSelected}>
            <Check className="mr-2 h-4 w-4" />
            Insert Selected
          </Button>
        </div>
      )}

      {filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-foreground">
              No questions added yet.
            </p>
            <p className="mt-2 text-muted-foreground">
              Start by selecting add questions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                {editingId === question.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    {/* Tag editing */}
                    <div className="space-y-1">
                      <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {editTags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveEditTag(tag)}
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
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              handleAddEditTag();
                            }
                          }}
                          placeholder="Add tag, press Enter"
                          className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                        />
                        <button
                          type="button"
                          onClick={handleAddEditTag}
                          className="h-7 rounded-md border border-input px-2 text-xs hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(question.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    {isMultiSelectMode && (
                      <Checkbox
                        checked={selectedQuestions.has(question.id)}
                        onCheckedChange={() => handleToggleSelect(question.id)}
                        className="mt-1"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start gap-2">
                        <p className="text-foreground">{question.text}</p>
                        {(question as any).difficulty === "easy" && (
                          <span className="shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
                            Easy
                          </span>
                        )}
                        {(question as any).difficulty === "medium" && (
                          <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                            Medium
                          </span>
                        )}
                        {(question as any).difficulty === "hard" && (
                          <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-800">
                            Hard
                          </span>
                        )}
                      </div>
                      {/* Answer preview */}
                      {question.answer && (
                        <p className="mt-1.5 rounded-md bg-green-50 px-2 py-1 text-xs text-green-800 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800">
                          <span className="font-semibold">Answer: </span>
                          {question.answer.slice(0, 120)}
                          {question.answer.length > 120 ? "…" : ""}
                        </p>
                      )}
                      {question.questionType === "mcq" &&
                        question.mcqOptions?.correctAnswer !== undefined && (
                          <p className="mt-1.5 rounded-md bg-green-50 px-2 py-1 text-xs text-green-800 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800">
                            <span className="font-semibold">Answer: </span>
                            Option{" "}
                            {String.fromCharCode(
                              65 + question.mcqOptions.correctAnswer,
                            )}
                            {question.mcqOptions.options?.[
                              question.mcqOptions.correctAnswer
                            ]
                              ? ` — ${question.mcqOptions.options[question.mcqOptions.correctAnswer].slice(0, 60)}`
                              : ""}
                          </p>
                        )}
                      {question.questionType === "true-false" &&
                        question.trueFalseData?.correctAnswer !== undefined && (
                          <p className="mt-1.5 rounded-md bg-green-50 px-2 py-1 text-xs text-green-800 border border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800">
                            <span className="font-semibold">Answer: </span>
                            {question.trueFalseData.correctAnswer
                              ? "True"
                              : "False"}
                          </p>
                        )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                          {question.marks} Mark{question.marks > 1 ? "s" : ""}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {question.type}
                        </span>
                        {question.subject && (
                          <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                            {question.subject}
                          </span>
                        )}
                        {question.tags &&
                          question.tags.length > 0 &&
                          question.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {selectedTab === "personal" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(question)}
                        >
                          Edit
                        </Button>
                      )}
                      {!isMultiSelectMode && insertContext && (
                        <Button
                          size="sm"
                          onClick={() => handleUseQuestion(question)}
                        >
                          Use
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FloatingAIButton />
    </div>
  );
}

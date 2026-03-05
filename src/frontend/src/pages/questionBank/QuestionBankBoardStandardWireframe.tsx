import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Check, Info, X } from "lucide-react";
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
} from "../../lib/questionBank/questionBankTaxonomy";
import type { Question } from "../../state/mockData";
import { useMockStore } from "../../state/mockStore";

export function QuestionBankBoardStandardWireframe() {
  const navigate = useNavigate();
  const { board, standard } = useParams({
    from: "/question-bank/$board/$standard",
  });
  const search = useSearch({ strict: false }) as { tab?: string };
  const {
    getStarterQuestions,
    personalQuestions,
    getPaperById,
    updatePaper,
    updatePersonalQuestion,
  } = useMockStore();
  const [selectedTab] = useState(search?.tab || "starter");
  const [selectedType, setSelectedType] = useState<QuestionTypeFilter>("all");
  const [insertContext, setInsertContext] = useState(getSectionInsertContext());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    setInsertContext(getSectionInsertContext());
  }, []);

  const isMultiSelectMode = insertContext?.headingId !== undefined;

  const allQuestions =
    selectedTab === "starter" ? getStarterQuestions() : personalQuestions;
  const filteredQuestions = allQuestions.filter((q) => {
    const matchesBoard = q.board === board;
    const matchesStandard = q.standard === standard;
    const matchesType =
      selectedType === "all" || q.questionType === selectedType;
    return matchesBoard && matchesStandard && matchesType;
  });

  const handleBack = () => {
    navigate({ to: "/question-bank", search: { tab: selectedTab } });
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
  };

  const handleSaveEdit = (questionId: string) => {
    if (selectedTab === "personal") {
      updatePersonalQuestion(questionId, { text: editText });
    }
    setEditingId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
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
        Back to Question Bank
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          {board} - {standard}
        </h1>
        <p className="mt-2 text-muted-foreground">
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
                Select a standard to browse questions.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <label
          htmlFor="question-type-filter"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Find questions using question type
        </label>
        <Select
          value={selectedType}
          onValueChange={(value: QuestionTypeFilter) => setSelectedType(value)}
        >
          <SelectTrigger id="question-type-filter" className="max-w-xs">
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
              Start by selecting add questions .
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
                      <p className="text-foreground">{question.text}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                          {question.marks} Mark{question.marks > 1 ? "s" : ""}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {question.type}
                        </span>
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

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  Edit2,
  Info,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { QuestionCategorizationDialog } from "../../components/questionBank/QuestionCategorizationDialog";
import { generateMockQuestions } from "../../lib/ai/mockQuestionGenerator";
import {
  insertQuestionsIntoHeading,
  insertQuestionsIntoSection,
} from "../../lib/editor/insertQuestionsIntoPaper";
import {
  clearSectionInsertContext,
  getSectionInsertContext,
} from "../../lib/editor/sectionInsertContext";
import type { Question, QuestionType } from "../../state/mockData";
import { useMockStore } from "../../state/mockStore";

interface GeneratedQuestion {
  id: string;
  text: string;
  marks: number;
  type: string;
  questionType: QuestionType;
  selected: boolean;
  editing: boolean;
}

export function AIPreferencesWireframe() {
  const navigate = useNavigate();
  const { addPersonalQuestion, getPaperById, updatePaper, profile } =
    useMockStore();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [count, setCount] = useState(5);
  const [focusArea, setFocusArea] = useState("");
  const [questionStyle, setQuestionStyle] = useState<
    "conceptual" | "numerical" | "mixed"
  >("mixed");
  const [generatedQuestions, setGeneratedQuestions] = useState<
    GeneratedQuestion[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCategorizationDialog, setShowCategorizationDialog] =
    useState(false);

  const insertContext = getSectionInsertContext();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const questions = generateMockQuestions({
      focusArea: focusArea || topic,
      marks: "2",
      difficulty,
      questionStyle: questionStyle === "mixed" ? undefined : questionStyle,
    });

    setGeneratedQuestions(
      questions.map((q) => ({
        ...q,
        type: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        questionType: "short-answer" as QuestionType,
        selected: false,
        editing: false,
      })),
    );
    setIsGenerating(false);
  };

  const handleToggleSelect = (id: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q)),
    );
  };

  const handleEdit = (id: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, editing: !q.editing } : q)),
    );
  };

  const handleUpdateQuestion = (id: string, text: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text } : q)),
    );
  };

  const handleDelete = (id: string) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleAddToBank = () => {
    const selectedQuestions = generatedQuestions.filter((q) => q.selected);
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question");
      return;
    }

    setShowCategorizationDialog(true);
  };

  const handleCategorizationConfirm = (metadata: {
    board: string;
    standard: string;
    questionType: string;
  }) => {
    const selectedQuestions = generatedQuestions.filter((q) => q.selected);

    for (const q of selectedQuestions) {
      const newQuestion: Question = {
        id: `q-${Date.now()}-${Math.random()}`,
        text: q.text,
        marks: q.marks,
        type: q.type,
        questionType: metadata.questionType as QuestionType,
        headingId: null,
        imageAttachment: null,
        board: metadata.board,
        standard: metadata.standard,
      };
      addPersonalQuestion(newQuestion);
    }

    alert(
      `${selectedQuestions.length} question(s) added to your personal bank!`,
    );
    setGeneratedQuestions([]);
  };

  const handleAddToPaper = () => {
    if (!insertContext) {
      return; // Error is shown in UI
    }

    const selectedQuestions = generatedQuestions.filter((q) => q.selected);
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question");
      return;
    }

    const paper = getPaperById(insertContext.paperId);
    if (!paper) {
      alert("Paper not found");
      return;
    }

    const targetSection = paper.sections.find(
      (s) => s.id === insertContext.sectionId,
    );
    if (!targetSection) {
      alert("Section not found");
      return;
    }

    // Convert generated questions to full Question objects
    const fullQuestions: Question[] = selectedQuestions.map((q) => ({
      id: `temp-${Date.now()}-${Math.random()}`, // Will be replaced by insertion function
      text: q.text,
      marks: q.marks,
      type: q.type,
      questionType: q.questionType,
      headingId: null, // Will be set by insertion function
      imageAttachment: null,
      board: paper.board,
      standard: paper.standard,
    }));

    let updatedSections: ReturnType<typeof insertQuestionsIntoHeading>;
    if (insertContext.headingId) {
      updatedSections = insertQuestionsIntoHeading(
        paper,
        insertContext.sectionId,
        insertContext.headingId,
        fullQuestions,
      );
    } else {
      updatedSections = insertQuestionsIntoSection(
        paper,
        insertContext.sectionId,
        fullQuestions,
      );
    }

    updatePaper(insertContext.paperId, { sections: updatedSections });
    clearSectionInsertContext();
    alert(`${selectedQuestions.length} question(s) added to paper!`);
    navigate({ to: `/editor/${insertContext.paperId}/real-paper` });
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
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Assistant
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create questions based on selected topics, standards, and preferences.
        </p>
      </div>

      {insertContext && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Generating questions for <strong>{getSectionLabel()}</strong> in
            paper <strong>{getPaperById(insertContext.paperId)?.title}</strong>
          </AlertDescription>
        </Alert>
      )}

      {!insertContext && generatedQuestions.some((q) => q.selected) && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No paper context found. You can only add questions to your personal
            bank. To add directly to a paper, navigate here from the Real Paper
            editor.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Question Preferences</CardTitle>
            <CardDescription>
              Configure the AI to generate questions matching your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Subject</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Quadratic Equations"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="focusArea">Focus Area (Optional)</Label>
              <Textarea
                id="focusArea"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="Specific concepts, formulas, or areas to focus on..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={difficulty}
                  onValueChange={(value: any) => setDifficulty(value)}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Number of Questions</Label>
                <Input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) =>
                    setCount(Number.parseInt(e.target.value) || 1)
                  }
                  min={1}
                  max={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionStyle">Question Style</Label>
              <Select
                value={questionStyle}
                onValueChange={(value: any) => setQuestionStyle(value)}
              >
                <SelectTrigger id="questionStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conceptual">Conceptual</SelectItem>
                  <SelectItem value="numerical">Numerical</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Questions"}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Questions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Questions</CardTitle>
            <CardDescription>
              {generatedQuestions.length > 0
                ? `${generatedQuestions.filter((q) => q.selected).length} of ${generatedQuestions.length} selected`
                : "Questions will appear here after generation"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="mb-4 h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Configure your preferences and click "Generate Questions" to
                  get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {generatedQuestions.map((question) => (
                    <Card
                      key={question.id}
                      className={`cursor-pointer transition-all ${
                        question.selected ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        {question.editing ? (
                          <div className="space-y-2">
                            <Textarea
                              value={question.text}
                              onChange={(e) =>
                                handleUpdateQuestion(
                                  question.id,
                                  e.target.value,
                                )
                              }
                              className="min-h-[80px]"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(question.id)}
                            >
                              Done
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={question.selected}
                              onChange={() => handleToggleSelect(question.id)}
                              className="mt-1 h-4 w-4 cursor-pointer"
                            />
                            <div className="flex-1">
                              <p className="text-foreground">{question.text}</p>
                              <div className="mt-2 flex gap-2">
                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                  {question.marks} Mark
                                  {question.marks > 1 ? "s" : ""}
                                </span>
                                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                  {question.type}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(question.id)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={handleAddToBank}
                    variant="outline"
                    className="flex-1"
                    disabled={
                      generatedQuestions.filter((q) => q.selected).length === 0
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Personal Bank
                  </Button>
                  <Button
                    onClick={handleAddToPaper}
                    className="flex-1"
                    disabled={
                      !insertContext ||
                      generatedQuestions.filter((q) => q.selected).length === 0
                    }
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Add to Paper
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <QuestionCategorizationDialog
        open={showCategorizationDialog}
        onOpenChange={setShowCategorizationDialog}
        onConfirm={handleCategorizationConfirm}
        defaultBoard={profile.preferredBoard}
        defaultStandard={profile.defaultStandard}
      />
    </div>
  );
}

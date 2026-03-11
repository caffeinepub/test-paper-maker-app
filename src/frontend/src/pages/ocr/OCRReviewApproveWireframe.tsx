import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  CheckSquare,
  Edit2,
  ScanText,
  Square,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { QuestionCategorizationDialog } from "../../components/questionBank/QuestionCategorizationDialog";
import {
  type OCRQuestion,
  clearOCRSession,
  convertOCRQuestionsToPersonalQuestions,
  loadOCRSession,
} from "../../lib/ocr/mockOcrExtractor";
import type { Question } from "../../state/mockData";
import { useMockStore } from "../../state/mockStore";

export function OCRReviewApproveWireframe() {
  const navigate = useNavigate();
  const { addPersonalQuestion, profile } = useMockStore();
  const [session, setSession] = useState(loadOCRSession());
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showCategorizationDialog, setShowCategorizationDialog] =
    useState(false);

  useEffect(() => {
    if (!session) {
      navigate({ to: "/ocr/upload" });
    }
  }, [session, navigate]);

  const handleBack = () => {
    navigate({ to: "/ocr/upload" });
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

  const handleSelectAll = () => {
    if (!session) return;
    if (selectedQuestions.size === session.questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(session.questions.map((q) => q.id)));
    }
  };

  const handleEdit = (questionId: string, text: string) => {
    setEditingId(questionId);
    setEditText(text);
  };

  const handleSaveEdit = (questionId: string) => {
    if (session) {
      const updatedQuestions = session.questions.map((q) =>
        q.id === questionId ? { ...q, text: editText } : q,
      );
      setSession({ ...session, questions: updatedQuestions });
    }
    setEditingId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleApprove = () => {
    if (selectedQuestions.size === 0) {
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
    if (!session) return;

    const selectedOcrQuestions = session.questions.filter((q) =>
      selectedQuestions.has(q.id),
    );
    const personalQuestions =
      convertOCRQuestionsToPersonalQuestions(selectedOcrQuestions);

    for (const personalQuestion of personalQuestions) {
      const enrichedQuestion: Question = {
        ...personalQuestion,
        board: metadata.board,
        standard: metadata.standard,
        questionType: metadata.questionType as any,
      };
      addPersonalQuestion(enrichedQuestion);
    }

    clearOCRSession();
    alert(
      `${selectedOcrQuestions.length} question(s) added to your personal bank!`,
    );
    // Navigate to question bank (standards list) rather than a specific standard route
    navigate({
      to: "/question-bank",
      search: { tab: "personal" },
    });
  };

  if (!session) {
    return null;
  }

  const allSelected =
    session.questions.length > 0 &&
    selectedQuestions.size === session.questions.length;

  const typeLabel = (q: OCRQuestion) => {
    if (q.questionType === "mcq") return "MCQ";
    if (q.questionType === "fill-in-blank") return "Fill in Blank";
    if (q.questionType === "short-answer") return "Short Answer";
    return q.questionType || "Short Answer";
  };

  return (
    <div
      className="min-h-screen p-4 py-8"
      style={{
        background:
          "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f3e8ff 100%)",
        colorScheme: "light",
      }}
    >
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            style={{ color: "#7c3aed" }}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl shadow-md"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
          >
            <ScanText className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#4c1d95" }}>
            Review Extracted Questions
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6d28d9" }}>
            {session.questions.length} question
            {session.questions.length !== 1 ? "s" : ""} found. Select the ones
            you want to save.
          </p>
        </div>

        {/* Toolbar */}
        <div
          className="mb-4 flex items-center justify-between rounded-xl px-4 py-3"
          style={{
            background: "white",
            border: "1px solid #e9d5ff",
            boxShadow: "0 1px 4px rgba(124,58,237,0.08)",
          }}
        >
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: "#7c3aed" }}
            onClick={handleSelectAll}
          >
            {allSelected ? (
              <CheckSquare className="h-5 w-5" />
            ) : (
              <Square className="h-5 w-5" />
            )}
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          <span className="text-sm" style={{ color: "#6d28d9" }}>
            {selectedQuestions.size} selected
          </span>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={selectedQuestions.size === 0}
            style={{
              background:
                selectedQuestions.size > 0
                  ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                  : undefined,
              color: selectedQuestions.size > 0 ? "white" : undefined,
            }}
          >
            <Check className="mr-2 h-4 w-4" />
            Add to Bank
          </Button>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {session.questions.map((question, idx) => (
            <div
              key={question.id}
              className="rounded-xl p-4 transition-all"
              style={{
                background: selectedQuestions.has(question.id)
                  ? "linear-gradient(135deg, #ede9fe, #f5f3ff)"
                  : "white",
                border: selectedQuestions.has(question.id)
                  ? "1px solid #a78bfa"
                  : "1px solid #e9d5ff",
                boxShadow: "0 1px 4px rgba(124,58,237,0.06)",
              }}
            >
              {editingId === question.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[100px] border-purple-300 focus:ring-purple-400"
                    style={{ borderColor: "#c4b5fd" }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(question.id)}
                      style={{
                        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                        color: "white",
                      }}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      style={{ borderColor: "#c4b5fd", color: "#7c3aed" }}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedQuestions.has(question.id)}
                    onCheckedChange={() => handleToggleSelect(question.id)}
                    className="mt-1"
                    style={{ accentColor: "#7c3aed" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#1e1b4b" }}
                    >
                      <span
                        className="mr-2 font-bold"
                        style={{ color: "#7c3aed" }}
                      >
                        Q{idx + 1}.
                      </span>
                      {question.text}
                    </p>
                    {question.questionType === "mcq" && question.mcqOptions && (
                      <div className="mt-2 space-y-1">
                        {question.mcqOptions.options.map((opt, i) => (
                          <p
                            key={`${question.id}-opt-${i}`}
                            className="text-xs pl-2"
                            style={{ color: "#6d28d9" }}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ background: "#ede9fe", color: "#7c3aed" }}
                      >
                        {typeLabel(question)}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ background: "#f3f4f6", color: "#6b7280" }}
                      >
                        {question.marks || 2} Mark
                        {(question.marks || 2) > 1 ? "s" : ""}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ background: "#f3f4f6", color: "#6b7280" }}
                      >
                        {question.difficulty || "Medium"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(question.id, question.text)}
                    style={{ color: "#7c3aed" }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Approve Bar */}
        {selectedQuestions.size > 0 && (
          <div
            className="fixed bottom-0 left-0 right-0 flex items-center justify-between p-4 z-50"
            style={{
              background: "white",
              borderTop: "1px solid #e9d5ff",
              boxShadow: "0 -2px 12px rgba(124,58,237,0.12)",
            }}
          >
            <span
              className="text-sm font-semibold"
              style={{ color: "#4c1d95" }}
            >
              {selectedQuestions.size} question
              {selectedQuestions.size > 1 ? "s" : ""} selected
            </span>
            <Button
              onClick={handleApprove}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "white",
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve Selected
            </Button>
          </div>
        )}

        {/* Bottom padding when fixed bar is visible */}
        {selectedQuestions.size > 0 && <div className="h-20" />}
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

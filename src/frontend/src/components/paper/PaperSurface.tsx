import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { setSectionInsertContext } from "../../lib/editor/sectionInsertContext";
import type { Paper, Question } from "../../state/mockData";
import { useMockStore } from "../../state/mockStore";
import { InsertFromQuestionBankDialog } from "../editor/InsertFromQuestionBankDialog";
import { PaperRenderer } from "./PaperRenderer";
import { QuestionBlockEditor } from "./QuestionBlockEditor";

interface PaperSurfaceProps {
  paper: Paper;
  isEditable?: boolean;
  selectedQuestionId?: string | null;
  onSelectQuestion?: (questionId: string | null) => void;
  onUpdateQuestion?: (
    sectionId: string,
    questionId: string,
    updates: Partial<Question>,
  ) => void;
  onDeleteQuestion?: (sectionId: string, questionId: string) => void;
  autoFocusQuestionId?: string | null;
  onAutoFocusComplete?: () => void;
  onUpdatePaperMeta?: (updates: Partial<Paper>) => void;
}

export function PaperSurface({
  paper,
  isEditable = false,
  selectedQuestionId,
  onSelectQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  autoFocusQuestionId,
  onAutoFocusComplete,
  onUpdatePaperMeta,
}: PaperSurfaceProps) {
  const navigate = useNavigate();
  const { profile } = useMockStore();
  const autoFocusRef = useRef<HTMLDivElement>(null);
  const [showQuestionBankDialog, setShowQuestionBankDialog] = useState(false);
  const [pendingInsertContext, setPendingInsertContext] = useState<{
    sectionId: string;
    headingId: string;
  } | null>(null);

  useEffect(() => {
    if (autoFocusQuestionId && autoFocusRef.current) {
      autoFocusRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      const firstInput = autoFocusRef.current.querySelector(
        'textarea, input[type="text"]',
      ) as HTMLTextAreaElement | HTMLInputElement;
      if (firstInput) {
        setTimeout(() => {
          firstInput.focus();
          if (
            firstInput instanceof HTMLTextAreaElement &&
            firstInput.value === ""
          ) {
            firstInput.setSelectionRange(0, 0);
          }
        }, 300);
      }
      if (onAutoFocusComplete) {
        setTimeout(() => {
          onAutoFocusComplete();
        }, 500);
      }
    }
  }, [autoFocusQuestionId, onAutoFocusComplete]);

  const handleAddFromBank = (sectionId: string, headingId?: string) => {
    setPendingInsertContext({ sectionId, headingId: headingId || "" });
    setShowQuestionBankDialog(true);
  };

  const handleQuestionBankConfirm = (board: string, standardId: string) => {
    if (!pendingInsertContext) return;
    const context: any = {
      paperId: paper.id,
      sectionId: pendingInsertContext.sectionId,
      source: "question-bank",
    };
    if (pendingInsertContext.headingId) {
      context.headingId = pendingInsertContext.headingId;
    }
    setSectionInsertContext(context);
    navigate({
      to: "/question-bank/$board/$standardId/subjects",
      params: { board, standardId },
      search: { tab: "personal" },
    });
  };

  const handleAddWithAI = (sectionId: string, headingId?: string) => {
    const context: any = { paperId: paper.id, sectionId, source: "ai" };
    if (headingId) context.headingId = headingId;
    setSectionInsertContext(context);
    navigate({ to: "/ai" });
  };

  const handleQuestionClick = (e: React.MouseEvent, questionId: string) => {
    if (isEditable && onSelectQuestion) {
      const target = e.target as HTMLElement;
      if (
        target.tagName !== "INPUT" &&
        target.tagName !== "TEXTAREA" &&
        target.tagName !== "BUTTON" &&
        !target.closest("button") &&
        !target.closest(".rich-cell-editor")
      ) {
        onSelectQuestion(questionId);
      }
    }
  };

  const computedTotalMarks = paper.sections.reduce(
    (total, section) =>
      total +
      section.questions.reduce((sTotal, q) => sTotal + (q.marks || 0), 0),
    0,
  );

  return (
    <>
      {/* A4 paper surface */}
      <div className="paper-surface w-full max-w-[210mm] bg-white text-black shadow-2xl print:max-w-none print:shadow-none">
        {/* Inner content with consistent padding from all walls */}
        <div className="paper-inner">
          {/* ── EXAM PAPER HEADER ── */}
          <div className="paper-exam-header">
            {/* Top row: Institute info LEFT, Logo RIGHT */}
            <div className="paper-header-top">
              <div className="paper-header-info">
                {isEditable && onUpdatePaperMeta ? (
                  <input
                    className="paper-institute-name bg-transparent border-b border-dashed border-gray-400 outline-none focus:border-purple-500 w-full"
                    value={profile.instituteName || ""}
                    readOnly
                    placeholder="[Institute Name]"
                    title="Edit institute name in Profile settings"
                  />
                ) : (
                  <div className="paper-institute-name">
                    {profile.instituteName || "[Institute Name]"}
                  </div>
                )}
                {isEditable && onUpdatePaperMeta ? (
                  <input
                    className="paper-paper-title bg-transparent border-b border-dashed border-gray-400 outline-none focus:border-purple-500 w-full mt-1"
                    value={paper.title || ""}
                    onChange={(e) =>
                      onUpdatePaperMeta({ title: e.target.value })
                    }
                    placeholder="[Paper Title]"
                  />
                ) : (
                  <div className="paper-paper-title mt-1">
                    {paper.title || "[Paper Title]"}
                  </div>
                )}
                <div className="paper-meta-row mt-2">
                  <span>
                    <strong>Board:</strong> {paper.board}
                  </span>
                  <span className="paper-meta-sep">|</span>
                  <span>
                    <strong>Class:</strong> {paper.standard || "—"}
                  </span>
                  {paper.subject && (
                    <>
                      <span className="paper-meta-sep">|</span>
                      <span>
                        <strong>Subject:</strong> {paper.subject}
                      </span>
                    </>
                  )}
                  {paper.medium && (
                    <>
                      <span className="paper-meta-sep">|</span>
                      <span>
                        <strong>Medium:</strong> {paper.medium}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {/* Logo rectangle — right side */}
              {profile.schoolLogo ? (
                <div className="paper-logo-box">
                  <img
                    src={profile.schoolLogo}
                    alt="School Logo"
                    className="paper-logo-img"
                  />
                </div>
              ) : (
                <div className="paper-logo-box paper-logo-placeholder">
                  <span className="paper-logo-placeholder-text">LOGO</span>
                </div>
              )}
            </div>

            {/* Time / Marks row */}
            <div className="paper-time-marks-row">
              <span>
                Time Allowed: <strong>{paper.timeMinutes} min</strong>
              </span>
              <span>
                Maximum Marks: <strong>{computedTotalMarks}</strong>
              </span>
            </div>
          </div>

          {/* Student info row */}
          <div className="paper-student-row">
            <span className="paper-student-field">
              Name: <span className="paper-blank" />
            </span>
            <span className="paper-student-field">
              Roll No.: <span className="paper-blank paper-blank-short" />
            </span>
            <span className="paper-student-field">
              Date: <span className="paper-blank paper-blank-short" />
            </span>
          </div>

          {/* Paper Body */}
          <div className="paper-body">
            {paper.sections.map((section, idx) => {
              const headings = section.headings || [];

              return (
                <div key={section.id} className="paper-section">
                  {/* Section Header */}
                  <div className="paper-section-header">
                    Section {String.fromCharCode(65 + idx)}
                  </div>

                  {/* Question Headings */}
                  {headings.length === 0 ? (
                    <div className="paper-empty-state">
                      <p className="text-xs text-gray-400 italic">
                        No question headings yet.{" "}
                        {isEditable &&
                          "Add a question heading to organize questions."}
                      </p>
                    </div>
                  ) : (
                    headings.map((heading) => {
                      const headingQuestions = section.questions.filter(
                        (q) => q.headingId === heading.id,
                      );
                      const headingTotalMarks = headingQuestions.reduce(
                        (sum, q) => sum + (q.marks || 0),
                        0,
                      );
                      const allSameMark =
                        headingQuestions.length > 0 &&
                        headingQuestions.every(
                          (q) => q.marks === headingQuestions[0].marks,
                        );
                      const marksDisplay =
                        headingQuestions.length === 0
                          ? `${heading.plannedCount} × ${section.marks} = ${heading.plannedCount * section.marks} marks`
                          : allSameMark
                            ? `${headingQuestions.length} × ${headingQuestions[0].marks} = ${headingTotalMarks} marks`
                            : `${headingTotalMarks} marks`;

                      return (
                        <div key={heading.id} className="paper-heading-block">
                          {/* Heading title */}
                          <div className="paper-heading-title">
                            <span className="paper-heading-bullet">●</span>
                            <span className="paper-heading-text">
                              {heading.title}
                              <span className="paper-heading-marks">
                                {" "}
                                ({marksDisplay})
                              </span>
                            </span>
                          </div>

                          {/* Insert buttons (editor only) */}
                          {isEditable && (
                            <div className="paper-insert-buttons print:hidden">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleAddFromBank(section.id, heading.id)
                                }
                                className="h-7 px-2 text-xs"
                                data-ocid="paper.secondary_button"
                              >
                                <BookOpen className="mr-1 h-3 w-3" />
                                Insert from Bank
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleAddWithAI(section.id, heading.id)
                                }
                                className="h-7 px-2 text-xs"
                                data-ocid="paper.secondary_button"
                              >
                                <Sparkles className="mr-1 h-3 w-3" />
                                Insert from AI
                              </Button>
                            </div>
                          )}

                          {/* Questions */}
                          {headingQuestions.length === 0 ? (
                            <div className="paper-empty-state ml-4">
                              <p className="text-xs text-gray-400 italic">
                                No questions yet.{" "}
                                {isEditable &&
                                  "Use the buttons above to add questions."}
                              </p>
                            </div>
                          ) : (
                            <div className="paper-questions-list">
                              {headingQuestions.map((question, qIdx) => {
                                const isSelected =
                                  selectedQuestionId === question.id;
                                const shouldAutoFocus =
                                  autoFocusQuestionId === question.id;

                                return (
                                  <div
                                    key={question.id}
                                    ref={shouldAutoFocus ? autoFocusRef : null}
                                    className={`paper-question-item ${
                                      isEditable
                                        ? isSelected
                                          ? "paper-question-selected"
                                          : "paper-question-editable"
                                        : ""
                                    }`}
                                    onClick={(e) =>
                                      handleQuestionClick(e, question.id)
                                    }
                                    onKeyDown={(e) =>
                                      e.key === "Enter" &&
                                      handleQuestionClick(
                                        e as unknown as React.MouseEvent,
                                        question.id,
                                      )
                                    }
                                    role={isEditable ? "button" : undefined}
                                    tabIndex={isEditable ? 0 : undefined}
                                  >
                                    {isEditable &&
                                    isSelected &&
                                    onUpdateQuestion &&
                                    onDeleteQuestion ? (
                                      <QuestionBlockEditor
                                        question={question}
                                        questionNumber={qIdx + 1}
                                        onUpdate={(updates) =>
                                          onUpdateQuestion(
                                            section.id,
                                            question.id,
                                            updates,
                                          )
                                        }
                                        onDelete={() =>
                                          onDeleteQuestion(
                                            section.id,
                                            question.id,
                                          )
                                        }
                                        autoFocus={shouldAutoFocus}
                                      />
                                    ) : (
                                      <div className="paper-question-row">
                                        <span className="paper-q-number">
                                          {qIdx + 1}.
                                        </span>
                                        <div className="paper-q-content">
                                          <PaperRenderer question={question} />
                                        </div>
                                        {isEditable && (
                                          <span className="paper-q-marks print:hidden">
                                            [{question.marks}m]
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Empty state actions */}
                  {isEditable &&
                    headings.length > 0 &&
                    section.questions.length === 0 && (
                      <div className="flex flex-wrap justify-center gap-2 pt-2 print:hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddFromBank(section.id)}
                        >
                          <BookOpen className="mr-2 h-4 w-4" /> Add from Bank
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddWithAI(section.id)}
                        >
                          <Sparkles className="mr-2 h-4 w-4" /> Generate with AI
                        </Button>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <InsertFromQuestionBankDialog
        open={showQuestionBankDialog}
        onOpenChange={setShowQuestionBankDialog}
        onConfirm={handleQuestionBankConfirm}
      />
    </>
  );
}

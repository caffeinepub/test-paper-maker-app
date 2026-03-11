import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { RichCellContent } from "../../lib/editor/richCellContent";
import type { CellContent, Question } from "../../state/mockData";
import { AutoGrowTextarea } from "../editor/AutoGrowTextarea";
import { RichCellEditor } from "../editor/RichCellEditor";

interface QuestionBlockEditorProps {
  question: Question;
  questionNumber: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  autoFocus?: boolean;
}

export function QuestionBlockEditor({
  question,
  questionNumber,
  onUpdate,
  onDelete,
  autoFocus,
}: QuestionBlockEditorProps) {
  const firstInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (autoFocus && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const renderQuestionTypeEditor = () => {
    switch (question.questionType) {
      case "mcq":
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Options</Label>
            {Array.from((question.mcqOptions?.options ?? []).entries()).map(
              ([idx, option]) => (
                <div key={`mcq-opt-${idx}`} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <Input
                    ref={
                      idx === 0 && !question.text
                        ? (firstInputRef as React.RefObject<HTMLInputElement>)
                        : undefined
                    }
                    value={option}
                    onChange={(e) => {
                      const newOptions = [
                        ...(question.mcqOptions?.options || []),
                      ];
                      newOptions[idx] = e.target.value;
                      onUpdate({ mcqOptions: { options: newOptions } });
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                </div>
              ),
            )}
          </div>
        );

      case "fill-in-blank":
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Blanks (Answers)
            </Label>
            {Array.from((question.fillInBlankData?.blanks ?? []).entries()).map(
              ([idx, blank]) => (
                <div key={`blank-${idx}`} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {idx + 1}.
                  </span>
                  <Input
                    ref={
                      idx === 0 && !question.text
                        ? (firstInputRef as React.RefObject<HTMLInputElement>)
                        : undefined
                    }
                    value={blank}
                    onChange={(e) => {
                      const newBlanks = [
                        ...(question.fillInBlankData?.blanks || []),
                      ];
                      newBlanks[idx] = e.target.value;
                      onUpdate({ fillInBlankData: { blanks: newBlanks } });
                    }}
                    placeholder={`Answer ${idx + 1}`}
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                  {idx > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newBlanks =
                          question.fillInBlankData?.blanks.filter(
                            (_, i) => i !== idx,
                          ) || [];
                        onUpdate({ fillInBlankData: { blanks: newBlanks } });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ),
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const newBlanks = [
                  ...(question.fillInBlankData?.blanks || []),
                  "",
                ];
                onUpdate({ fillInBlankData: { blanks: newBlanks } });
              }}
            >
              Add Blank
            </Button>
          </div>
        );

      case "true-false":
        return (
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <p className="text-sm text-muted-foreground">
              Students will answer True or False
            </p>
          </div>
        );

      case "match-pairs": {
        // Normalize pairs to rich content
        const pairs = question.matchPairsData?.pairs || [];

        return (
          <div
            className="space-y-2"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Label className="text-xs text-muted-foreground">Match Pairs</Label>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-2 gap-4 min-w-[500px]">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Column A</Label>
                  {Array.from(pairs.entries()).map(([idx, pair]) => (
                    <div
                      key={`left-${idx}`}
                      className="border border-border rounded p-2"
                    >
                      <RichCellEditor
                        value={pair.left as CellContent}
                        onChange={(content: RichCellContent) => {
                          const newPairs = [...pairs];
                          newPairs[idx] = {
                            ...newPairs[idx],
                            left: content as CellContent,
                          };
                          onUpdate({ matchPairsData: { pairs: newPairs } });
                        }}
                        placeholder={`Item ${idx + 1}`}
                        autoFocus={idx === 0 && !question.text && autoFocus}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Column B</Label>
                  {Array.from(pairs.entries()).map(([idx, pair]) => (
                    <div
                      key={`right-${idx}`}
                      className="border border-border rounded p-2"
                    >
                      <RichCellEditor
                        value={pair.right as CellContent}
                        onChange={(content: RichCellContent) => {
                          const newPairs = [...pairs];
                          newPairs[idx] = {
                            ...newPairs[idx],
                            right: content as CellContent,
                          };
                          onUpdate({ matchPairsData: { pairs: newPairs } });
                        }}
                        placeholder={`Match ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const newPairs = [...pairs, { left: "", right: "" }];
                  onUpdate({ matchPairsData: { pairs: newPairs } });
                }}
              >
                Add Pair
              </Button>
              {pairs.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newPairs = pairs.slice(0, -1);
                    onUpdate({ matchPairsData: { pairs: newPairs } });
                  }}
                >
                  Remove Last
                </Button>
              )}
            </div>
          </div>
        );
      }

      case "table": {
        const rows = question.tableData?.rows || 2;
        const cols = question.tableData?.cols || 2;
        const cells =
          question.tableData?.cells ||
          Array(rows)
            .fill(null)
            .map(() => Array(cols).fill(""));
        const columnHeaders =
          question.tableData?.columnHeaders ||
          Array(cols)
            .fill(null)
            .map((_, i) => `Column ${String.fromCharCode(65 + i)}`);

        return (
          <div
            className="space-y-2"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Label className="text-xs text-muted-foreground">Table</Label>
            <div className="overflow-x-auto">
              <table className="equal-width-table table-dark-borders">
                <thead>
                  <tr>
                    {Array.from(columnHeaders.entries()).map(
                      ([colIdx, header]) => (
                        <th
                          key={`col-header-${colIdx}`}
                          className="border-2 border-foreground/60 bg-muted/30 p-2"
                          style={{ width: `${100 / cols}%` }}
                        >
                          <Input
                            value={header}
                            onChange={(e) => {
                              const newHeaders = [...columnHeaders];
                              newHeaders[colIdx] = e.target.value;
                              onUpdate({
                                tableData: {
                                  rows,
                                  cols,
                                  cells,
                                  columnHeaders: newHeaders,
                                },
                              });
                            }}
                            placeholder={`Column ${String.fromCharCode(65 + colIdx)}`}
                            className="h-8 border-0 bg-transparent text-center font-semibold"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(cells.entries()).map(([rowIdx, row]) => (
                    <tr key={`row-${rowIdx}`}>
                      {Array.from(row.entries()).map(([colIdx, cell]) => (
                        <td
                          key={`cell-${rowIdx}-${colIdx}`}
                          className="border-2 border-foreground/60 p-1"
                          style={{ width: `${100 / cols}%` }}
                        >
                          <RichCellEditor
                            value={cell as CellContent}
                            onChange={(content: RichCellContent) => {
                              const newCells = cells.map((r) => [...r]);
                              newCells[rowIdx][colIdx] = content as CellContent;
                              onUpdate({
                                tableData: {
                                  rows,
                                  cols,
                                  cells: newCells,
                                  columnHeaders,
                                },
                              });
                            }}
                            placeholder={`R${rowIdx + 1}C${colIdx + 1}`}
                            autoFocus={
                              rowIdx === 0 &&
                              colIdx === 0 &&
                              !question.text &&
                              autoFocus
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const newCells = [...cells, Array(cols).fill("")];
                  onUpdate({
                    tableData: {
                      rows: rows + 1,
                      cols,
                      cells: newCells,
                      columnHeaders,
                    },
                  });
                }}
              >
                Add Row
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const newCells = cells.map((row) => [...row, ""]);
                  const newHeaders = [
                    ...columnHeaders,
                    `Column ${String.fromCharCode(65 + cols)}`,
                  ];
                  onUpdate({
                    tableData: {
                      rows,
                      cols: cols + 1,
                      cells: newCells,
                      columnHeaders: newHeaders,
                    },
                  });
                }}
              >
                Add Column
              </Button>
            </div>
          </div>
        );
      }
      case "long-answer":
        return (
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <p className="text-sm text-muted-foreground">
              Students will write a long/detailed answer (lines will appear on
              the printed paper)
            </p>
          </div>
        );

      case "numerical":
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Unit (Optional)
            </Label>
            <Input
              value={question.numericalData?.unit || ""}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate({ numericalData: { unit: e.target.value } });
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="e.g. m/s, kg, cm"
              className="max-w-[180px]"
            />
          </div>
        );

      case "assertion-reason":
        return (
          <div
            className="space-y-3"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">
                Assertion (A)
              </Label>
              <AutoGrowTextarea
                value={question.assertionReasonData?.assertion || ""}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdate({
                    assertionReasonData: {
                      assertion: e.target.value,
                      reason: question.assertionReasonData?.reason || "",
                    },
                  });
                }}
                placeholder="Enter assertion statement..."
                className="resize-none border-border text-sm"
                minRows={2}
                maxRows={4}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">
                Reason (R)
              </Label>
              <AutoGrowTextarea
                value={question.assertionReasonData?.reason || ""}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdate({
                    assertionReasonData: {
                      assertion: question.assertionReasonData?.assertion || "",
                      reason: e.target.value,
                    },
                  });
                }}
                placeholder="Enter reason statement..."
                className="resize-none border-border text-sm"
                minRows={2}
                maxRows={4}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <p className="text-xs text-muted-foreground italic">
              Students choose: A and R both true, R explains A / A true R false
              / A false R true / Both false
            </p>
          </div>
        );

      case "case-based":
        return (
          <div
            className="space-y-3"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground">
                Passage / Case Study Text
              </Label>
              <AutoGrowTextarea
                value={question.caseBasedData?.passage || ""}
                onChange={(e) => {
                  e.stopPropagation();
                  onUpdate({
                    caseBasedData: {
                      passage: e.target.value,
                      subQuestions: question.caseBasedData?.subQuestions || [
                        "",
                      ],
                    },
                  });
                }}
                placeholder="Enter the passage or case study text..."
                className="resize-none border-border text-sm"
                minRows={3}
                maxRows={8}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">
                Sub-Questions
              </Label>
              {(question.caseBasedData?.subQuestions || [""]).map((sq, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: sub-questions don't have stable IDs
                <div key={`sq-${idx}`} className="flex items-start gap-2">
                  <span className="mt-2 text-sm font-medium text-muted-foreground shrink-0">
                    {idx + 1}.
                  </span>
                  <Input
                    value={sq}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newSqs = [
                        ...(question.caseBasedData?.subQuestions || [""]),
                      ];
                      newSqs[idx] = e.target.value;
                      onUpdate({
                        caseBasedData: {
                          passage: question.caseBasedData?.passage || "",
                          subQuestions: newSqs,
                        },
                      });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    placeholder={`Sub-question ${idx + 1}`}
                    className="flex-1"
                  />
                  {idx > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newSqs = (
                          question.caseBasedData?.subQuestions || []
                        ).filter((_, i) => i !== idx);
                        onUpdate({
                          caseBasedData: {
                            passage: question.caseBasedData?.passage || "",
                            subQuestions: newSqs,
                          },
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const newSqs = [
                    ...(question.caseBasedData?.subQuestions || [""]),
                    "",
                  ];
                  onUpdate({
                    caseBasedData: {
                      passage: question.caseBasedData?.passage || "",
                      subQuestions: newSqs,
                    },
                  });
                }}
              >
                Add Sub-Question
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <p className="text-sm text-muted-foreground">
              Students will write a short answer
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className="space-y-3"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">
              {questionNumber}.
            </span>
            <AutoGrowTextarea
              ref={firstInputRef as React.RefObject<HTMLTextAreaElement>}
              value={question.text}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate({ text: e.target.value });
              }}
              placeholder="Enter question text..."
              className="flex-1 resize-none border-0 p-0 text-sm focus:ring-0"
              minRows={1}
              maxRows={6}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
          {question.imageAttachment && (
            <div className="mt-2 block w-full">
              <img
                src={question.imageAttachment}
                alt="Question attachment"
                className="block max-h-48 max-w-full rounded border border-border object-contain"
              />
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {renderQuestionTypeEditor()}

      {/* Marks input + type info row */}
      <div className="flex flex-wrap items-center gap-3 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span>Type: {question.questionType}</span>
        {question.difficulty && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              question.difficulty === "easy"
                ? "bg-green-100 text-green-700"
                : question.difficulty === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {question.difficulty.charAt(0).toUpperCase() +
              question.difficulty.slice(1)}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <Label className="text-xs font-medium text-foreground">Marks:</Label>
          <Input
            type="number"
            value={question.marks}
            min={0}
            max={100}
            onChange={(e) => {
              e.stopPropagation();
              const val = Number.parseInt(e.target.value, 10);
              if (!Number.isNaN(val) && val >= 0 && val <= 100) {
                onUpdate({ marks: val });
              }
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="h-7 w-16 border-primary/40 px-1 py-0 text-xs font-semibold text-foreground"
          />
        </div>
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {question.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible Answer section */}
      <div className="border-t border-dashed border-muted-foreground/20 pt-2">
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            setShowAnswer((v) => !v);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {showAnswer ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          Answer (optional)
        </button>

        {showAnswer && (
          <div
            className="mt-2 space-y-2"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {question.questionType === "mcq" &&
            (question.mcqOptions?.options?.length ?? 0) > 0 ? (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Correct Option
                </Label>
                <Select
                  value={
                    question.mcqOptions?.correctAnswer !== undefined
                      ? String(question.mcqOptions.correctAnswer)
                      : ""
                  }
                  onValueChange={(val) => {
                    onUpdate({
                      mcqOptions: {
                        ...(question.mcqOptions || { options: [] }),
                        correctAnswer: val ? Number(val) : undefined,
                      },
                    });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select correct option (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {(question.mcqOptions?.options || []).map((opt, idx) => (
                      <SelectItem
                        key={`mcq-correct-opt-${String.fromCharCode(65 + idx)}`}
                        value={String(idx)}
                      >
                        {String.fromCharCode(65 + idx)}
                        {opt ? `. ${opt.slice(0, 40)}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : question.questionType === "true-false" ? (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Correct Answer
                </Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={
                      question.trueFalseData?.correctAnswer === true
                        ? "default"
                        : "outline"
                    }
                    className="h-7 px-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({
                        trueFalseData: { correctAnswer: true },
                      });
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    True
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      question.trueFalseData?.correctAnswer === false
                        ? "default"
                        : "outline"
                    }
                    className="h-7 px-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({
                        trueFalseData: { correctAnswer: false },
                      });
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    False
                  </Button>
                  {question.trueFalseData?.correctAnswer !== undefined && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdate({ trueFalseData: {} });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Model Answer
                </Label>
                <Input
                  value={question.answer || ""}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdate({ answer: e.target.value || undefined });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder="Answer (optional) — leave blank to skip"
                  className="h-8 text-xs"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

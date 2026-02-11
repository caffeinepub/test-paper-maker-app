import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { Question, CellContent } from '../../state/mockData';
import { AutoGrowTextarea } from '../editor/AutoGrowTextarea';
import { RichCellEditor } from '../editor/RichCellEditor';
import { RichCellContent } from '../../lib/editor/richCellContent';

interface QuestionBlockEditorProps {
  question: Question;
  questionNumber: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  autoFocus?: boolean;
}

export function QuestionBlockEditor({ question, questionNumber, onUpdate, onDelete, autoFocus }: QuestionBlockEditorProps) {
  const firstInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const renderQuestionTypeEditor = () => {
    switch (question.questionType) {
      case 'mcq':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Options</Label>
            {question.mcqOptions?.options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                <Input
                  ref={idx === 0 && !question.text ? (firstInputRef as React.RefObject<HTMLInputElement>) : undefined}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.mcqOptions?.options || [])];
                    newOptions[idx] = e.target.value;
                    onUpdate({ mcqOptions: { options: newOptions } });
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
            ))}
          </div>
        );

      case 'fill-in-blank':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Blanks (Answers)</Label>
            {question.fillInBlankData?.blanks.map((blank, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">{idx + 1}.</span>
                <Input
                  ref={idx === 0 && !question.text ? (firstInputRef as React.RefObject<HTMLInputElement>) : undefined}
                  value={blank}
                  onChange={(e) => {
                    const newBlanks = [...(question.fillInBlankData?.blanks || [])];
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
                      const newBlanks = question.fillInBlankData?.blanks.filter((_, i) => i !== idx) || [];
                      onUpdate({ fillInBlankData: { blanks: newBlanks } });
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
                const newBlanks = [...(question.fillInBlankData?.blanks || []), ''];
                onUpdate({ fillInBlankData: { blanks: newBlanks } });
              }}
            >
              Add Blank
            </Button>
          </div>
        );

      case 'true-false':
        return (
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <p className="text-sm text-muted-foreground">Students will answer True or False</p>
          </div>
        );

      case 'match-pairs':
        // Normalize pairs to rich content
        const pairs = question.matchPairsData?.pairs || [];
        
        return (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <Label className="text-xs text-muted-foreground">Match Pairs</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Column A</Label>
                {pairs.map((pair, idx) => (
                  <div key={`left-${idx}`} className="border border-border rounded p-2">
                    <RichCellEditor
                      value={pair.left as CellContent}
                      onChange={(content: RichCellContent) => {
                        const newPairs = [...pairs];
                        newPairs[idx] = { ...newPairs[idx], left: content as CellContent };
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
                {pairs.map((pair, idx) => (
                  <div key={`right-${idx}`} className="border border-border rounded p-2">
                    <RichCellEditor
                      value={pair.right as CellContent}
                      onChange={(content: RichCellContent) => {
                        const newPairs = [...pairs];
                        newPairs[idx] = { ...newPairs[idx], right: content as CellContent };
                        onUpdate({ matchPairsData: { pairs: newPairs } });
                      }}
                      placeholder={`Match ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const newPairs = [...pairs, { left: '', right: '' }];
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

      case 'table':
        const rows = question.tableData?.rows || 2;
        const cols = question.tableData?.cols || 2;
        const cells = question.tableData?.cells || Array(rows).fill(null).map(() => Array(cols).fill(''));

        return (
          <div className="space-y-2" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <Label className="text-xs text-muted-foreground">Table</Label>
            <div className="overflow-x-auto">
              <table className="equal-width-table border border-border">
                <tbody>
                  {cells.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, colIdx) => (
                        <td
                          key={colIdx}
                          className="border border-border p-1"
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
                                },
                              });
                            }}
                            placeholder={`R${rowIdx + 1}C${colIdx + 1}`}
                            autoFocus={rowIdx === 0 && colIdx === 0 && !question.text && autoFocus}
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
                  const newCells = [...cells, Array(cols).fill('')];
                  onUpdate({
                    tableData: {
                      rows: rows + 1,
                      cols,
                      cells: newCells,
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
                  const newCells = cells.map((row) => [...row, '']);
                  onUpdate({
                    tableData: {
                      rows,
                      cols: cols + 1,
                      cells: newCells,
                    },
                  });
                }}
              >
                Add Column
              </Button>
            </div>
          </div>
        );

      case 'short-answer':
      default:
        return (
          <div className="rounded-md border border-border bg-muted/20 p-3">
            <p className="text-sm text-muted-foreground">Students will write a short answer</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">{questionNumber}.</span>
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
            <div className="mt-2">
              <img
                src={question.imageAttachment}
                alt="Question attachment"
                className="max-h-48 rounded border border-border object-contain"
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

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Type: {question.questionType}</span>
        <span>Marks: {question.marks}</span>
      </div>
    </div>
  );
}


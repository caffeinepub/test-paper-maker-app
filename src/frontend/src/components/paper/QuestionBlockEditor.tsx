import { useState, useEffect, useRef } from 'react';
import { Question } from '../../state/mockData';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, X } from 'lucide-react';

interface QuestionBlockEditorProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  autoFocus?: boolean;
  onAutoFocusComplete?: () => void;
}

export function QuestionBlockEditor({
  question,
  onUpdate,
  onDelete,
  autoFocus,
  onAutoFocusComplete,
}: QuestionBlockEditorProps) {
  const firstInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && firstInputRef.current) {
      firstInputRef.current.focus();
      firstInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onAutoFocusComplete?.();
    }
  }, [autoFocus, onAutoFocusComplete]);

  const renderEditor = () => {
    switch (question.questionType) {
      case 'mcq':
        return (
          <div className="space-y-3">
            <Textarea
              ref={firstInputRef as React.RefObject<HTMLTextAreaElement>}
              placeholder="Enter question text..."
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="min-h-[80px]"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">Options:</p>
              {question.mcqOptions?.options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm font-medium shrink-0">
                    {String.fromCharCode(97 + idx)})
                  </span>
                  <Input
                    placeholder={`Option ${idx + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.mcqOptions?.options || [])];
                      newOptions[idx] = e.target.value;
                      onUpdate({ mcqOptions: { options: newOptions } });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'numerical':
        return (
          <Textarea
            ref={firstInputRef as React.RefObject<HTMLTextAreaElement>}
            placeholder="Enter numerical question..."
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="min-h-[80px]"
          />
        );

      case 'fill-in-blank':
        return (
          <div className="space-y-3">
            <Textarea
              ref={firstInputRef as React.RefObject<HTMLTextAreaElement>}
              placeholder="Enter question text..."
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="min-h-[80px]"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Blanks:</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newBlanks = [...(question.fillInBlankData?.blanks || []), ''];
                    onUpdate({ fillInBlankData: { blanks: newBlanks } });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Blank
                </Button>
              </div>
              {question.fillInBlankData?.blanks.map((blank, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm font-medium shrink-0">{idx + 1}.</span>
                  <Input
                    placeholder={`Blank ${idx + 1}`}
                    value={blank}
                    onChange={(e) => {
                      const newBlanks = [...(question.fillInBlankData?.blanks || [])];
                      newBlanks[idx] = e.target.value;
                      onUpdate({ fillInBlankData: { blanks: newBlanks } });
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const newBlanks = question.fillInBlankData?.blanks.filter((_, i) => i !== idx) || [];
                      onUpdate({ fillInBlankData: { blanks: newBlanks } });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'true-false':
        return (
          <Textarea
            ref={firstInputRef as React.RefObject<HTMLTextAreaElement>}
            placeholder="Enter true/false statement..."
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="min-h-[80px]"
          />
        );

      case 'match-pairs':
        return (
          <div className="space-y-3">
            <Textarea
              ref={firstInputRef as React.RefObject<HTMLTextAreaElement>}
              placeholder="Enter question text..."
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="min-h-[80px]"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Pairs:</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newPairs = [...(question.matchPairsData?.pairs || []), { left: '', right: '' }];
                    onUpdate({ matchPairsData: { pairs: newPairs } });
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Pair
                </Button>
              </div>
              {question.matchPairsData?.pairs.map((pair, idx) => (
                <div key={idx} className="space-y-2 rounded border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium shrink-0">Column A:</span>
                    <Input
                      placeholder={`Item ${idx + 1}`}
                      value={pair.left}
                      onChange={(e) => {
                        const newPairs = [...(question.matchPairsData?.pairs || [])];
                        newPairs[idx] = { ...newPairs[idx], left: e.target.value };
                        onUpdate({ matchPairsData: { pairs: newPairs } });
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium shrink-0">Column B:</span>
                    <Input
                      placeholder={`Item ${String.fromCharCode(97 + idx)}`}
                      value={pair.right}
                      onChange={(e) => {
                        const newPairs = [...(question.matchPairsData?.pairs || [])];
                        newPairs[idx] = { ...newPairs[idx], right: e.target.value };
                        onUpdate({ matchPairsData: { pairs: newPairs } });
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const newPairs = question.matchPairsData?.pairs.filter((_, i) => i !== idx) || [];
                        onUpdate({ matchPairsData: { pairs: newPairs } });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-3">
            <Textarea
              ref={firstInputRef as React.RefObject<HTMLTextAreaElement>}
              placeholder="Enter question text..."
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="min-h-[80px]"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Table:</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const tableData = question.tableData;
                      if (!tableData) return;
                      const newCells = [...tableData.cells, Array(tableData.cols).fill('')];
                      onUpdate({
                        tableData: {
                          rows: tableData.rows + 1,
                          cols: tableData.cols,
                          cells: newCells,
                        },
                      });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Row
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const tableData = question.tableData;
                      if (!tableData) return;
                      const newCells = tableData.cells.map((row) => [...row, '']);
                      onUpdate({
                        tableData: {
                          rows: tableData.rows,
                          cols: tableData.cols + 1,
                          cells: newCells,
                        },
                      });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Column
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <tbody>
                    {question.tableData?.cells.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="border border-border p-1">
                            <Input
                              value={cell}
                              onChange={(e) => {
                                const newCells = question.tableData?.cells.map((r, ri) =>
                                  ri === rowIdx
                                    ? r.map((c, ci) => (ci === cellIdx ? e.target.value : c))
                                    : r
                                ) || [];
                                onUpdate({
                                  tableData: {
                                    ...question.tableData!,
                                    cells: newCells,
                                  },
                                });
                              }}
                              className="h-8"
                            />
                          </td>
                        ))}
                        <td className="border-0 p-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            disabled={question.tableData!.rows <= 1}
                            onClick={() => {
                              const tableData = question.tableData;
                              if (!tableData || tableData.rows <= 1) return;
                              const newCells = tableData.cells.filter((_, i) => i !== rowIdx);
                              onUpdate({
                                tableData: {
                                  rows: tableData.rows - 1,
                                  cols: tableData.cols,
                                  cells: newCells,
                                },
                              });
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      {question.tableData?.cells[0]?.map((_, cellIdx) => (
                        <td key={cellIdx} className="border-0 p-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            disabled={question.tableData!.cols <= 1}
                            onClick={() => {
                              const tableData = question.tableData;
                              if (!tableData || tableData.cols <= 1) return;
                              const newCells = tableData.cells.map((row) =>
                                row.filter((_, i) => i !== cellIdx)
                              );
                              onUpdate({
                                tableData: {
                                  rows: tableData.rows,
                                  cols: tableData.cols - 1,
                                  cells: newCells,
                                },
                              });
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'short-answer':
      default:
        return (
          <Textarea
            ref={firstInputRef as React.RefObject<HTMLTextAreaElement>}
            placeholder="Enter question text..."
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="min-h-[80px]"
          />
        );
    }
  };

  return (
    <div className="space-y-3 rounded-lg border-2 border-primary bg-background p-4 print:hidden">
      {renderEditor()}
      
      {/* Show attached image in edit mode */}
      {question.imageAttachment && (
        <div className="relative">
          <img
            src={question.imageAttachment}
            alt="Question attachment"
            className="max-w-full h-auto rounded border border-border"
            style={{ maxHeight: '300px', objectFit: 'contain' }}
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={() => onUpdate({ imageAttachment: undefined })}
          >
            <X className="h-3 w-3 mr-1" />
            Remove Image
          </Button>
        </div>
      )}

      <div className="flex justify-end">
        <Button size="sm" variant="destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-3 w-3" />
          Delete Question
        </Button>
      </div>
    </div>
  );
}

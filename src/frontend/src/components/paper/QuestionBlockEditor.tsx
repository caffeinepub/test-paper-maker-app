import { useState, useEffect, useRef } from 'react';
import { Question } from '../../state/mockData';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, X } from 'lucide-react';
import { AutoGrowTextarea } from '../editor/AutoGrowTextarea';

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
              <div className="space-y-3">
                {question.matchPairsData?.pairs.map((pair, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3 rounded border border-border p-3">
                    <div className="space-y-1 min-w-0">
                      <label className="text-xs font-medium text-muted-foreground">Column A</label>
                      <AutoGrowTextarea
                        placeholder={`Item ${idx + 1}`}
                        value={pair.left}
                        onChange={(e) => {
                          const newPairs = [...(question.matchPairsData?.pairs || [])];
                          newPairs[idx] = { ...newPairs[idx], left: e.target.value };
                          onUpdate({ matchPairsData: { pairs: newPairs } });
                        }}
                        minRows={2}
                        maxRows={6}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <label className="text-xs font-medium text-muted-foreground">Column B</label>
                      <AutoGrowTextarea
                        placeholder={`Match ${idx + 1}`}
                        value={pair.right}
                        onChange={(e) => {
                          const newPairs = [...(question.matchPairsData?.pairs || [])];
                          newPairs[idx] = { ...newPairs[idx], right: e.target.value };
                          onUpdate({ matchPairsData: { pairs: newPairs } });
                        }}
                        minRows={2}
                        maxRows={6}
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newPairs = question.matchPairsData?.pairs.filter((_, i) => i !== idx) || [];
                          onUpdate({ matchPairsData: { pairs: newPairs } });
                        }}
                        className="print:hidden"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
                      const currentCells = question.tableData?.cells || [['', '']];
                      const newRow = new Array(currentCells[0]?.length || 2).fill('');
                      const newCells = [...currentCells, newRow];
                      onUpdate({ 
                        tableData: { 
                          rows: newCells.length,
                          cols: newCells[0]?.length || 2,
                          cells: newCells 
                        } 
                      });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Row
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentCells = question.tableData?.cells || [['', '']];
                      const newCells = currentCells.map(row => [...row, '']);
                      onUpdate({ 
                        tableData: { 
                          rows: newCells.length,
                          cols: newCells[0]?.length || 2,
                          cells: newCells 
                        } 
                      });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Column
                  </Button>
                </div>
              </div>
              {question.tableData && question.tableData.cells.length > 0 && (
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {question.tableData.cells.map((row, rowIdx) => (
                      <div key={rowIdx} className="space-y-2 mb-3">
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
                          {row.map((cell, cellIdx) => (
                            <div key={cellIdx} className="min-w-0">
                              <AutoGrowTextarea
                                placeholder={`R${rowIdx + 1}C${cellIdx + 1}`}
                                value={cell}
                                onChange={(e) => {
                                  const newCells = question.tableData?.cells.map(r => [...r]) || [];
                                  newCells[rowIdx][cellIdx] = e.target.value;
                                  onUpdate({ 
                                    tableData: { 
                                      rows: newCells.length,
                                      cols: newCells[0]?.length || 2,
                                      cells: newCells 
                                    } 
                                  });
                                }}
                                minRows={2}
                                maxRows={6}
                                className="text-sm"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 print:hidden">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newCells = question.tableData?.cells.filter((_, i) => i !== rowIdx) || [];
                              if (newCells.length > 0) {
                                onUpdate({ 
                                  tableData: { 
                                    rows: newCells.length,
                                    cols: newCells[0]?.length || 2,
                                    cells: newCells 
                                  } 
                                });
                              }
                            }}
                            disabled={(question.tableData?.cells.length || 0) <= 1}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete Row
                          </Button>
                          {rowIdx === 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newCells = question.tableData?.cells.map(r => r.slice(0, -1)) || [];
                                if (newCells[0]?.length > 1) {
                                  onUpdate({ 
                                    tableData: { 
                                      rows: newCells.length,
                                      cols: newCells[0]?.length || 1,
                                      cells: newCells 
                                    } 
                                  });
                                }
                              }}
                              disabled={(question.tableData?.cells[0]?.length || 0) <= 1}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete Last Column
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
    <div className="space-y-3 p-4 rounded-lg border-2 border-dashed border-primary/30 bg-muted/30">
      {renderEditor()}

      {/* Image attachment display */}
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
            onClick={() => onUpdate({ imageAttachment: undefined })}
            className="absolute top-2 right-2 print:hidden"
          >
            <X className="h-3 w-3 mr-1" />
            Remove Image
          </Button>
        </div>
      )}

      <div className="flex justify-end gap-2 print:hidden">
        <Button size="sm" variant="destructive" onClick={onDelete}>
          <Trash2 className="h-3 w-3 mr-1" />
          Delete Question
        </Button>
      </div>
    </div>
  );
}

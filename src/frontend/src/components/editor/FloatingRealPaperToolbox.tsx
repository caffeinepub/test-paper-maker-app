import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paper, QuestionType } from '../../state/mockData';
import { useDraggableFloatingPanel } from '../../hooks/useDraggableFloatingPanel';
import {
  FileText,
  CheckSquare,
  Type,
  ToggleLeft,
  Link2,
  Table as TableIcon,
  Plus,
} from 'lucide-react';

interface FloatingRealPaperToolboxProps {
  paper: Paper;
  selectedSectionId: string | null;
  selectedHeadingId: string | null;
  onSelectSection: (sectionId: string) => void;
  onSelectHeading: (headingId: string) => void;
  onAddQuestion: (sectionId: string, headingId: string, questionType: QuestionType) => void;
  onAddHeading?: () => void;
}

export function FloatingRealPaperToolbox({
  paper,
  selectedSectionId,
  selectedHeadingId,
  onSelectSection,
  onSelectHeading,
  onAddQuestion,
  onAddHeading,
}: FloatingRealPaperToolboxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { position, isDragging, handleMouseDown, handleTouchStart } = useDraggableFloatingPanel({
    initialPosition: { x: window.innerWidth - 96, y: 100 },
    storageKey: 'desktop-fab-toolbox-position',
    constrainToViewport: true,
    elementSize: { width: 64, height: 64 },
  });

  const questionTypes: Array<{ type: QuestionType; label: string; icon: any }> = [
    { type: 'short-answer', label: 'Short Answer', icon: FileText },
    { type: 'mcq', label: 'MCQ (4 Options)', icon: CheckSquare },
    { type: 'fill-in-blank', label: 'Fill in the Blank', icon: Type },
    { type: 'true-false', label: 'True/False', icon: ToggleLeft },
    { type: 'match-pairs', label: 'Match Pairs', icon: Link2 },
    { type: 'table', label: 'Table', icon: TableIcon },
  ];

  const selectedSection = paper.sections.find((s) => s.id === selectedSectionId);
  const availableHeadings = selectedSection?.headings || [];

  const handleFabClick = () => {
    if (!isDragging) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      ref={fabRef}
      data-coachmark="floating-toolbox"
      className="fixed z-50 print:hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      {/* Expanded Panel */}
      {isExpanded && (
        <Card
          ref={cardRef}
          className="absolute top-20 right-0 w-[320px] shadow-2xl max-h-[calc(100vh-140px)] overflow-hidden flex flex-col"
        >
          <CardHeader>
            <CardTitle className="text-lg">Question Toolbox</CardTitle>
            <CardDescription className="text-xs">Select section & heading, then add questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto flex-1">
            {/* Section Selector */}
            <div>
              <p className="mb-2 text-sm font-medium">Select Section:</p>
              <ScrollArea className="h-[120px] rounded-md border">
                <div className="space-y-1 p-2">
                  {paper.sections.map((section, idx) => (
                    <Button
                      key={section.id}
                      variant={selectedSectionId === section.id ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onSelectSection(section.id)}
                    >
                      Section {String.fromCharCode(65 + idx)} ({section.marks} mark
                      {section.marks > 1 ? 's' : ''})
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Heading Selector */}
            {selectedSectionId && (
              <>
                <div>
                  <p className="mb-2 text-sm font-medium">Select Heading:</p>
                  {availableHeadings.length > 0 ? (
                    <ScrollArea className="h-[100px] rounded-md border">
                      <div className="space-y-1 p-2">
                        {availableHeadings.map((heading) => (
                          <Button
                            key={heading.id}
                            variant={selectedHeadingId === heading.id ? 'default' : 'ghost'}
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => onSelectHeading(heading.id)}
                          >
                            {heading.title}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No headings yet. Add one below.</p>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Add Heading Button */}
            {onAddHeading && (
              <>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={onAddHeading}
                    disabled={!selectedSectionId}
                  >
                    <Plus className="h-4 w-4" />
                    Add Question Heading
                  </Button>
                </div>
                <Separator />
              </>
            )}

            {/* Question Type Buttons - Pill Style */}
            <div>
              <p className="mb-3 text-sm font-medium">Add Question Type:</p>
              <div className="flex flex-wrap gap-2">
                {questionTypes.map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4 py-2 h-auto gap-2"
                    onClick={() => selectedSectionId && selectedHeadingId && onAddQuestion(selectedSectionId, selectedHeadingId, type)}
                    disabled={!selectedSectionId || !selectedHeadingId}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {!selectedHeadingId && selectedSectionId && (
              <p className="text-xs text-muted-foreground">
                Select or add a heading above to add questions
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main FAB Button */}
      <button
        onClick={handleFabClick}
        onMouseDown={(e) => handleMouseDown(e, fabRef.current)}
        onTouchStart={(e) => handleTouchStart(e, fabRef.current)}
        className="flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 active:scale-95 border-2 border-white"
        style={{
          background: 'white',
        }}
        aria-label={isExpanded ? 'Close toolbox' : 'Open toolbox'}
      >
        <img
          src={isExpanded ? '/assets/generated/fab-x-rainbow.dim_96x96.png' : '/assets/generated/fab-plus-rainbow.dim_96x96.png'}
          alt={isExpanded ? 'Close' : 'Add'}
          className="h-9 w-9 transition-opacity duration-300"
          style={{
            opacity: 1,
          }}
        />
      </button>
    </div>
  );
}

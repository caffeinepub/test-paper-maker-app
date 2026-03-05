import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckSquare,
  FileText,
  Link2,
  Plus,
  Table as TableIcon,
  ToggleLeft,
  Type,
} from "lucide-react";
import { useRef, useState } from "react";
import { useDraggableFloatingPanel } from "../../hooks/useDraggableFloatingPanel";
import type { Paper, QuestionType } from "../../state/mockData";

interface MobileRealPaperFabToolboxProps {
  paper: Paper;
  selectedSectionId: string | null;
  selectedHeadingId: string | null;
  onSelectSection: (sectionId: string) => void;
  onSelectHeading: (headingId: string) => void;
  onAddQuestion: (
    sectionId: string,
    headingId: string,
    questionType: QuestionType,
  ) => void;
  onAddHeading?: () => void;
}

export function MobileRealPaperFabToolbox({
  paper,
  selectedSectionId,
  selectedHeadingId,
  onSelectSection,
  onSelectHeading,
  onAddQuestion,
  onAddHeading,
}: MobileRealPaperFabToolboxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  const { position, isDragging, handleMouseDown, handleTouchStart } =
    useDraggableFloatingPanel({
      initialPosition: {
        x: window.innerWidth - 80,
        y: window.innerHeight - 120,
      },
      storageKey: "mobile-fab-toolbox-position",
      constrainToViewport: true,
      elementSize: { width: 64, height: 64 },
    });

  const questionTypes: Array<{ type: QuestionType; label: string; icon: any }> =
    [
      { type: "short-answer", label: "Short Answer", icon: FileText },
      { type: "mcq", label: "MCQ (4 Options)", icon: CheckSquare },
      { type: "fill-in-blank", label: "Fill in the Blank", icon: Type },
      { type: "true-false", label: "True/False", icon: ToggleLeft },
      { type: "match-pairs", label: "Match Pairs", icon: Link2 },
      { type: "table", label: "Table", icon: TableIcon },
    ];

  const selectedSection = paper.sections.find(
    (s) => s.id === selectedSectionId,
  );
  const availableHeadings = selectedSection?.headings || [];

  const handleFabClick = () => {
    if (!isDragging) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/50 print:hidden"
          onClick={() => setIsExpanded(false)}
          onKeyDown={(e) => e.key === "Escape" && setIsExpanded(false)}
          role="button"
          tabIndex={0}
          aria-label="Close toolbox"
        />
      )}

      {/* Expanded Card */}
      {isExpanded && (
        <Card className="fixed bottom-20 left-4 right-4 z-50 max-h-[70vh] overflow-hidden flex flex-col print:hidden">
          <CardContent className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Section Selector */}
            <div>
              <p className="mb-2 text-sm font-medium">Select Section:</p>
              <div className="space-y-2">
                {paper.sections.map((section, idx) => (
                  <Button
                    key={section.id}
                    variant={
                      selectedSectionId === section.id ? "default" : "outline"
                    }
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onSelectSection(section.id)}
                  >
                    Section {String.fromCharCode(65 + idx)} ({section.marks}{" "}
                    mark
                    {section.marks > 1 ? "s" : ""})
                  </Button>
                ))}
              </div>
            </div>

            {/* Heading Selector */}
            {selectedSectionId && (
              <div>
                <p className="mb-2 text-sm font-medium">Select Heading:</p>
                {availableHeadings.length > 0 ? (
                  <div className="space-y-2">
                    {availableHeadings.map((heading) => (
                      <Button
                        key={heading.id}
                        variant={
                          selectedHeadingId === heading.id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => onSelectHeading(heading.id)}
                      >
                        {heading.title}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No headings yet. Add one below.
                  </p>
                )}
              </div>
            )}

            {/* Add Heading Button */}
            {onAddHeading && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setIsExpanded(false);
                  onAddHeading();
                }}
                disabled={!selectedSectionId}
              >
                <Plus className="h-4 w-4" />
                Add Question Heading
              </Button>
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
                    onClick={() => {
                      if (selectedSectionId && selectedHeadingId) {
                        onAddQuestion(
                          selectedSectionId,
                          selectedHeadingId,
                          type,
                        );
                        setIsExpanded(false);
                      }
                    }}
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

      {/* FAB Button */}
      <div
        ref={fabRef}
        data-coachmark="floating-toolbox-mobile"
        className="fixed z-50 print:hidden"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <button
          type="button"
          onClick={handleFabClick}
          onMouseDown={(e) => handleMouseDown(e, fabRef.current)}
          onTouchStart={(e) => handleTouchStart(e, fabRef.current)}
          className="flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-300 active:scale-95 border-2 border-white"
          style={{
            background: "white",
          }}
          aria-label={isExpanded ? "Close toolbox" : "Open toolbox"}
        >
          <img
            src={
              isExpanded
                ? "/assets/generated/fab-x-rainbow.dim_96x96.png"
                : "/assets/generated/fab-plus-rainbow.dim_96x96.png"
            }
            alt={isExpanded ? "Close" : "Add"}
            className="h-9 w-9 transition-opacity duration-300"
            style={{
              opacity: 1,
            }}
          />
        </button>
      </div>
    </>
  );
}

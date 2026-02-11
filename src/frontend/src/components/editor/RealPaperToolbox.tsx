import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paper, QuestionType } from '../../state/mockData';
import {
  FileText,
  CheckSquare,
  Type,
  ToggleLeft,
  Link2,
  Table as TableIcon,
} from 'lucide-react';

interface RealPaperToolboxProps {
  paper: Paper;
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onAddQuestion: (sectionId: string, questionType: QuestionType) => void;
}

export function RealPaperToolbox({
  paper,
  selectedSectionId,
  onSelectSection,
  onAddQuestion,
}: RealPaperToolboxProps) {
  const questionTypes: Array<{ type: QuestionType; label: string; icon: any }> = [
    { type: 'short-answer', label: 'Short Answer', icon: FileText },
    { type: 'mcq', label: 'MCQ (4 Options)', icon: CheckSquare },
    { type: 'fill-in-blank', label: 'Fill in the Blank', icon: Type },
    { type: 'true-false', label: 'True/False', icon: ToggleLeft },
    { type: 'match-pairs', label: 'Match Pairs', icon: Link2 },
    { type: 'table', label: 'Table', icon: TableIcon },
  ];

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Question Toolbox</CardTitle>
        <CardDescription>Add questions to your paper</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {/* Question Type Buttons */}
        <div>
          <p className="mb-2 text-sm font-medium">Add Question Type:</p>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {questionTypes.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => selectedSectionId && onAddQuestion(selectedSectionId, type)}
                  disabled={!selectedSectionId}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {!selectedSectionId && (
          <p className="text-xs text-muted-foreground">
            Select a section above to add questions
          </p>
        )}
      </CardContent>
    </Card>
  );
}

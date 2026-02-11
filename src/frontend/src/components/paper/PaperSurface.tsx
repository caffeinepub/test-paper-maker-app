import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Paper, Question } from '../../state/mockData';
import { QuestionBlockEditor } from './QuestionBlockEditor';
import { PaperRenderer } from './PaperRenderer';
import { useMockStore } from '../../state/mockStore';
import { setSectionInsertContext } from '../../lib/editor/sectionInsertContext';
import { BookOpen, Sparkles } from 'lucide-react';

interface PaperSurfaceProps {
  paper: Paper;
  isEditable?: boolean;
  selectedQuestionId?: string | null;
  onSelectQuestion?: (questionId: string | null) => void;
  onUpdateQuestion?: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
  onDeleteQuestion?: (sectionId: string, questionId: string) => void;
  autoFocusQuestionId?: string | null;
  onAutoFocusComplete?: () => void;
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
}: PaperSurfaceProps) {
  const navigate = useNavigate();
  const { profile } = useMockStore();
  const autoFocusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocusQuestionId && autoFocusRef.current) {
      // Scroll into view
      autoFocusRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Find the first editable input/textarea and focus it
      const firstInput = autoFocusRef.current.querySelector('textarea, input[type="text"]') as HTMLTextAreaElement | HTMLInputElement;
      if (firstInput) {
        setTimeout(() => {
          firstInput.focus();
        }, 300);
      }
      
      // Clear the auto-focus flag
      if (onAutoFocusComplete) {
        setTimeout(() => {
          onAutoFocusComplete();
        }, 500);
      }
    }
  }, [autoFocusQuestionId, onAutoFocusComplete]);

  const handleAddFromBank = (sectionId: string) => {
    setSectionInsertContext({
      paperId: paper.id,
      sectionId,
      source: 'question-bank',
    });
    navigate({ to: '/question-bank', search: { tab: 'personal' } });
  };

  const handleAddWithAI = (sectionId: string) => {
    setSectionInsertContext({
      paperId: paper.id,
      sectionId,
      source: 'ai',
    });
    navigate({ to: '/ai' });
  };

  // Calculate total questions across all sections
  const totalQuestions = paper.sections.reduce((sum, section) => sum + section.questions.length, 0);

  return (
    <Card className="paper-container w-full max-w-[210mm] bg-white text-black shadow-2xl print:max-w-none print:border-0 print:shadow-none">
      <div className="min-h-[297mm] p-8 print:min-h-0">
        {/* Modern Header Card */}
        <div className="paper-header-card mb-6 rounded-xl border-2 border-border bg-gradient-to-br from-background to-muted/30 p-6 shadow-md">
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {profile.instituteName || '[Institute Name]'}
            </h2>
            <h3 className="text-xl font-semibold text-foreground">{paper.title || '[Paper Title]'}</h3>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-foreground">Board:</span> {paper.board}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-foreground">Standard:</span> {paper.standard || '-'}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-foreground">Total Marks:</span> {paper.totalMarks}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-foreground">Time:</span> {paper.timeMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-foreground">Total Questions:</span> {totalQuestions}
              </span>
            </div>
          </div>
        </div>

        {/* Stylish Separator */}
        <div className="paper-separator mb-8 flex items-center justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
          <div className="mx-4 h-1.5 w-1.5 rounded-full bg-border"></div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
        </div>

        {/* Paper Body */}
        <div className="space-y-8">
          {paper.sections.map((section, idx) => {
            const headings = section.headings || [];
            
            return (
              <div key={section.id} className="space-y-4">
                {/* Section Header - Only Section Letter */}
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-foreground">
                    Section {String.fromCharCode(65 + idx)}
                  </h4>
                </div>

                {/* Question Headings */}
                {headings.length === 0 ? (
                  <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center">
                    <p className="text-sm text-muted-foreground italic">
                      No question headings yet. {isEditable && 'Add a question heading to organize questions in this section.'}
                    </p>
                  </div>
                ) : (
                  headings.map((heading) => {
                    const headingQuestions = section.questions.filter((q) => q.headingId === heading.id);
                    const totalMarks = headingQuestions.length * section.marks;
                    const displayCount = Math.max(headingQuestions.length, heading.plannedQuestionCount);

                    return (
                      <div key={heading.id} className="space-y-3">
                        {/* Heading Title with Marks Info */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-foreground">•</span>
                          <h5 className="text-base font-medium text-foreground">
                            {heading.title}
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({section.marks} mark{section.marks > 1 ? 's' : ''} each, Total {displayCount * section.marks})
                            </span>
                          </h5>
                        </div>

                        {/* Questions under this heading */}
                        <div className="space-y-3 pl-6">
                          {headingQuestions.map((question, qIdx) => (
                            <div 
                              key={question.id} 
                              className="question-row grid grid-cols-[auto_1fr] gap-3 items-start"
                              ref={autoFocusQuestionId === question.id ? autoFocusRef : undefined}
                            >
                              {/* Question Number */}
                              <div className="pt-0.5 font-medium text-foreground shrink-0">
                                {qIdx + 1}.
                              </div>

                              {/* Question Content */}
                              <div className="min-w-0 pr-4">
                                {isEditable && selectedQuestionId === question.id ? (
                                  <QuestionBlockEditor
                                    question={question}
                                    onUpdate={(updates) =>
                                      onUpdateQuestion && onUpdateQuestion(section.id, question.id, updates)
                                    }
                                    onDelete={() => onDeleteQuestion && onDeleteQuestion(section.id, question.id)}
                                    autoFocus={autoFocusQuestionId === question.id}
                                    onAutoFocusComplete={onAutoFocusComplete}
                                  />
                                ) : (
                                  <div
                                    className={
                                      isEditable
                                        ? 'cursor-pointer rounded-md p-2 transition-colors hover:bg-muted/50'
                                        : ''
                                    }
                                    onClick={() => isEditable && onSelectQuestion && onSelectQuestion(question.id)}
                                  >
                                    <PaperRenderer question={question} />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Empty state for heading with no questions */}
                          {headingQuestions.length === 0 && (
                            <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/10 p-3 text-center">
                              <p className="text-xs text-muted-foreground italic">
                                No questions yet. {isEditable && 'Use the toolbox to add questions to this heading.'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

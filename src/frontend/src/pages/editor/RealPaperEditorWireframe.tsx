import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaperSurface } from '../../components/paper/PaperSurface';
import { FloatingRealPaperToolbox } from '../../components/editor/FloatingRealPaperToolbox';
import { MobileRealPaperFabToolbox } from '../../components/editor/MobileRealPaperFabToolbox';
import { PaperActionOverflowMenu } from '../../components/paper/PaperActionOverflowMenu';
import { AddQuestionHeadingDialog } from '../../components/editor/AddQuestionHeadingDialog';
import { RealPaperToolboxSpotlight } from '../../components/editor/RealPaperToolboxSpotlight';
import { useRealPaperToolboxSpotlight } from '../../hooks/useRealPaperToolboxSpotlight';
import { AlertCircle, ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { Question, QuestionType, QuestionHeading } from '../../state/mockData';
import { toast } from 'sonner';

export function RealPaperEditorWireframe() {
  const navigate = useNavigate();
  const { paperId } = useParams({ from: '/editor/$paperId/real-paper' });
  const { isInitialized, getPaperById, updatePaper } = useMockStore();
  const toolboxSpotlight = useRealPaperToolboxSpotlight();

  const paper = getPaperById(paperId);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedHeadingId, setSelectedHeadingId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [showAddHeadingDialog, setShowAddHeadingDialog] = useState(false);
  const [autoFocusQuestionId, setAutoFocusQuestionId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Initialize section and heading selection
  useEffect(() => {
    if (paper && paper.sections.length > 0 && !selectedSectionId) {
      const firstSection = paper.sections[0];
      setSelectedSectionId(firstSection.id);
      if (firstSection.headings && firstSection.headings.length > 0) {
        setSelectedHeadingId(firstSection.headings[0].id);
      }
    }
  }, [paper, selectedSectionId]);

  // Update heading selection when section changes
  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const section = paper?.sections.find((s) => s.id === sectionId);
    if (section?.headings && section.headings.length > 0) {
      setSelectedHeadingId(section.headings[0].id);
    } else {
      setSelectedHeadingId(null);
    }
  };

  const handleAddQuestion = (sectionId: string, headingId: string, questionType: QuestionType) => {
    if (!paper) return;

    const section = paper.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: '',
      marks: section.marks,
      source: 'personal',
      questionType,
      headingId: headingId,
      ...(questionType === 'mcq' && {
        mcqOptions: { options: ['', '', '', ''] },
      }),
      ...(questionType === 'fill-in-blank' && {
        fillInBlankData: { blanks: [''] },
      }),
      ...(questionType === 'true-false' && {
        trueFalseData: {},
      }),
      ...(questionType === 'match-pairs' && {
        matchPairsData: { pairs: [{ left: '', right: '' }] },
      }),
      ...(questionType === 'table' && {
        tableData: { rows: 2, cols: 2, cells: [['', ''], ['', '']] },
      }),
    };

    const updatedSections = paper.sections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, questions: [...s.questions, newQuestion] };
      }
      return s;
    });

    setAutoSaveStatus('saving');
    updatePaper(paperId, { sections: updatedSections });
    setTimeout(() => setAutoSaveStatus('saved'), 500);
    setTimeout(() => setAutoSaveStatus('idle'), 2000);

    // Select and auto-focus the new question
    setSelectedQuestionId(newQuestion.id);
    setAutoFocusQuestionId(newQuestion.id);
  };

  const handleAddHeading = (heading: Omit<QuestionHeading, 'id'>) => {
    if (!paper || !selectedSectionId) return;

    const newHeading: QuestionHeading = {
      id: `heading-${Date.now()}`,
      ...heading,
    };

    const updatedSections = paper.sections.map((s) => {
      if (s.id === selectedSectionId) {
        return {
          ...s,
          headings: [...(s.headings || []), newHeading],
        };
      }
      return s;
    });

    setAutoSaveStatus('saving');
    updatePaper(paperId, { sections: updatedSections });
    setTimeout(() => setAutoSaveStatus('saved'), 500);
    setTimeout(() => setAutoSaveStatus('idle'), 2000);

    setSelectedHeadingId(newHeading.id);
  };

  const handleUpdateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    if (!paper) return;

    const updatedSections = paper.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
        };
      }
      return section;
    });

    setAutoSaveStatus('saving');
    updatePaper(paperId, { sections: updatedSections });
    setTimeout(() => setAutoSaveStatus('saved'), 500);
    setTimeout(() => setAutoSaveStatus('idle'), 2000);
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    if (!paper) return;

    const updatedSections = paper.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter((q) => q.id !== questionId),
        };
      }
      return section;
    });

    updatePaper(paperId, { sections: updatedSections });
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null);
    }
  };

  const handleInsertImage = () => {
    if (!selectedQuestionId) {
      toast.error('Please select a question first to insert an image');
      return;
    }
    imageInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedQuestionId || !paper) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      
      // Find the question and add the image attachment
      const updatedSections = paper.sections.map((section) => {
        return {
          ...section,
          questions: section.questions.map((q) => {
            if (q.id === selectedQuestionId) {
              return {
                ...q,
                imageAttachment: imageData,
              };
            }
            return q;
          }),
        };
      });

      setAutoSaveStatus('saving');
      updatePaper(paperId, { sections: updatedSections });
      setTimeout(() => setAutoSaveStatus('saved'), 500);
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
      
      toast.success('Image attached to question');
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Paper not found. Please return to the papers list.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-muted/30">
      {/* Fixed Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/papers' })}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{paper.title}</h1>
              <p className="text-xs text-muted-foreground">
                {autoSaveStatus === 'saving' && (
                  <span className="flex items-center gap-1">
                    <Save className="h-3 w-3 animate-pulse" />
                    Saving...
                  </span>
                )}
                {autoSaveStatus === 'saved' && <span className="text-green-600">Saved</span>}
                {autoSaveStatus === 'idle' && <span>Real Paper Editor</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleInsertImage}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Insert Image
            </Button>
            <PaperActionOverflowMenu paperId={paperId} />
          </div>
        </div>
      </header>

      {/* Hidden file input for image selection */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Main Content with top padding for fixed header */}
      <main className="container py-8 pt-20">
        <PaperSurface
          paper={paper}
          isEditable={true}
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={setSelectedQuestionId}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          autoFocusQuestionId={autoFocusQuestionId}
          onAutoFocusComplete={() => setAutoFocusQuestionId(null)}
        />
      </main>

      {/* Desktop Floating Toolbox */}
      <div className="hidden md:block">
        <FloatingRealPaperToolbox
          paper={paper}
          selectedSectionId={selectedSectionId}
          selectedHeadingId={selectedHeadingId}
          onSelectSection={handleSelectSection}
          onSelectHeading={setSelectedHeadingId}
          onAddQuestion={handleAddQuestion}
          onAddHeading={() => setShowAddHeadingDialog(true)}
        />
      </div>

      {/* Mobile FAB Toolbox */}
      <div className="md:hidden">
        <MobileRealPaperFabToolbox
          paper={paper}
          selectedSectionId={selectedSectionId}
          selectedHeadingId={selectedHeadingId}
          onSelectSection={handleSelectSection}
          onSelectHeading={setSelectedHeadingId}
          onAddQuestion={handleAddQuestion}
          onAddHeading={() => setShowAddHeadingDialog(true)}
        />
      </div>

      {/* Add Heading Dialog */}
      <AddQuestionHeadingDialog
        open={showAddHeadingDialog}
        onOpenChange={setShowAddHeadingDialog}
        onAdd={handleAddHeading}
      />

      {/* Toolbox Spotlight */}
      {toolboxSpotlight.shouldShow && (
        <RealPaperToolboxSpotlight onComplete={toolboxSpotlight.complete} />
      )}
    </div>
  );
}

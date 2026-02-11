import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Save, Undo, Redo } from 'lucide-react';
import { Question, QuestionType } from '../../state/mockData';
import { getSectionInsertContext } from '../../lib/editor/sectionInsertContext';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { saveQuestionDraft, loadQuestionDraft, clearQuestionDraft } from '../../lib/storage/questionDraftStorage';

interface QuestionFormState {
  questionText: string;
  marks: number;
  questionType: QuestionType;
}

export function QuestionEntryWireframe() {
  const navigate = useNavigate();
  const { paperId } = useParams({ from: '/editor/$paperId/question' });
  const { isInitialized, getPaperById, addPersonalQuestion, updatePaper } = useMockStore();

  const paper = getPaperById(paperId);
  const insertContext = getSectionInsertContext();

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  const initialState: QuestionFormState = {
    questionText: '',
    marks: 2,
    questionType: 'short-answer',
  };

  const { state, setState, undo, redo, canUndo, canRedo, reset } = useUndoRedo<QuestionFormState>(initialState, {
    maxHistorySize: 30,
  });

  // Load draft on mount
  useEffect(() => {
    const draft = loadQuestionDraft(paperId);
    if (draft) {
      reset({
        questionText: draft.questionText,
        marks: draft.marks,
        questionType: draft.questionType as QuestionType,
      });
    }
  }, [paperId, reset]);

  // Autosave draft
  useDebouncedEffect(
    () => {
      if (state.questionText.trim() === '') {
        return;
      }

      setAutoSaveStatus('saving');
      saveQuestionDraft(paperId, {
        questionText: state.questionText,
        marks: state.marks,
        questionType: state.questionType,
      });

      setTimeout(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }, 300);
    },
    500,
    [state, paperId]
  );

  const handleSaveToBank = () => {
    if (state.questionText.trim() === '') {
      alert('Please enter a question');
      return;
    }

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: state.questionText,
      marks: state.marks,
      type: 'General',
      questionType: state.questionType,
      headingId: null,
      imageAttachment: null,
      ...(state.questionType === 'mcq' && {
        mcqOptions: { options: ['', '', '', ''] },
      }),
      ...(state.questionType === 'fill-in-blank' && {
        fillInBlankData: { blanks: [''] },
      }),
      ...(state.questionType === 'true-false' && {
        trueFalseData: {},
      }),
      ...(state.questionType === 'match-pairs' && {
        matchPairsData: { pairs: [{ left: '', right: '' }] },
      }),
      ...(state.questionType === 'table' && {
        tableData: { rows: 2, cols: 2, cells: [['', ''], ['', '']] },
      }),
    };

    addPersonalQuestion(newQuestion);
    clearQuestionDraft(paperId);
    reset(initialState);
    alert('Question added to your personal bank!');
  };

  const handleSaveToPaper = () => {
    if (!paper) {
      alert('Paper not found');
      return;
    }

    if (state.questionText.trim() === '') {
      alert('Please enter a question');
      return;
    }

    const targetSectionId = insertContext?.sectionId || paper.sections[0]?.id;
    if (!targetSectionId) {
      alert('No section available in this paper');
      return;
    }

    const targetSection = paper.sections.find((s) => s.id === targetSectionId);
    if (!targetSection) {
      alert('Section not found');
      return;
    }

    const headingId = targetSection.headings?.[0]?.id || null;

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: state.questionText,
      marks: state.marks,
      type: 'General',
      questionType: state.questionType,
      headingId: headingId,
      imageAttachment: null,
      ...(state.questionType === 'mcq' && {
        mcqOptions: { options: ['', '', '', ''] },
      }),
      ...(state.questionType === 'fill-in-blank' && {
        fillInBlankData: { blanks: [''] },
      }),
      ...(state.questionType === 'true-false' && {
        trueFalseData: {},
      }),
      ...(state.questionType === 'match-pairs' && {
        matchPairsData: { pairs: [{ left: '', right: '' }] },
      }),
      ...(state.questionType === 'table' && {
        tableData: { rows: 2, cols: 2, cells: [['', ''], ['', '']] },
      }),
    };

    // Add question to paper
    const updatedSections = paper.sections.map((s) => {
      if (s.id === targetSectionId) {
        return { ...s, questions: [...s.questions, newQuestion] };
      }
      return s;
    });

    updatePaper(paperId, { sections: updatedSections });
    clearQuestionDraft(paperId);
    reset(initialState);
    alert('Question added to paper!');
  };

  if (!isInitialized) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Paper not found or has been deleted.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Question</h1>
          <p className="mt-2 text-muted-foreground">Create a new question for {paper.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {autoSaveStatus === 'saving' && <span className="text-sm text-muted-foreground">Saving...</span>}
          {autoSaveStatus === 'saved' && <span className="text-sm text-success">Saved</span>}
          <Button variant="outline" size="icon" onClick={undo} disabled={!canUndo} title="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={redo} disabled={!canRedo} title="Redo">
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>Enter the question text and configure its properties</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text</Label>
            <Textarea
              id="questionText"
              value={state.questionText}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  questionText: e.target.value,
                }))
              }
              placeholder="Enter your question here..."
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="marks">Marks</Label>
              <Input
                id="marks"
                type="number"
                value={state.marks}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    marks: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionType">Question Type</Label>
              <Select
                value={state.questionType}
                onValueChange={(value) =>
                  setState((prev) => ({
                    ...prev,
                    questionType: value as QuestionType,
                  }))
                }
              >
                <SelectTrigger id="questionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="fill-in-blank">Fill in the Blank</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="match-pairs">Match Pairs</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={handleSaveToBank} variant="outline" className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          Add to Personal Bank
        </Button>
        <Button onClick={handleSaveToPaper} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Add to Paper
        </Button>
      </div>
    </div>
  );
}


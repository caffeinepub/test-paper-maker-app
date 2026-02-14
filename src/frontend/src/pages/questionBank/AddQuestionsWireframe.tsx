import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Check, X, AlertCircle } from 'lucide-react';
import { BOARDS, STANDARDS, QUESTION_TYPES } from '../../lib/questionBank/questionBankTaxonomy';
import { Question, QuestionType } from '../../state/mockData';
import { detectQuestionType } from '../../lib/questionBank/detectQuestionType';

interface QuestionDraft {
  id: string;
  text: string;
  detectedType: QuestionType | null;
  confirmedType: QuestionType | null;
  needsConfirmation: boolean;
}

export function AddQuestionsWireframe() {
  const navigate = useNavigate();
  const { addPersonalQuestion, profile } = useMockStore();
  const [board, setBoard] = useState<string>(profile.preferredBoard || 'CBSE');
  const [standard, setStandard] = useState<string>(profile.defaultStandard || 'Standard 10');
  const [questionText, setQuestionText] = useState('');
  const [questionDrafts, setQuestionDrafts] = useState<QuestionDraft[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBack = () => {
    navigate({ to: '/question-bank' });
  };

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      alert('Please enter a question');
      return;
    }

    setIsProcessing(true);

    // Detect question type immediately
    const detectedType = detectQuestionType(questionText);

    const newDraft: QuestionDraft = {
      id: `draft-${Date.now()}-${Math.random()}`,
      text: questionText.trim(),
      detectedType,
      confirmedType: null,
      needsConfirmation: true,
    };

    setQuestionDrafts((prev) => [...prev, newDraft]);
    setQuestionText('');
    setIsProcessing(false);
  };

  const handleConfirmType = (draftId: string, isCorrect: boolean) => {
    setQuestionDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id === draftId) {
          if (isCorrect && draft.detectedType) {
            return {
              ...draft,
              confirmedType: draft.detectedType,
              needsConfirmation: false,
            };
          } else {
            return {
              ...draft,
              needsConfirmation: false,
            };
          }
        }
        return draft;
      })
    );
  };

  const handleSelectType = (draftId: string, type: QuestionType) => {
    setQuestionDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id === draftId) {
          return {
            ...draft,
            confirmedType: type,
          };
        }
        return draft;
      })
    );
  };

  const handleRemoveDraft = (draftId: string) => {
    setQuestionDrafts((prev) => prev.filter((draft) => draft.id !== draftId));
  };

  const handleSaveAll = () => {
    const unconfirmedDrafts = questionDrafts.filter((draft) => !draft.confirmedType);
    if (unconfirmedDrafts.length > 0) {
      alert('Please confirm or select a type for all questions before saving');
      return;
    }

    if (questionDrafts.length === 0) {
      alert('No questions to save');
      return;
    }

    // Save all questions to personal bank
    questionDrafts.forEach((draft) => {
      const newQuestion: Question = {
        id: `q-${Date.now()}-${Math.random()}`,
        text: draft.text,
        marks: 2,
        type: 'Conceptual',
        questionType: draft.confirmedType!,
        headingId: null,
        imageAttachment: null,
        board,
        standard,
      };
      addPersonalQuestion(newQuestion);
    });

    alert(`${questionDrafts.length} question(s) added to your personal bank!`);
    navigate({ to: '/question-bank', search: { tab: 'personal' } });
  };

  const getQuestionTypeLabel = (type: QuestionType | null) => {
    if (!type) return 'Unknown';
    const found = QUESTION_TYPES.find((qt) => qt.value === type);
    return found ? found.label : type;
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Question Bank
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Add Questions</h1>
        <p className="mt-2 text-muted-foreground">
          Add questions manually to your personal question bank
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>Select board and standard for your questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="board">Board</Label>
              <Select value={board} onValueChange={setBoard}>
                <SelectTrigger id="board">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOARDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="standard">Standard</Label>
              <Select value={standard} onValueChange={setStandard}>
                <SelectTrigger id="standard">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STANDARDS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Question Text</Label>
            <Textarea
              id="question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter or paste your question here..."
              rows={4}
            />
          </div>

          <Button onClick={handleAddQuestion} disabled={isProcessing || !questionText.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </CardContent>
      </Card>

      {questionDrafts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Questions to Add ({questionDrafts.length})</CardTitle>
            <CardDescription>Confirm or change the detected question type for each question</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionDrafts.map((draft) => (
              <Card key={draft.id} className="border-2">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <p className="text-foreground">{draft.text}</p>

                    {draft.needsConfirmation && draft.detectedType && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Detected as <strong>{getQuestionTypeLabel(draft.detectedType)}</strong>. Is this correct?
                        </AlertDescription>
                      </Alert>
                    )}

                    {draft.needsConfirmation && draft.detectedType && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleConfirmType(draft.id, true)}>
                          <Check className="mr-2 h-4 w-4" />
                          Yes, Correct
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleConfirmType(draft.id, false)}>
                          <X className="mr-2 h-4 w-4" />
                          No, Let Me Choose
                        </Button>
                      </div>
                    )}

                    {!draft.needsConfirmation && !draft.confirmedType && (
                      <div className="space-y-2">
                        <Label>Select Question Type</Label>
                        <Select
                          value={draft.confirmedType || ''}
                          onValueChange={(value) => handleSelectType(draft.id, value as QuestionType)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a question type..." />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_TYPES.filter((qt) => qt.value !== 'all').map((qt) => (
                              <SelectItem key={qt.value} value={qt.value}>
                                {qt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {draft.confirmedType && (
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                          {getQuestionTypeLabel(draft.confirmedType)}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveDraft(draft.id)}>
                          <X className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveAll} className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Save All to Question Bank
              </Button>
              <Button variant="outline" onClick={() => setQuestionDrafts([])}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

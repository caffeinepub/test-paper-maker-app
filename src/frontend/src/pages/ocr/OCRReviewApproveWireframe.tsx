import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Check, X } from 'lucide-react';
import { loadOCRSession, clearOCRSession, convertOCRQuestionsToPersonalQuestions, OCRQuestion } from '../../lib/ocr/mockOcrExtractor';
import { QuestionCategorizationDialog } from '../../components/questionBank/QuestionCategorizationDialog';
import { Question } from '../../state/mockData';

export function OCRReviewApproveWireframe() {
  const navigate = useNavigate();
  const { addPersonalQuestion, profile } = useMockStore();
  const [session, setSession] = useState(loadOCRSession());
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showCategorizationDialog, setShowCategorizationDialog] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate({ to: '/ocr' });
    }
  }, [session, navigate]);

  const handleBack = () => {
    navigate({ to: '/ocr' });
  };

  const handleToggleSelect = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleEdit = (questionId: string, text: string) => {
    setEditingId(questionId);
    setEditText(text);
  };

  const handleSaveEdit = (questionId: string) => {
    if (session) {
      const updatedQuestions = session.questions.map((q) =>
        q.id === questionId ? { ...q, text: editText } : q
      );
      setSession({ ...session, questions: updatedQuestions });
    }
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleApprove = () => {
    if (selectedQuestions.size === 0) {
      alert('Please select at least one question');
      return;
    }
    setShowCategorizationDialog(true);
  };

  const handleCategorizationConfirm = (metadata: { board: string; standard: string; questionType: string }) => {
    if (!session) return;

    const selectedOcrQuestions = session.questions.filter((q) => selectedQuestions.has(q.id));
    const personalQuestions = convertOCRQuestionsToPersonalQuestions(selectedOcrQuestions);

    personalQuestions.forEach((personalQuestion) => {
      const enrichedQuestion: Question = {
        ...personalQuestion,
        board: metadata.board,
        standard: metadata.standard,
        questionType: metadata.questionType as any,
      };
      addPersonalQuestion(enrichedQuestion);
    });

    clearOCRSession();
    alert(`${selectedOcrQuestions.length} question(s) added to your personal bank!`);
    navigate({
      to: '/question-bank/$board/$standard',
      params: { board: metadata.board, standard: metadata.standard },
      search: { tab: 'personal' },
    });
  };

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to OCR Upload
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Review Extracted Questions</h1>
        <p className="mt-2 text-muted-foreground">
          Review and edit the questions extracted from your image. Select the ones you want to add to your question bank.
        </p>
      </div>

      {selectedQuestions.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border bg-card p-4">
          <span className="text-sm font-medium">
            {selectedQuestions.size} question{selectedQuestions.size > 1 ? 's' : ''} selected
          </span>
          <Button onClick={handleApprove}>
            <Check className="mr-2 h-4 w-4" />
            Approve Selected
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {session.questions.map((question) => (
          <Card key={question.id} className="transition-all hover:shadow-md">
            <CardContent className="p-4">
              {editingId === question.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSaveEdit(question.id)}>
                      <Check className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedQuestions.has(question.id)}
                    onCheckedChange={() => handleToggleSelect(question.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="text-foreground">{question.text}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                        {question.marks || 2} Mark{(question.marks || 2) > 1 ? 's' : ''}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {question.difficulty || 'Medium'}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(question.id, question.text)}>
                    Edit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <QuestionCategorizationDialog
        open={showCategorizationDialog}
        onOpenChange={setShowCategorizationDialog}
        onConfirm={handleCategorizationConfirm}
        defaultBoard={profile.preferredBoard}
        defaultStandard={profile.defaultStandard}
      />
    </div>
  );
}

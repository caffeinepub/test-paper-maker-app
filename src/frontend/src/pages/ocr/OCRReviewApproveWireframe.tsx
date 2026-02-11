import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import { loadOCRSession, clearOCRSession, convertOCRQuestionsToPersonalQuestions } from '../../lib/ocr/mockOcrExtractor';
import { useMockStore } from '../../state/mockStore';

export function OCRReviewApproveWireframe() {
  const navigate = useNavigate();
  const { addQuestions } = useMockStore();
  const [questions, setQuestions] = useState<Array<{ id: string; text: string; approved: boolean; editing: boolean }>>([]);
  const [sessionInfo, setSessionInfo] = useState<{ fileName: string; extractedAt: string } | null>(null);

  useEffect(() => {
    const session = loadOCRSession();
    if (session) {
      setQuestions(session.questions);
      setSessionInfo({
        fileName: session.fileName,
        extractedAt: new Date(session.extractedAt).toLocaleString(),
      });
    }
  }, []);

  const handleToggleApprove = (id: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, approved: !q.approved } : q)));
  };

  const handleEdit = (id: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, editing: !q.editing } : q)));
  };

  const handleTextChange = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const handleInsert = () => {
    const approvedQuestions = questions.filter((q) => q.approved);
    if (approvedQuestions.length > 0) {
      const personalQuestions = convertOCRQuestionsToPersonalQuestions(approvedQuestions);
      addQuestions(personalQuestions);
      clearOCRSession();
      navigate({ to: '/question-bank', search: { tab: 'personal' } });
    }
  };

  const handleCancel = () => {
    clearOCRSession();
    navigate({ to: '/home' });
  };

  if (questions.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No OCR session found. Please upload a document first.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => navigate({ to: '/ocr/upload' })}>
            Go to Upload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Review Extracted Questions</h1>
        <p className="mt-2 text-muted-foreground">
          Review and approve questions before adding to your question bank
        </p>
        {sessionInfo && (
          <p className="mt-1 text-sm text-muted-foreground">
            From: {sessionInfo.fileName} • Extracted: {sessionInfo.extractedAt}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extracted Questions</CardTitle>
          <CardDescription>
            Check each question for accuracy. Edit if needed, then approve to insert.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Nothing is inserted until you explicitly approve and click "Insert Approved". You can
              edit any question before approving.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.id} className={question.approved ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={question.approved}
                      onCheckedChange={() => handleToggleApprove(question.id)}
                    />
                    <div className="flex-1 space-y-2">
                      {question.editing ? (
                        <Textarea
                          value={question.text}
                          onChange={(e) => handleTextChange(question.id, e.target.value)}
                          rows={3}
                        />
                      ) : (
                        <p className="text-foreground">{question.text}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(question.id)}
                    >
                      {question.editing ? 'Done' : 'Edit'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleInsert} disabled={!questions.some((q) => q.approved)}>
              Insert Approved ({questions.filter((q) => q.approved).length})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

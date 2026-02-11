import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { loadOCRSession, clearOCRSession, convertOCRQuestionsToPersonalQuestions } from '../../lib/ocr/mockOcrExtractor';
import { useMockStore } from '../../state/mockStore';

export function OCRReviewApproveWireframe() {
  const navigate = useNavigate();
  const { addQuestions } = useMockStore();
  const [questions, setQuestions] = useState<Array<{ id: string; text: string; approved: boolean; editing: boolean }>>([]);
  const [sessionInfo, setSessionInfo] = useState<{ fileName: string; extractedAt: string; extractedText: string; extractionFailed: boolean } | null>(null);

  useEffect(() => {
    const session = loadOCRSession();
    if (session) {
      setQuestions(session.questions);
      setSessionInfo({
        fileName: session.fileName,
        extractedAt: new Date(session.extractedAt).toLocaleString(),
        extractedText: session.extractedText,
        extractionFailed: session.extractionFailed || false,
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

  const handleGoBackToUpload = () => {
    clearOCRSession();
    navigate({ to: '/ocr/upload' });
  };

  // Show error if extraction failed or no text was provided
  if (sessionInfo?.extractionFailed || (questions.length === 0 && sessionInfo)) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Review Extracted Questions</h1>
          <p className="mt-2 text-muted-foreground">
            No questions could be extracted from the OCR result
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Extraction Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>No Questions Found</AlertTitle>
              <AlertDescription className="mt-2">
                {sessionInfo?.extractionFailed 
                  ? 'The OCR extraction did not return any text. This could be due to poor image quality, unsupported format, or API limits.'
                  : 'Could not find any questions in the extracted text. Please check the format and try again with a clearer image.'}
              </AlertDescription>
            </Alert>

            {sessionInfo?.extractedText && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Extracted Text:</h3>
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {sessionInfo.extractedText}
                  </pre>
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Tips for better OCR extraction:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use clear, high-resolution images with good lighting</li>
                <li>Ensure text is horizontal and not skewed</li>
                <li>Format questions with numbers (1., 2., etc.)</li>
                <li>End questions with a question mark (?)</li>
                <li>Use bullet points or clear line breaks</li>
                <li>Keep file size under 1MB</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGoBackToUpload}>
                <FileText className="mr-2 h-4 w-4" />
                Try Another File
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if no session found at all
  if (!sessionInfo) {
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

  const approvedCount = questions.filter((q) => q.approved).length;

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Review Extracted Questions</h1>
        <p className="mt-2 text-muted-foreground">
          Review and approve questions extracted via OCR before adding to your question bank
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          From: {sessionInfo.fileName} • Extracted: {sessionInfo.extractedAt}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extracted Questions ({questions.length})</CardTitle>
          <CardDescription>
            Check each question for accuracy. Edit if needed, then approve to insert into your question bank.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Questions were automatically extracted using OCR technology. Review each one carefully and edit if needed.
              Only approved questions will be added to your question bank.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={question.id} className={question.approved ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={question.approved}
                      onCheckedChange={() => handleToggleApprove(question.id)}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="text-xs text-muted-foreground">Question {index + 1}</div>
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
                      variant="ghost"
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

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {approvedCount} of {questions.length} questions approved
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleInsert} disabled={approvedCount === 0}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Insert Approved ({approvedCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

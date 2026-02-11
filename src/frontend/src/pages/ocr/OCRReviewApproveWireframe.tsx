import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Edit2, AlertCircle, FileText } from 'lucide-react';
import { Question } from '../../state/mockData';
import { loadOCRSession, clearOCRSession, convertOCRQuestionsToPersonalQuestions } from '../../lib/ocr/mockOcrExtractor';

export function OCRReviewApproveWireframe() {
  const navigate = useNavigate();
  const { addPersonalQuestion } = useMockStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const session = loadOCRSession();
    if (!session || !session.questions) {
      // No OCR session, redirect to upload
      navigate({ to: '/ocr/upload' });
      return;
    }

    // Convert OCR questions to Question format
    const convertedQuestions = convertOCRQuestionsToPersonalQuestions(session.questions);
    setQuestions(convertedQuestions);
    // Select all questions by default
    setSelectedQuestions(new Set(convertedQuestions.map((q) => q.id)));
  }, [navigate]);

  const handleToggleQuestion = (id: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleApprove = () => {
    const selectedQuestionsArray = questions.filter((q) => selectedQuestions.has(q.id));
    
    if (selectedQuestionsArray.length === 0) {
      alert('Please select at least one question to approve');
      return;
    }

    // Add selected questions to personal bank
    selectedQuestionsArray.forEach((q) => addPersonalQuestion(q));

    clearOCRSession();
    alert(`${selectedQuestionsArray.length} question(s) added to your personal bank!`);
    navigate({ to: '/question-bank', search: { tab: 'personal' } });
  };

  const handleReject = () => {
    clearOCRSession();
    navigate({ to: '/ocr/upload' });
  };

  if (questions.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No questions found. Redirecting to upload...</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Review OCR Results</h1>
        <p className="mt-2 text-muted-foreground">
          Review and approve the questions extracted from your document
        </p>
      </div>

      <Alert className="mb-6">
        <FileText className="h-4 w-4" />
        <AlertDescription>
          {selectedQuestions.size} of {questions.length} question(s) selected. Review each question and approve to add
          them to your personal bank.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const isSelected = selectedQuestions.has(question.id);
          return (
            <Card key={question.id} className={isSelected ? 'border-primary' : 'border-muted'}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <Badge variant={isSelected ? 'default' : 'outline'}>
                        {isSelected ? 'Selected' : 'Not Selected'}
                      </Badge>
                      <Badge variant="secondary">{question.questionType}</Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {question.marks} mark{question.marks > 1 ? 's' : ''} • {question.type}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" title="Edit question">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => handleToggleQuestion(question.id)}
                      title={isSelected ? 'Deselect' : 'Select'}
                    >
                      {isSelected ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-foreground">{question.text}</p>
                {question.mcqOptions && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Options:</p>
                    {question.mcqOptions.options.map((option, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                )}
                {question.fillInBlankData && question.fillInBlankData.blanks.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Answers:</p>
                    {question.fillInBlankData.blanks.map((blank, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{idx + 1}.</span>
                        <span className="rounded bg-muted px-2 py-1">{blank}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex gap-4">
        <Button onClick={handleReject} variant="outline" className="flex-1">
          <X className="mr-2 h-4 w-4" />
          Reject & Start Over
        </Button>
        <Button onClick={handleApprove} className="flex-1" disabled={selectedQuestions.size === 0}>
          <Check className="mr-2 h-4 w-4" />
          Approve Selected ({selectedQuestions.size})
        </Button>
      </div>
    </div>
  );
}


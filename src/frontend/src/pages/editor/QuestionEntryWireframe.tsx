import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { Question, QuestionType } from '../../state/mockData';
import { loadQuestionDraft, saveQuestionDraft, clearQuestionDraft } from '../../lib/storage/questionDraftStorage';

export function QuestionEntryWireframe() {
  const navigate = useNavigate();
  const { paperId } = useParams({ from: '/editor/$paperId/question-entry' });
  const { getPaperById, addPersonalQuestion, profile } = useMockStore();
  const paper = getPaperById(paperId);

  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(2);
  const [questionType, setQuestionType] = useState<QuestionType>('short-answer');
  const [type, setType] = useState('Conceptual');

  // Load draft on mount
  useEffect(() => {
    const draft = loadQuestionDraft(paperId);
    if (draft) {
      setQuestionText(draft.questionText || '');
      setMarks(draft.marks || 2);
      setQuestionType((draft.questionType as QuestionType) || 'short-answer');
    }
  }, [paperId]);

  // Save draft on changes
  useEffect(() => {
    if (questionText || marks !== 2) {
      saveQuestionDraft(paperId, {
        questionText,
        marks,
        questionType,
      });
    }
  }, [paperId, questionText, marks, questionType]);

  const handleBack = () => {
    navigate({ to: `/editor/${paperId}` });
  };

  const handleSave = () => {
    if (!questionText.trim()) {
      alert('Please enter question text');
      return;
    }

    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: questionText,
      marks,
      type,
      questionType,
      headingId: null,
      imageAttachment: null,
      board: paper?.board || profile.preferredBoard,
      standard: paper?.standard || profile.defaultStandard,
    };

    addPersonalQuestion(newQuestion);
    clearQuestionDraft(paperId);
    alert('Question added to your personal bank!');
    navigate({ to: `/editor/${paperId}` });
  };

  if (!paper) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <p>Paper not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Paper
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="questionText">Question Text</Label>
            <Textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
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
                value={marks}
                onChange={(e) => setMarks(parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conceptual">Conceptual</SelectItem>
                  <SelectItem value="Numerical">Numerical</SelectItem>
                  <SelectItem value="Application">Application</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="questionType">Question Type</Label>
            <Select value={questionType} onValueChange={(value: QuestionType) => setQuestionType(value)}>
              <SelectTrigger id="questionType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short-answer">Short Answer</SelectItem>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="numerical">Numerical</SelectItem>
                <SelectItem value="fill-in-blank">Fill in the Blank</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="match-pairs">Match Pairs</SelectItem>
                <SelectItem value="table">Table</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save to Personal Bank
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

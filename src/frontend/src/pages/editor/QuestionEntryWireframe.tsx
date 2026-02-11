import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function QuestionEntryWireframe() {
  const navigate = useNavigate();
  const { paperId } = useParams({ from: '/editor/$paperId/question' });
  const { addQuestion, getPaperById, updatePaper } = useMockStore();

  const paper = getPaperById(paperId);

  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState<1 | 2 | 3 | 4>(1);
  const [type, setType] = useState('');

  const handleSave = () => {
    if (questionText.trim() && paper) {
      const newQuestion = {
        id: `q-${Date.now()}`,
        text: questionText,
        marks,
        type: type || undefined,
        source: 'personal' as const,
      };

      // Add to personal questions
      addQuestion(newQuestion);

      // Find matching section and add question to it
      const matchingSection = paper.sections.find((s) => s.marks === marks);
      if (matchingSection) {
        const updatedSections = paper.sections.map((s) => {
          if (s.id === matchingSection.id) {
            return {
              ...s,
              questions: [...s.questions, newQuestion],
            };
          }
          return s;
        });
        updatePaper(paperId, { sections: updatedSections });
      }

      navigate({ to: `/editor/${paperId}` });
    }
  };

  const handleCancel = () => {
    navigate({ to: `/editor/${paperId}` });
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Question</CardTitle>
          <CardDescription>Write your question and select marks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Questions are automatically saved to "My Questions" when you click Save. You can reuse
              them in future papers.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="question">Question Text *</Label>
            <Textarea
              id="question"
              placeholder="Enter your question here..."
              rows={6}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="marks">Marks *</Label>
              <Select
                value={marks.toString()}
                onValueChange={(value) => setMarks(parseInt(value) as 1 | 2 | 3 | 4)}
              >
                <SelectTrigger id="marks">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Mark</SelectItem>
                  <SelectItem value="2">2 Marks</SelectItem>
                  <SelectItem value="3">3 Marks</SelectItem>
                  <SelectItem value="4">4 Marks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Question Type (Optional)</Label>
              <Input
                id="type"
                placeholder="e.g., MCQ, Short Answer"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
            <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!questionText.trim()} className="w-full sm:w-auto">
              Save Question
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Info, Sparkles, Edit2, Check, X } from 'lucide-react';
import { generateMockQuestions } from '../../lib/ai/mockQuestionGenerator';
import { getSectionInsertContext, clearSectionInsertContext } from '../../lib/editor/sectionInsertContext';

interface Question {
  id: string;
  text: string;
  marks: 1 | 2 | 3 | 4;
  selected: boolean;
}

export function AIPreferencesWireframe() {
  const navigate = useNavigate();
  const { addQuestions, getPaperById, updatePaper } = useMockStore();
  const [marks, setMarks] = useState('2');
  const [focusArea, setFocusArea] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionStyle, setQuestionStyle] = useState<'numerical' | 'conceptual'>('conceptual');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDrafts, setEditDrafts] = useState<Record<string, string>>({});
  const [insertContext, setInsertContext] = useState(getSectionInsertContext());

  useEffect(() => {
    setInsertContext(getSectionInsertContext());
  }, []);

  const handleGenerate = () => {
    if (!focusArea.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const questions = generateMockQuestions({
        marks,
        focusArea,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        questionStyle,
      });

      setGeneratedQuestions(
        questions.map((q) => ({
          id: q.id,
          text: q.text,
          marks: q.marks as 1 | 2 | 3 | 4,
          selected: true,
        }))
      );
      setIsGenerating(false);
    }, 1500);
  };

  const handleToggleQuestion = (id: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q))
    );
  };

  const handleStartEdit = (id: string, currentText: string) => {
    setEditingId(id);
    setEditDrafts((prev) => ({ ...prev, [id]: currentText }));
  };

  const handleSaveEdit = (id: string) => {
    const draft = editDrafts[id];
    if (draft !== undefined) {
      setGeneratedQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, text: draft } : q))
      );
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleInsertSelected = () => {
    const selected = generatedQuestions.filter((q) => q.selected);
    if (selected.length === 0) return;

    const questionsToAdd = selected.map((q) => ({
      id: `q-${Date.now()}-${Math.random()}`,
      text: q.text,
      marks: q.marks,
      source: 'personal' as const,
      questionType: 'short-answer' as const,
    }));

    if (insertContext) {
      // Insert into specific paper section
      const paper = getPaperById(insertContext.paperId);
      if (paper) {
        const updatedSections = paper.sections.map((s) => {
          if (s.id === insertContext.sectionId) {
            return { ...s, questions: [...s.questions, ...questionsToAdd] };
          }
          return s;
        });
        updatePaper(insertContext.paperId, { sections: updatedSections });
        clearSectionInsertContext();
        navigate({ to: `/editor/${insertContext.paperId}/real-paper` });
        return;
      }
    }

    // Fallback: add to personal bank
    addQuestions(questionsToAdd);
    setGeneratedQuestions([]);
    navigate({ to: '/question-bank', search: { tab: 'personal' } });
  };

  const getSectionLabel = () => {
    if (!insertContext) return null;
    const paper = getPaperById(insertContext.paperId);
    if (!paper) return null;
    const sectionIndex = paper.sections.findIndex((s) => s.id === insertContext.sectionId);
    if (sectionIndex === -1) return null;
    return `Section ${String.fromCharCode(65 + sectionIndex)}`;
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Assistant
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate question suggestions based on your preferences
        </p>
      </div>

      {insertContext && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Generating questions for <strong>{getSectionLabel()}</strong> in paper{' '}
            <strong>{getPaperById(insertContext.paperId)?.title}</strong>. Selected questions will be added to this section.
          </AlertDescription>
        </Alert>
      )}

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This is a mock AI generator for demonstration. No external AI providers are used. Questions
          are generated locally based on templates.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Question Preferences</CardTitle>
          <CardDescription>Configure the type of questions you want to generate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="marks">Marks per Question</Label>
              <Select value={marks} onValueChange={setMarks}>
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
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-style">Question Style</Label>
            <Select value={questionStyle} onValueChange={(v) => setQuestionStyle(v as 'numerical' | 'conceptual')}>
              <SelectTrigger id="question-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conceptual">Conceptual (Theory-based)</SelectItem>
                <SelectItem value="numerical">Numerical (Problem-solving)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {questionStyle === 'numerical'
                ? 'Generate calculation-based problems with numerical answers'
                : 'Generate theory and explanation-based questions'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus-area">Topic / Focus Area</Label>
            <Textarea
              id="focus-area"
              placeholder="e.g., Photosynthesis in plants, Quadratic equations, World War II causes..."
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Describe the topic or concept you want questions about. Be specific for better results.
            </p>
          </div>

          <Button onClick={handleGenerate} disabled={!focusArea.trim() || isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Questions</CardTitle>
            <CardDescription>
              Review, edit, and select questions to add to your {insertContext ? 'paper section' : 'question bank'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedQuestions.map((question) => (
              <Card key={question.id} className={question.selected ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={question.selected}
                      onCheckedChange={() => handleToggleQuestion(question.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      {editingId === question.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editDrafts[question.id] || ''}
                            onChange={(e) =>
                              setEditDrafts((prev) => ({ ...prev, [question.id]: e.target.value }))
                            }
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveEdit(question.id)}>
                              <Check className="mr-1 h-3 w-3" />
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                              <X className="mr-1 h-3 w-3" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-foreground">{question.text}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                              {question.marks} Mark{question.marks > 1 ? 's' : ''}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEdit(question.id, question.text)}
                            >
                              <Edit2 className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                {generatedQuestions.filter((q) => q.selected).length} of {generatedQuestions.length}{' '}
                questions selected
              </p>
              <Button
                onClick={handleInsertSelected}
                disabled={generatedQuestions.filter((q) => q.selected).length === 0}
              >
                Insert Selected Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

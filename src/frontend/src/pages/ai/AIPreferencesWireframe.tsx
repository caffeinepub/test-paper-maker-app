import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Plus, Check, Edit2, Trash2, Info } from 'lucide-react';
import { Question, QuestionType } from '../../state/mockData';
import { generateMockQuestions } from '../../lib/ai/mockQuestionGenerator';
import { getSectionInsertContext, clearSectionInsertContext } from '../../lib/editor/sectionInsertContext';

interface GeneratedQuestion {
  id: string;
  text: string;
  marks: number;
  type: string;
  questionType: QuestionType;
  selected: boolean;
  editing: boolean;
}

export function AIPreferencesWireframe() {
  const navigate = useNavigate();
  const { addPersonalQuestion, getPaperById, updatePaper } = useMockStore();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [count, setCount] = useState(5);
  const [focusArea, setFocusArea] = useState('');
  const [questionStyle, setQuestionStyle] = useState<'conceptual' | 'numerical' | 'mixed'>('mixed');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const insertContext = getSectionInsertContext();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const questions = generateMockQuestions({
      focusArea: focusArea || topic,
      marks: '2',
      difficulty,
      questionStyle: questionStyle === 'mixed' ? undefined : questionStyle,
    });

    setGeneratedQuestions(
      questions.map((q) => ({
        ...q,
        type: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        questionType: 'short-answer' as QuestionType,
        selected: false,
        editing: false,
      }))
    );
    setIsGenerating(false);
  };

  const handleToggleSelect = (id: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, selected: !q.selected } : q))
    );
  };

  const handleEdit = (id: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, editing: !q.editing } : q))
    );
  };

  const handleUpdateQuestion = (id: string, text: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, text } : q))
    );
  };

  const handleDelete = (id: string) => {
    setGeneratedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleAddToBank = () => {
    const selectedQuestions = generatedQuestions.filter((q) => q.selected);
    if (selectedQuestions.length === 0) {
      alert('Please select at least one question');
      return;
    }

    selectedQuestions.forEach((q) => {
      const newQuestion: Question = {
        id: `q-${Date.now()}-${Math.random()}`,
        text: q.text,
        marks: q.marks,
        type: q.type,
        questionType: q.questionType,
        headingId: null,
        imageAttachment: null,
      };
      addPersonalQuestion(newQuestion);
    });

    alert(`${selectedQuestions.length} question(s) added to your personal bank!`);
    setGeneratedQuestions([]);
  };

  const handleAddToPaper = () => {
    if (!insertContext) {
      alert('No paper context found. Please navigate from a paper editor.');
      return;
    }

    const selectedQuestions = generatedQuestions.filter((q) => q.selected);
    if (selectedQuestions.length === 0) {
      alert('Please select at least one question');
      return;
    }

    const paper = getPaperById(insertContext.paperId);
    if (!paper) {
      alert('Paper not found');
      return;
    }

    const targetSection = paper.sections.find((s) => s.id === insertContext.sectionId);
    if (!targetSection) {
      alert('Section not found');
      return;
    }

    const headingId = targetSection.headings?.[0]?.id || null;

    const newQuestions: Question[] = selectedQuestions.map((q) => ({
      id: `q-${Date.now()}-${Math.random()}`,
      text: q.text,
      marks: q.marks,
      type: q.type,
      questionType: q.questionType,
      headingId: headingId,
      imageAttachment: null,
    }));

    const updatedSections = paper.sections.map((s) => {
      if (s.id === insertContext.sectionId) {
        return { ...s, questions: [...s.questions, ...newQuestions] };
      }
      return s;
    });

    updatePaper(insertContext.paperId, { sections: updatedSections });
    clearSectionInsertContext();
    alert(`${selectedQuestions.length} question(s) added to paper!`);
    navigate({ to: `/editor/${insertContext.paperId}/real-paper` });
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
    <div className="container mx-auto max-w-6xl p-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Assistant
        </h1>
        <p className="mt-2 text-muted-foreground">
          Generate question suggestions using AI based on your preferences
        </p>
      </div>

      {insertContext && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Generating questions for <strong>{getSectionLabel()}</strong> in paper{' '}
            <strong>{getPaperById(insertContext.paperId)?.title}</strong>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Question Preferences</CardTitle>
            <CardDescription>Configure the AI to generate questions matching your needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Subject</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Quadratic Equations"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="focusArea">Focus Area (Optional)</Label>
              <Textarea
                id="focusArea"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="Specific concepts, formulas, or areas to focus on..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
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

              <div className="space-y-2">
                <Label htmlFor="count">Number of Questions</Label>
                <Input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  min={1}
                  max={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionStyle">Question Style</Label>
              <Select value={questionStyle} onValueChange={(value: any) => setQuestionStyle(value)}>
                <SelectTrigger id="questionStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conceptual">Conceptual (Theory-based)</SelectItem>
                  <SelectItem value="numerical">Numerical (Problem-solving)</SelectItem>
                  <SelectItem value="mixed">Mixed (Both types)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
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

        {/* Generated Questions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Questions</CardTitle>
            <CardDescription>
              {generatedQuestions.length > 0
                ? `${generatedQuestions.filter((q) => q.selected).length} of ${generatedQuestions.length} selected`
                : 'Questions will appear here after generation'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="mb-4 h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Configure your preferences and click "Generate Questions" to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {generatedQuestions.map((question) => (
                  <Card key={question.id} className={question.selected ? 'border-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={question.selected}
                          onChange={() => handleToggleSelect(question.id)}
                          className="mt-1 h-4 w-4 rounded border-border"
                        />
                        <div className="flex-1">
                          {question.editing ? (
                            <Textarea
                              value={question.text}
                              onChange={(e) => handleUpdateQuestion(question.id, e.target.value)}
                              className="mb-2"
                              rows={3}
                            />
                          ) : (
                            <p className="text-sm text-foreground">{question.text}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                              {question.marks} Mark{question.marks > 1 ? 's' : ''}
                            </span>
                            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                              {question.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(question.id)}
                            className="h-8 w-8"
                          >
                            {question.editing ? <Check className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(question.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddToBank} variant="outline" className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Bank
                  </Button>
                  {insertContext && (
                    <Button onClick={handleAddToPaper} className="flex-1">
                      <Check className="mr-2 h-4 w-4" />
                      Add to Paper
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


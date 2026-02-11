import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FloatingAIButton } from '../../components/ai/FloatingAIButton';
import { getSectionInsertContext, clearSectionInsertContext } from '../../lib/editor/sectionInsertContext';
import { BookOpen, Info } from 'lucide-react';

export function QuestionBankWireframe() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { tab?: string };
  const { getStarterQuestions, personalQuestions, getPaperById, updatePaper } = useMockStore();
  const [selectedTab, setSelectedTab] = useState('starter');
  const [insertContext, setInsertContext] = useState(getSectionInsertContext());

  const starterQuestions = getStarterQuestions();

  useEffect(() => {
    // Check if navigation requested a specific tab
    if (search?.tab === 'personal') {
      setSelectedTab('personal');
    }
  }, [search]);

  useEffect(() => {
    setInsertContext(getSectionInsertContext());
  }, []);

  const handleUseQuestion = (questionText: string, marks: 1 | 2 | 3 | 4) => {
    if (!insertContext) return;

    const paper = getPaperById(insertContext.paperId);
    if (!paper) return;

    const newQuestion = {
      id: `q-${Date.now()}`,
      text: questionText,
      marks,
      source: 'personal' as const,
      questionType: 'short-answer' as const,
    };

    const updatedSections = paper.sections.map((s) => {
      if (s.id === insertContext.sectionId) {
        return { ...s, questions: [...s.questions, newQuestion] };
      }
      return s;
    });

    updatePaper(insertContext.paperId, { sections: updatedSections });
    clearSectionInsertContext();
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
        <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
        <p className="mt-2 text-muted-foreground">
          Browse starter questions or manage your personal collection
        </p>
      </div>

      {insertContext && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Adding question to <strong>{getSectionLabel()}</strong> for paper{' '}
            <strong>{getPaperById(insertContext.paperId)?.title}</strong>. Click "Use" on any question to add it.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="starter">Starter Questions</TabsTrigger>
          <TabsTrigger value="personal">My Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="starter" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Starter Question Bank</CardTitle>
              <CardDescription>
                Built-in example questions. These are read-only and shared across all users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {starterQuestions.map((question) => (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-foreground">{question.text}</p>
                          <div className="mt-2 flex gap-2">
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                              {question.marks} Mark{question.marks > 1 ? 's' : ''}
                            </span>
                            {question.type && (
                              <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                {question.type}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseQuestion(question.text, question.marks)}
                          disabled={!insertContext}
                        >
                          Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Questions</CardTitle>
              <CardDescription>
                Your personal question library. Questions are added when you save them from the
                question entry screen or AI assistant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {personalQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold text-foreground">
                    No personal questions yet
                  </h3>
                  <p className="mb-6 text-center text-muted-foreground">
                    Questions you create in the paper editor or AI assistant are automatically saved here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {personalQuestions.map((question) => (
                    <Card key={question.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-foreground">{question.text}</p>
                            <div className="mt-2 flex gap-2">
                              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                {question.marks} Mark{question.marks > 1 ? 's' : ''}
                              </span>
                              {question.type && (
                                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                  {question.type}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUseQuestion(question.text, question.marks)}
                              disabled={!insertContext}
                            >
                              Use
                            </Button>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FloatingAIButton />
    </div>
  );
}

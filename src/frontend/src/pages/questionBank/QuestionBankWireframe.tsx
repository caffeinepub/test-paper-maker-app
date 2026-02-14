import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FloatingAIButton } from '../../components/ai/FloatingAIButton';
import { getSectionInsertContext } from '../../lib/editor/sectionInsertContext';
import { Info, BookOpen, PlusCircle } from 'lucide-react';
import { BOARDS, STANDARDS } from '../../lib/questionBank/questionBankTaxonomy';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function QuestionBankWireframe() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { tab?: string };
  const { getPaperById } = useMockStore();
  const [selectedTab, setSelectedTab] = useState('starter');
  const [selectedBoard, setSelectedBoard] = useState<string>('CBSE');
  const [insertContext, setInsertContext] = useState(getSectionInsertContext());

  useEffect(() => {
    // Check if navigation requested a specific tab
    if (search?.tab === 'personal') {
      setSelectedTab('personal');
    }
  }, [search]);

  useEffect(() => {
    setInsertContext(getSectionInsertContext());
  }, []);

  const handleStandardClick = (standard: string) => {
    navigate({
      to: '/question-bank/$board/$standard',
      params: { board: selectedBoard, standard },
      search: { tab: selectedTab },
    });
  };

  const handleAddQuestions = () => {
    navigate({ to: '/add-questions' });
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
    <div className="container mx-auto max-w-6xl p-4 py-8 page-with-floating-ui">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
          <p className="mt-2 text-muted-foreground">
            Select a board and standard to browse available questions. Add questions to sections to build your question paper.
          </p>
        </div>
        <Button onClick={handleAddQuestions} variant="outline" size="sm" className="shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Questions
        </Button>
      </div>

      {insertContext && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Adding question to <strong>{getSectionLabel()}</strong> for paper{' '}
            <strong>{getPaperById(insertContext.paperId)?.title}</strong>. Select a standard to browse questions.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="starter">Starter Questions</TabsTrigger>
          <TabsTrigger value="personal">My Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="starter" className="mt-6">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">Select Board</label>
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOARDS.map((board) => (
                  <SelectItem key={board} value={board}>
                    {board}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STANDARDS.map((standard) => (
              <Card
                key={standard}
                className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                onClick={() => handleStandardClick(standard)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{standard}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>Browse questions for {standard}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="personal" className="mt-6">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">Select Board</label>
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOARDS.map((board) => (
                  <SelectItem key={board} value={board}>
                    {board}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STANDARDS.map((standard) => (
              <Card
                key={standard}
                className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                onClick={() => handleStandardClick(standard)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{standard}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>Browse your questions for {standard}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <FloatingAIButton />
    </div>
  );
}

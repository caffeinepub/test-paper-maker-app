import { useNavigate } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingAIButton } from '../../components/ai/FloatingAIButton';
import { Plus, FileText, Clock, Calendar, PlusCircle } from 'lucide-react';
import { createNewPaper } from '../../lib/papers/createNewPaper';

export function HomeDashboardWireframe() {
  const navigate = useNavigate();
  const { isInitialized, profile, papers, addPaper } = useMockStore();

  const handleCreatePaper = () => {
    // Wait for store to be initialized before creating paper
    if (!isInitialized) return;

    const newPaper = createNewPaper(profile);
    addPaper(newPaper);
    navigate({ to: `/editor/${newPaper.id}` });
  };

  const handleAddQuestions = () => {
    navigate({ to: '/add-questions' });
  };

  const recentPapers = papers.slice(0, 3);

  const handlePaperClick = (paperId: string) => {
    // Only navigate if store is initialized
    if (!isInitialized) return;
    navigate({ to: `/editor/${paperId}` });
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8 page-with-floating-ui">
      {/* Header with Add Questions button */}
      <div className="mb-8 flex items-start justify-between gap-4" data-coachmark="home-welcome">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile.teacherName || 'Teacher'}!</h1>
          <p className="mt-2 text-muted-foreground">
            {profile.instituteName} • {profile.preferredBoard} • Standard {profile.defaultStandard}
          </p>
        </div>
        <Button onClick={handleAddQuestions} variant="outline" size="sm" className="shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Questions
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          id="create-paper-cta"
          data-coachmark="create-paper-cta"
          className={`border-2 border-primary transition-all ${
            isInitialized ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-50'
          }`}
          onClick={handleCreatePaper}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Create New Paper</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>Start building a new test paper from scratch</CardDescription>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg"
          onClick={() => navigate({ to: '/question-bank' })}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <FileText className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle>Question Bank</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>Browse and manage your question library</CardDescription>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg"
          onClick={() => navigate({ to: '/ai' })}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent p-2">
                <FileText className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>AI Assistant</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>Generate questions using AI</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Recent Papers */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Recent Papers</h2>
          <Button variant="ghost" onClick={() => navigate({ to: '/papers' })}>
            View All
          </Button>
        </div>

        {recentPapers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground">No papers yet. Create your first paper to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPapers.map((paper) => (
              <Card
                key={paper.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => handlePaperClick(paper.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{paper.title}</CardTitle>
                  <CardDescription>{paper.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {paper.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {paper.duration}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <FloatingAIButton />
    </div>
  );
}

import { useNavigate } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingAIButton } from '../../components/ai/FloatingAIButton';
import { Plus, FileText, Clock, Calendar } from 'lucide-react';
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

  const recentPapers = papers.slice(0, 3);

  const handlePaperClick = (paperId: string) => {
    // Only navigate if store is initialized
    if (!isInitialized) return;
    navigate({ to: `/editor/${paperId}` });
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8">
      {/* Header */}
      <div className="mb-8" data-coachmark="home-welcome">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile.teacherName || 'Teacher'}!</h1>
        <p className="mt-2 text-muted-foreground">
          {profile.instituteName} • {profile.preferredBoard} • Standard {profile.defaultStandard}
        </p>
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
            <CardDescription>Generate question suggestions with AI</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recently created or edited papers</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPapers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No papers yet. Create your first paper to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPapers.map((paper) => (
                <Card
                  key={paper.id}
                  className={`transition-all ${
                    isInitialized
                      ? 'cursor-pointer hover:border-primary hover:shadow-md'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  onClick={() => handlePaperClick(paper.id)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-muted p-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{paper.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {paper.board} • Standard {paper.standard} • {paper.totalMarks} marks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {paper.timeMinutes} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {paper.createdAt instanceof Date
                          ? paper.createdAt.toLocaleDateString()
                          : new Date(paper.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FloatingAIButton />
    </div>
  );
}

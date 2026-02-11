import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useMockStore } from '../../state/mockStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FloatingAIButton } from '../../components/ai/FloatingAIButton';
import { Plus, X, Info, AlertCircle, FileEdit, Pencil, Trash2 } from 'lucide-react';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { QuestionHeading } from '../../state/mockData';

export function PaperEditorWireframe() {
  const navigate = useNavigate();
  const { paperId } = useParams({ from: '/editor/$paperId' });
  const { isInitialized, profile, getPaperById, updatePaper } = useMockStore();

  const paper = getPaperById(paperId);

  const isInitialLoadRef = useRef(true);
  const lastSavedDataRef = useRef<string>('');

  const [paperData, setPaperData] = useState({
    title: '',
    totalMarks: 25,
    timeMinutes: 45,
    board: profile.preferredBoard,
    standard: profile.defaultStandard || '',
    medium: profile.medium,
  });

  const [sections, setSections] = useState<Array<{ 
    id: string; 
    marks: number; 
    questions: number; 
    plannedQuestionCount: number;
    headings: QuestionHeading[];
  }>>([]);
  const [showSuggestion, setShowSuggestion] = useState(true);

  useEffect(() => {
    if (paper && isInitialized) {
      isInitialLoadRef.current = true;

      setPaperData({
        title: paper.title,
        totalMarks: paper.totalMarks,
        timeMinutes: paper.timeMinutes,
        board: paper.board,
        standard: paper.standard || '',
        medium: paper.medium,
      });

      const editorSections = paper.sections.map((s) => ({
        id: s.id,
        marks: s.marks,
        questions: s.questions.length,
        plannedQuestionCount: s.plannedQuestionCount ?? s.questions.length,
        headings: s.headings || [],
      }));
      setSections(editorSections);

      const initialState = JSON.stringify({
        ...paperData,
        sections: editorSections,
      });
      lastSavedDataRef.current = initialState;

      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 100);
    }
  }, [paperId, isInitialized]);

  useDebouncedEffect(
    () => {
      if (!paper || !isInitialized || isInitialLoadRef.current) {
        return;
      }

      const currentState = {
        ...paperData,
        sections: sections.map((s) => ({
          id: s.id,
          marks: s.marks as 1 | 2 | 3 | 4,
          questions: paper.sections.find((ps) => ps.id === s.id)?.questions || [],
          plannedQuestionCount: s.plannedQuestionCount,
          headings: s.headings,
        })),
      };

      const currentStateStr = JSON.stringify(currentState);

      if (currentStateStr !== lastSavedDataRef.current) {
        updatePaper(paperId, currentState);
        lastSavedDataRef.current = currentStateStr;
      }
    },
    300,
    [paperData, sections, isInitialized, paper?.id]
  );

  const handleAddSection = (marks: number) => {
    const newSection = {
      id: `section-${Date.now()}`,
      marks,
      questions: 0,
      plannedQuestionCount: 0,
      headings: [],
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleAddHeading = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId) {
          const newHeading: QuestionHeading = {
            id: `heading-${Date.now()}`,
            title: '',
            plannedQuestionCount: 0,
          };
          return { ...s, headings: [...s.headings, newHeading] };
        }
        return s;
      })
    );
  };

  const handleUpdateHeading = (sectionId: string, headingId: string, updates: Partial<QuestionHeading>) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            headings: s.headings.map((h) => (h.id === headingId ? { ...h, ...updates } : h)),
          };
        }
        return s;
      })
    );
  };

  const handleRemoveHeading = (sectionId: string, headingId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            headings: s.headings.filter((h) => h.id !== headingId),
          };
        }
        return s;
      })
    );
  };

  const handleContinueToPaper = () => {
    navigate({ to: `/editor/${paperId}/real-paper` });
  };

  const totalAllocated = sections.reduce((sum, s) => sum + s.marks * s.questions, 0);

  const canContinueToPaper = paperData.title.trim() !== '' && sections.length > 0;

  if (!isInitialized) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="text-muted-foreground">Loading paper...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">Paper Not Found</h3>
            <p className="mb-6 text-center text-muted-foreground">
              The paper you're trying to edit doesn't exist or has been deleted.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => navigate({ to: '/papers' })}>View All Papers</Button>
              <Button variant="outline" onClick={() => navigate({ to: '/home' })}>
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Paper Details</h1>
        <p className="mt-2 text-muted-foreground">Set up your test paper structure and sections</p>
      </div>

      <div className="space-y-6">
        {/* Paper Information */}
        <Card>
          <CardHeader>
            <CardTitle>Paper Information</CardTitle>
            <CardDescription>Basic details about your test paper</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Paper Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Science Unit Test - Chapter 1"
                value={paperData.title}
                onChange={(e) => setPaperData({ ...paperData, title: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="board">Board</Label>
                <Select
                  value={paperData.board}
                  onValueChange={(value) => setPaperData({ ...paperData, board: value as 'CBSE' | 'GSEB' | 'Both' })}
                >
                  <SelectTrigger id="board">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="GSEB">GSEB</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="standard">Standard</Label>
                <Input
                  id="standard"
                  placeholder="e.g., 10"
                  value={paperData.standard}
                  onChange={(e) => setPaperData({ ...paperData, standard: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  min="1"
                  value={paperData.totalMarks}
                  onChange={(e) => setPaperData({ ...paperData, totalMarks: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeMinutes">Time (minutes)</Label>
                <Input
                  id="timeMinutes"
                  type="number"
                  min="1"
                  value={paperData.timeMinutes}
                  onChange={(e) => setPaperData({ ...paperData, timeMinutes: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium">Medium</Label>
              <Select
                value={paperData.medium}
                onValueChange={(value) => setPaperData({ ...paperData, medium: value as 'English' | 'Gujarati' })}
              >
                <SelectTrigger id="medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Gujarati">Gujarati</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Sections</CardTitle>
            <CardDescription>Organize your paper into sections by marks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.map((section, idx) => (
              <Card key={section.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Section {String.fromCharCode(65 + idx)} - {section.marks} Mark Questions
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSection(section.id)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Question Headings */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Question Headings</Label>
                    {section.headings.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No headings yet. Add a heading to organize questions.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {section.headings.map((heading) => (
                          <div key={heading.id} className="flex items-center gap-2 rounded-md border p-2">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input
                                placeholder="Heading title (e.g., MCQ)"
                                value={heading.title}
                                onChange={(e) =>
                                  handleUpdateHeading(section.id, heading.id, { title: e.target.value })
                                }
                                className="h-8 text-sm"
                              />
                              <Input
                                type="number"
                                min="0"
                                placeholder="# of questions"
                                value={heading.plannedQuestionCount}
                                onChange={(e) =>
                                  handleUpdateHeading(section.id, heading.id, {
                                    plannedQuestionCount: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveHeading(section.id, heading.id)}
                              className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddHeading(section.id)}
                      className="gap-2"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Heading
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sections.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                No sections yet. Add a section to get started.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleAddSection(1)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add 1 Mark Section
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAddSection(2)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add 2 Mark Section
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAddSection(3)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add 3 Mark Section
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAddSection(4)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add 4 Mark Section
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleContinueToPaper}
            disabled={!canContinueToPaper}
            className="gap-2"
          >
            <FileEdit className="h-5 w-5" />
            Continue to Paper
          </Button>
        </div>

        {!canContinueToPaper && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Complete Required Fields</AlertTitle>
            <AlertDescription>
              Please provide a paper title and add at least one section before continuing.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <FloatingAIButton />
    </div>
  );
}

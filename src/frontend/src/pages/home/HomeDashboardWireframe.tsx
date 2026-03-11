import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "@tanstack/react-router";
import {
  BookTemplate,
  Calendar,
  Clock,
  FileText,
  LayoutTemplate,
  Plus,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { FloatingAIButton } from "../../components/ai/FloatingAIButton";
import {
  BUILT_IN_TEMPLATES,
  type PaperTemplate,
  type SavedTemplate,
  deleteTemplate,
  getSavedTemplates,
  templateSectionsToEditorSections,
} from "../../lib/editor/paperTemplates";
import { useLanguage } from "../../lib/i18n/useLanguage";
import { createNewPaper } from "../../lib/papers/createNewPaper";
import { useMockStore } from "../../state/mockStore";

export function HomeDashboardWireframe() {
  const navigate = useNavigate();
  const { isInitialized, profile, papers, addPaper } = useMockStore();
  const { t } = useLanguage();
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(() =>
    getSavedTemplates(),
  );

  const handleCreatePaper = () => {
    if (!isInitialized) return;
    const newPaper = createNewPaper(profile);
    addPaper(newPaper);
    navigate({ to: `/editor/${newPaper.id}` });
  };

  const handleAddQuestions = () => {
    navigate({ to: "/add-questions" });
  };

  const handleApplyTemplate = (template: PaperTemplate | SavedTemplate) => {
    if (!isInitialized) return;
    const newPaper = createNewPaper(profile);
    const newSections = templateSectionsToEditorSections(template);
    const paperWithTemplate = {
      ...newPaper,
      totalMarks: template.totalMarks,
      timeMinutes: template.timeMinutes,
      board: template.board,
      sections: newSections.map((s) => ({
        ...s,
        questions: [],
      })),
    };
    addPaper(paperWithTemplate);
    setShowTemplatesDialog(false);
    toast.success(`Template "${template.name}" applied — paper created`);
    navigate({ to: `/editor/${paperWithTemplate.id}` });
  };

  const handleDeleteSavedTemplate = (templateId: string) => {
    deleteTemplate(templateId);
    setSavedTemplates(getSavedTemplates());
    toast.success("Template deleted");
  };

  const recentPapers = papers.slice(0, 3);

  const handlePaperClick = (paperId: string) => {
    if (!isInitialized) return;
    navigate({ to: `/editor/${paperId}` });
  };

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8 page-with-floating-ui">
      {/* Header with Add Questions button + Language Switcher */}
      <div
        className="mb-8 flex items-start justify-between gap-4"
        data-coachmark="home-welcome"
      >
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {t("msg.welcomeBack")}, {profile.teacherName || "Teacher"}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            {profile.instituteName} • {profile.preferredBoard} • Standard{" "}
            {profile.defaultStandard}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher variant="compact" />
          <Button onClick={handleAddQuestions} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("btn.addQuestion")}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          id="create-paper-cta"
          data-coachmark="create-paper-cta"
          className={`border-2 border-primary transition-all ${
            isInitialized
              ? "cursor-pointer hover:shadow-lg"
              : "cursor-not-allowed opacity-50"
          }`}
          onClick={handleCreatePaper}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>{t("btn.createPaper")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Start building a new test paper from scratch
            </CardDescription>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg"
          onClick={() => navigate({ to: "/question-bank" })}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <FileText className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle>{t("heading.questionBank")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Browse and manage your question library
            </CardDescription>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg"
          onClick={() => navigate({ to: "/ai" })}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent p-2">
                <FileText className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>{t("nav.aiAssistant")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>Generate questions using AI</CardDescription>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-lg"
          onClick={() => setShowTemplatesDialog(true)}
          data-ocid="home.open_modal_button"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <LayoutTemplate className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{t("heading.paperTemplates")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Start from a CBSE/GSEB template or your saved layouts
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Recent Papers */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            {t("heading.recentPapers")}
          </h2>
          <Button variant="ghost" onClick={() => navigate({ to: "/papers" })}>
            {t("btn.viewAll")}
          </Button>
        </div>

        {recentPapers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground">{t("msg.noPapersYet")}</p>
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

      {/* Templates Dialog */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          data-ocid="home.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-primary" />
              {t("heading.paperTemplates")}
            </DialogTitle>
            <DialogDescription>
              Choose a template to create a new paper with pre-built structure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Built-in templates */}
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Built-in Templates
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {BUILT_IN_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="group rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    data-ocid={`home.item.${idx + 1}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="text-2xl">{tpl.icon}</span>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {tpl.totalMarks}M
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {tpl.timeMinutes}min
                        </Badge>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground group-hover:text-primary">
                      {tpl.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {tpl.description}
                    </p>
                    <p className="mt-2 text-xs text-primary">
                      {tpl.sections.length} section
                      {tpl.sections.length !== 1 ? "s" : ""} &middot;{" "}
                      {tpl.board}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Saved templates */}
            {savedTemplates.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    My Saved Templates
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {savedTemplates.map((tpl, idx) => (
                      <div
                        key={tpl.id}
                        className="group relative rounded-lg border border-border bg-card p-4"
                        data-ocid={`home.item.${idx + 1}`}
                      >
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedTemplate(tpl.id)}
                          className="absolute right-2 top-2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                          title="Delete template"
                          data-ocid={`home.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyTemplate(tpl)}
                          className="w-full text-left"
                        >
                          <div className="mb-2 flex items-start gap-2">
                            <BookTemplate className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {tpl.totalMarks}M
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {tpl.timeMinutes}min
                              </Badge>
                            </div>
                          </div>
                          <p className="font-semibold text-foreground">
                            {tpl.name}
                          </p>
                          {tpl.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {tpl.description}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-primary">
                            {tpl.sections.length} section
                            {tpl.sections.length !== 1 ? "s" : ""} &middot;{" "}
                            {tpl.board}
                          </p>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

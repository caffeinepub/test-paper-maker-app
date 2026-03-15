import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  ChevronRight,
  FolderOpen,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { FloatingAIButton } from "../../components/ai/FloatingAIButton";
import { SUBJECT_COLOURS } from "../../lib/questionBank/questionBankTaxonomy";
import { useMockStore } from "../../state/mockStore";

export function QuestionBankChaptersWireframe() {
  const navigate = useNavigate();
  const { board, standardId, subjectId } = useParams({
    from: "/question-bank/$board/$standardId/subjects/$subjectId/chapters",
  });
  const search = useSearch({ strict: false }) as { tab?: string };
  const selectedTab = search?.tab || "personal";

  const {
    standards,
    addChapter,
    renameChapter,
    deleteChapter,
    reorderChapter,
    personalQuestions,
    getStarterQuestions,
    getQuestionCountForChapter,
  } = useMockStore();

  const standard = standards.find((s) => s.id === standardId);
  const subject = standard?.subjects.find((s) => s.id === subjectId);
  const chapters = subject?.chapters ?? [];

  const subjectColour = subject
    ? SUBJECT_COLOURS[subject.colourIndex % SUBJECT_COLOURS.length]
    : "#7c3aed";

  const [newChapterName, setNewChapterName] = useState("");
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterName, setEditChapterName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!standard || !subject) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <p className="text-muted-foreground">Subject not found.</p>
        <Button
          variant="ghost"
          onClick={() =>
            navigate({
              to: "/question-bank/$board/$standardId/subjects",
              params: { board, standardId },
            })
          }
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Subjects
        </Button>
      </div>
    );
  }

  // Count questions with no chapter assigned (for Uncategorized card)
  const starterQs = getStarterQuestions().filter(
    (q) => q.standard === standard.name && q.subject === subject.name,
  );

  const uncategorizedCount = (() => {
    if (selectedTab === "starter") {
      return starterQs.filter((q) => !q.chapter).length;
    }
    return personalQuestions.filter(
      (q) =>
        q.standard === standard.name &&
        q.subject === subject.name &&
        !q.chapter,
    ).length;
  })();

  const getChapterCount = (chapterName: string) => {
    if (selectedTab === "starter") {
      return starterQs.filter((q) => q.chapter === chapterName).length;
    }
    return getQuestionCountForChapter(
      standardId,
      subjectId,
      chapters.find((c) => c.name === chapterName)?.id ?? "",
    );
  };

  const handleChapterClick = (chapterId: string) => {
    navigate({
      to: "/question-bank/$board/$standardId/subjects/$subjectId/chapters/$chapterId",
      params: { board, standardId, subjectId, chapterId },
      search: { tab: selectedTab },
    });
  };

  const handleBack = () => {
    navigate({
      to: "/question-bank/$board/$standardId/subjects",
      params: { board, standardId },
      search: { tab: selectedTab },
    });
  };

  const handleAddChapter = () => {
    if (!newChapterName.trim()) return;
    addChapter(standardId, subjectId, newChapterName.trim());
    setNewChapterName("");
    setShowAddChapter(false);
  };

  const handleStartRename = (chapterId: string, name: string) => {
    setEditingChapterId(chapterId);
    setEditChapterName(name);
  };

  const handleSaveRename = (chapterId: string) => {
    if (!editChapterName.trim()) return;
    renameChapter(standardId, subjectId, chapterId, editChapterName.trim());
    setEditingChapterId(null);
  };

  const handleDeleteChapter = (chapterId: string) => {
    const count = getQuestionCountForChapter(standardId, subjectId, chapterId);
    if (count > 0) {
      setDeleteConfirmId(chapterId);
    } else {
      deleteChapter(standardId, subjectId, chapterId);
    }
  };

  const handleConfirmDelete = (chapterId: string) => {
    deleteChapter(standardId, subjectId, chapterId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <Button variant="ghost" onClick={handleBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {standard.name} Subjects
      </Button>

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 flex-shrink-0 rounded-full"
            style={{ backgroundColor: subjectColour }}
          />
          <h1 className="text-2xl font-bold text-foreground">
            {subject.name} — Chapters
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {board} &middot; {standard.name} &middot; Select a chapter to view
          questions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Uncategorized card — shown when there are questions without a chapter */}
        {(uncategorizedCount > 0 || selectedTab === "starter") && (
          <Card
            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/40"
            onClick={() => handleChapterClick("uncategorized")}
            data-ocid="chapters.item.1"
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                  <FolderOpen className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground leading-tight">
                    Uncategorized
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {uncategorizedCount} question
                    {uncategorizedCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chapter cards */}
        {chapters.map((chapter, idx) => {
          const isEditing = editingChapterId === chapter.id;
          const isConfirmingDelete = deleteConfirmId === chapter.id;
          const count = getChapterCount(chapter.name);
          const colour = SUBJECT_COLOURS[(idx + 2) % SUBJECT_COLOURS.length];

          if (isConfirmingDelete) {
            return (
              <Card
                key={chapter.id}
                className="border-destructive/50 bg-destructive/5"
                data-ocid={`chapters.item.${idx + 2}`}
              >
                <CardContent className="p-3">
                  <p className="mb-2 text-sm text-destructive">
                    This chapter has {count} question
                    {count !== 1 ? "s" : ""}. Delete anyway?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleConfirmDelete(chapter.id)}
                      data-ocid={`chapters.confirm_button.${idx + 2}`}
                    >
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setDeleteConfirmId(null)}
                      data-ocid={`chapters.cancel_button.${idx + 2}`}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card
              key={chapter.id}
              className="transition-all hover:shadow-md"
              data-ocid={`chapters.item.${idx + 2}`}
            >
              <CardContent className="p-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      autoFocus
                      value={editChapterName}
                      onChange={(e) => setEditChapterName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(chapter.id);
                        if (e.key === "Escape") setEditingChapterId(null);
                      }}
                      className="flex-1 h-8 text-sm"
                      data-ocid={`chapters.input.${idx + 2}`}
                    />
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleSaveRename(chapter.id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-1"
                      onClick={() => setEditingChapterId(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex flex-1 items-start gap-2 text-left"
                      onClick={() => handleChapterClick(chapter.id)}
                    >
                      <span
                        className="mt-1 inline-block h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: colour }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground leading-tight">
                          {chapter.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {count} question{count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </button>

                    {/* Controls */}
                    <div className="flex flex-shrink-0 flex-col gap-0.5">
                      {!chapter.isDefault && (
                        <button
                          type="button"
                          title="Rename"
                          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            handleStartRename(chapter.id, chapter.name)
                          }
                          data-ocid={`chapters.edit_button.${idx + 2}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Move up"
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={idx === 0}
                        onClick={() =>
                          reorderChapter(standardId, subjectId, idx, idx - 1)
                        }
                        data-ocid={`chapters.toggle.${idx + 2}`}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        title="Move down"
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={idx === chapters.length - 1}
                        onClick={() =>
                          reorderChapter(standardId, subjectId, idx, idx + 1)
                        }
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      {!chapter.isDefault && (
                        <button
                          type="button"
                          title="Delete"
                          className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteChapter(chapter.id)}
                          data-ocid={`chapters.delete_button.${idx + 2}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Add Chapter card */}
        {showAddChapter ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Input
                  autoFocus
                  placeholder="Chapter name"
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddChapter();
                    if (e.key === "Escape") {
                      setShowAddChapter(false);
                      setNewChapterName("");
                    }
                  }}
                  className="flex-1 h-8 text-sm"
                  data-ocid="chapters.input"
                />
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleAddChapter}
                  data-ocid="chapters.save_button"
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-1"
                  onClick={() => {
                    setShowAddChapter(false);
                    setNewChapterName("");
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card
            className="cursor-pointer border-dashed border-2 transition-all hover:border-primary/60 hover:bg-primary/5"
            onClick={() => setShowAddChapter(true)}
            data-ocid="chapters.open_modal_button"
          >
            <CardContent className="flex items-center justify-center gap-2 p-3">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Add Chapter</span>
            </CardContent>
          </Card>
        )}
      </div>

      {chapters.length === 0 && uncategorizedCount === 0 && (
        <div
          className="mt-8 flex flex-col items-center justify-center text-center"
          data-ocid="chapters.empty_state"
        >
          <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No chapters yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Add your first chapter to organize questions
          </p>
        </div>
      )}

      <FloatingAIButton />
    </div>
  );
}

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
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { FloatingAIButton } from "../../components/ai/FloatingAIButton";
import { getSectionInsertContext } from "../../lib/editor/sectionInsertContext";
import { SUBJECT_COLOURS } from "../../lib/questionBank/questionBankTaxonomy";
import { useMockStore } from "../../state/mockStore";

export function QuestionBankSubjectsWireframe() {
  const navigate = useNavigate();
  const { board, standardId } = useParams({
    from: "/question-bank/$board/$standardId/subjects",
  });
  const search = useSearch({ strict: false }) as { tab?: string };
  const selectedTab = search?.tab || "personal";

  const {
    standards,
    addSubject,
    renameSubject,
    deleteSubject,
    reorderSubject,
    personalQuestions,
    getStarterQuestions,
  } = useMockStore();

  const standard = standards.find((s) => s.id === standardId);

  const [newSubjectName, setNewSubjectName] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  // insertContext kept for future use (paper editor insert flow)
  const _insertContext = getSectionInsertContext();

  if (!standard) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-8">
        <p className="text-muted-foreground">Standard not found.</p>
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/question-bank" })}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Question Bank
        </Button>
      </div>
    );
  }

  const getCountForSubject = (subjectName: string) => {
    if (selectedTab === "starter") {
      return getStarterQuestions().filter(
        (q) => q.standard === standard.name && q.subject === subjectName,
      ).length;
    }
    return personalQuestions.filter(
      (q) => q.standard === standard.name && q.subject === subjectName,
    ).length;
  };

  const handleSubjectClick = (subjectId: string, subjectName: string) => {
    navigate({
      to: "/question-bank/$board/$standardId/subjects/$subjectId/chapters",
      params: { board, standardId, subjectId },
      search: { tab: selectedTab, subjectName },
    });
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    addSubject(standardId, newSubjectName.trim());
    setNewSubjectName("");
    setShowAddSubject(false);
  };

  const handleStartRename = (subjectId: string, currentName: string) => {
    setEditingSubjectId(subjectId);
    setEditSubjectName(currentName);
  };

  const handleSaveRename = () => {
    if (editingSubjectId && editSubjectName.trim()) {
      renameSubject(standardId, editingSubjectId, editSubjectName.trim());
    }
    setEditingSubjectId(null);
    setEditSubjectName("");
  };

  const handleDeleteSubject = (subjectId: string) => {
    const subj = standard.subjects.find((s) => s.id === subjectId);
    if (!subj) return;
    // Count questions for this subject
    const count = personalQuestions.filter(
      (q) => q.standard === standard.name && q.subject === subj.name,
    ).length;
    if (count > 0) {
      setDeleteConfirmId(subjectId);
    } else {
      deleteSubject(standardId, subjectId);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8 page-with-floating-ui">
      <Button
        variant="ghost"
        onClick={() =>
          navigate({ to: "/question-bank", search: { tab: selectedTab } })
        }
        className="mb-4"
        data-ocid="subjects.back_button"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Question Bank
      </Button>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {standard.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a subject to browse questions
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddSubject(true)}
          data-ocid="subjects.add_subject_button"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Add subject inline form */}
      {showAddSubject && (
        <Card className="mb-4 border-primary/40">
          <CardContent className="flex items-center gap-2 p-3">
            <Input
              autoFocus
              placeholder="Subject name (e.g. Physics)"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubject();
                if (e.key === "Escape") {
                  setShowAddSubject(false);
                  setNewSubjectName("");
                }
              }}
              className="flex-1"
              data-ocid="subjects.add_subject_input"
            />
            <Button
              size="sm"
              onClick={handleAddSubject}
              data-ocid="subjects.add_subject_save_button"
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddSubject(false);
                setNewSubjectName("");
              }}
              data-ocid="subjects.add_subject_cancel_button"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <Card className="mb-4 border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <p className="mb-3 text-sm text-foreground">
              This subject has questions saved. Deleting it will remove the
              subject label from those questions. Continue?
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  deleteSubject(standardId, deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                data-ocid="subjects.delete_confirm_button"
              >
                Yes, Delete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                data-ocid="subjects.delete_cancel_button"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subjects grid */}
      {standard.subjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="font-medium text-foreground">No subjects yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a subject to start organising questions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {standard.subjects.map((subject, idx) => {
            const colour =
              SUBJECT_COLOURS[subject.colourIndex % SUBJECT_COLOURS.length];
            const count = getCountForSubject(subject.name);
            const isEditing = editingSubjectId === subject.id;

            return (
              <Card
                key={subject.id}
                className="relative transition-all hover:shadow-md"
                data-ocid={`subjects.subject_card.${idx + 1}`}
              >
                <CardContent className="p-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        autoFocus
                        value={editSubjectName}
                        onChange={(e) => setEditSubjectName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename();
                          if (e.key === "Escape") {
                            setEditingSubjectId(null);
                          }
                        }}
                        className="flex-1 h-8 text-sm"
                        data-ocid={`subjects.rename_input.${idx + 1}`}
                      />
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={handleSaveRename}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-1"
                        onClick={() => setEditingSubjectId(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Clickable subject info */}
                      <button
                        type="button"
                        className="flex flex-1 items-start gap-2 text-left"
                        onClick={() =>
                          handleSubjectClick(subject.id, subject.name)
                        }
                      >
                        {/* Colour dot */}
                        <span
                          className="mt-1 inline-block h-3 w-3 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: colour }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground leading-tight">
                            {subject.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {count} question{count !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      </button>

                      {/* Controls */}
                      <div className="flex flex-shrink-0 flex-col gap-0.5">
                        <button
                          type="button"
                          title="Rename"
                          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            handleStartRename(subject.id, subject.name)
                          }
                          data-ocid={`subjects.rename_button.${idx + 1}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Move up"
                          className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={idx === 0}
                          onClick={() =>
                            reorderSubject(standardId, subject.id, "up")
                          }
                          data-ocid={`subjects.move_up_button.${idx + 1}`}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={idx === standard.subjects.length - 1}
                          onClick={() =>
                            reorderSubject(standardId, subject.id, "down")
                          }
                          data-ocid={`subjects.move_down_button.${idx + 1}`}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteSubject(subject.id)}
                          data-ocid={`subjects.delete_button.${idx + 1}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <FloatingAIButton />
    </div>
  );
}

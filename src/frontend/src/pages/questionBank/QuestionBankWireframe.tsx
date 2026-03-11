import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChevronRight,
  Info,
  Pencil,
  Plus,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FloatingAIButton } from "../../components/ai/FloatingAIButton";
import { getSectionInsertContext } from "../../lib/editor/sectionInsertContext";
import { BOARDS } from "../../lib/questionBank/questionBankTaxonomy";
import { useMockStore } from "../../state/mockStore";

export function QuestionBankWireframe() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { tab?: string };
  const {
    getPaperById,
    standards,
    addStandard,
    renameStandard,
    deleteStandard,
    reorderStandard,
    personalQuestions,
  } = useMockStore();
  const [selectedTab, setSelectedTab] = useState("personal");
  const [selectedBoard, setSelectedBoard] = useState<string>("CBSE");
  const [insertContext, setInsertContext] = useState(getSectionInsertContext());
  const [newStandardName, setNewStandardName] = useState("");
  const [showAddStandard, setShowAddStandard] = useState(false);
  const [editingStandardId, setEditingStandardId] = useState<string | null>(
    null,
  );
  const [editStandardName, setEditStandardName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (search?.tab === "personal") {
      setSelectedTab("personal");
    }
  }, [search]);

  useEffect(() => {
    setInsertContext(getSectionInsertContext());
  }, []);

  const handleStandardClick = (standardId: string) => {
    navigate({
      to: "/question-bank/$board/$standardId/subjects",
      params: { board: selectedBoard, standardId },
      search: { tab: selectedTab },
    });
  };

  const handleAddQuestions = () => {
    navigate({ to: "/add-questions" });
  };

  const getSectionLabel = () => {
    if (!insertContext) return null;
    const paper = getPaperById(insertContext.paperId);
    if (!paper) return null;
    const sectionIndex = paper.sections.findIndex(
      (s) => s.id === insertContext.sectionId,
    );
    if (sectionIndex === -1) return null;
    return `Section ${String.fromCharCode(65 + sectionIndex)}`;
  };

  const handleAddStandard = () => {
    if (!newStandardName.trim()) return;
    addStandard(newStandardName.trim());
    setNewStandardName("");
    setShowAddStandard(false);
  };

  const handleStartRenameStandard = (id: string, name: string) => {
    setEditingStandardId(id);
    setEditStandardName(name);
  };

  const handleSaveRename = () => {
    if (editingStandardId && editStandardName.trim()) {
      renameStandard(editingStandardId, editStandardName.trim());
    }
    setEditingStandardId(null);
    setEditStandardName("");
  };

  const handleDeleteStandard = (id: string, name: string) => {
    const hasQuestions = personalQuestions.some((q) => q.standard === name);
    if (hasQuestions) {
      setDeleteConfirmId(id);
    } else {
      deleteStandard(id);
    }
  };

  const StandardGrid = () => (
    <div className="space-y-4">
      {/* Delete confirmation banner */}
      {deleteConfirmId && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <p className="mb-3 text-sm text-foreground">
              This standard has questions saved. Deleting it will remove the
              standard label from those questions. Continue?
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  deleteStandard(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                data-ocid="question_bank.delete_standard_confirm_button"
              >
                Yes, Delete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                data-ocid="question_bank.delete_standard_cancel_button"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add standard inline form */}
      {showAddStandard && (
        <Card className="border-primary/40">
          <CardContent className="flex items-center gap-2 p-3">
            <Input
              autoFocus
              placeholder="Standard name (e.g. Grade 13, Nursery)"
              value={newStandardName}
              onChange={(e) => setNewStandardName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddStandard();
                if (e.key === "Escape") {
                  setShowAddStandard(false);
                  setNewStandardName("");
                }
              }}
              className="flex-1"
              data-ocid="question_bank.add_standard_input"
            />
            <Button
              size="sm"
              onClick={handleAddStandard}
              data-ocid="question_bank.add_standard_save_button"
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddStandard(false);
                setNewStandardName("");
              }}
              data-ocid="question_bank.add_standard_cancel_button"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {standards.map((standard, idx) => {
          const isEditing = editingStandardId === standard.id;
          const isCustom = !standard.isDefault;

          return (
            <Card
              key={standard.id}
              className="relative transition-all hover:shadow-md"
              data-ocid={`question_bank.standard_card.${idx + 1}`}
            >
              <CardContent className="p-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      autoFocus
                      value={editStandardName}
                      onChange={(e) => setEditStandardName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename();
                        if (e.key === "Escape") setEditingStandardId(null);
                      }}
                      className="h-8 flex-1 text-sm"
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
                      onClick={() => setEditingStandardId(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Clickable area */}
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-3 text-left"
                      onClick={() => handleStandardClick(standard.id)}
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground leading-tight">
                          {standard.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {standard.subjects.length} subject
                          {standard.subjects.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </button>

                    {/* Reorder + manage controls */}
                    <div className="flex flex-shrink-0 flex-col gap-0.5">
                      {isCustom && (
                        <>
                          <button
                            type="button"
                            title="Rename"
                            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              handleStartRenameStandard(
                                standard.id,
                                standard.name,
                              )
                            }
                            data-ocid={`question_bank.rename_standard_button.${idx + 1}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleDeleteStandard(standard.id, standard.name)
                            }
                            data-ocid={`question_bank.delete_standard_button.${idx + 1}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        title="Move up"
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={idx === 0}
                        onClick={() => reorderStandard(standard.id, "up")}
                        data-ocid={`question_bank.move_up_standard_button.${idx + 1}`}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        title="Move down"
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={idx === standards.length - 1}
                        onClick={() => reorderStandard(standard.id, "down")}
                        data-ocid={`question_bank.move_down_standard_button.${idx + 1}`}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Add Standard card */}
        <Card
          className="cursor-pointer border-dashed border-muted-foreground/30 transition-all hover:border-primary hover:shadow-md"
          onClick={() => setShowAddStandard(true)}
          data-ocid="question_bank.add_standard_card"
        >
          <CardContent className="flex h-[72px] items-center justify-center p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add Standard</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8 page-with-floating-ui">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
          <p className="mt-2 text-muted-foreground">
            Select a board and standard to browse available questions. Add
            questions to sections to build your question paper.
          </p>
        </div>
        <Button
          onClick={handleAddQuestions}
          variant="outline"
          size="sm"
          className="shrink-0"
          data-ocid="question_bank.add_questions_button"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Questions
        </Button>
      </div>

      {insertContext && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Adding question to <strong>{getSectionLabel()}</strong> for paper{" "}
            <strong>{getPaperById(insertContext.paperId)?.title}</strong>.
            Select a standard to browse questions.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="starter" data-ocid="question_bank.starter_tab">
            Starter Questions
          </TabsTrigger>
          <TabsTrigger value="personal" data-ocid="question_bank.personal_tab">
            My Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="starter" className="mt-6">
          <div className="mb-6">
            <label
              htmlFor="board-select-starter"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Select Board
            </label>
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger id="board-select-starter" className="max-w-xs">
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
          <StandardGrid />
        </TabsContent>

        <TabsContent value="personal" className="mt-6">
          <div className="mb-6">
            <label
              htmlFor="board-select-personal"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Select Board
            </label>
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger id="board-select-personal" className="max-w-xs">
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
          <StandardGrid />
        </TabsContent>
      </Tabs>

      <FloatingAIButton />
    </div>
  );
}

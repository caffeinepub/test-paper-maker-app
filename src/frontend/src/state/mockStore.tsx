import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { normalizeToRichContent } from "../lib/editor/richCellContent";
import {
  SUBJECT_COLOURS,
  type StandardEntry,
  type SubjectEntry,
  buildDefaultStandards,
} from "../lib/questionBank/questionBankTaxonomy";
import {
  isStorageAvailable,
  safeGetItem,
  safeRemoveItem,
  safeSetItem,
} from "../lib/storage/safeStorage";
import {
  type Paper,
  type Profile,
  type Question,
  defaultProfile,
  samplePapers,
  starterQuestions,
} from "./mockData";

interface MockStoreContextType {
  isInitialized: boolean;
  initializationError: string | null;
  retryInitialization: () => void;
  isLoggedIn: boolean;
  onboardingCompleted: boolean;
  profile: Profile;
  papers: Paper[];
  personalQuestions: Question[];
  // Dynamic standards/subjects
  standards: StandardEntry[];
  addStandard: (name: string) => void;
  renameStandard: (standardId: string, name: string) => void;
  deleteStandard: (standardId: string) => void;
  reorderStandard: (standardId: string, direction: "up" | "down") => void;
  addSubject: (standardId: string, name: string) => void;
  renameSubject: (standardId: string, subjectId: string, name: string) => void;
  deleteSubject: (standardId: string, subjectId: string) => void;
  reorderSubject: (
    standardId: string,
    subjectId: string,
    direction: "up" | "down",
  ) => void;
  getSubjectsForStandard: (standardId: string) => SubjectEntry[];
  getQuestionCountForSubject: (standardId: string, subjectId: string) => number;
  login: () => void;
  logout: () => void;
  completeOnboarding: () => void;
  updateProfile: (updates: Partial<Profile>) => void;
  addPaper: (paper: Paper) => void;
  updatePaper: (paperId: string, updates: Partial<Paper>) => void;
  deletePaper: (paperId: string) => void;
  getPaperById: (paperId: string) => Paper | undefined;
  addPersonalQuestion: (question: Question) => void;
  updatePersonalQuestion: (
    questionId: string,
    updates: Partial<Question>,
  ) => void;
  deletePersonalQuestion: (questionId: string) => void;
  getStarterQuestions: () => Question[];
  resetTutorial: () => void;
  clearAllData: () => void;
}

const MockStoreContext = createContext<MockStoreContextType | undefined>(
  undefined,
);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [papers, setPapers] = useState<Paper[]>(samplePapers);
  const [personalQuestions, setPersonalQuestions] = useState<Question[]>([]);
  const [standards, setStandards] = useState<StandardEntry[]>(
    buildDefaultStandards(),
  );

  // Normalize paper data to handle rich content migration
  const normalizePaper = (paper: Paper): Paper => {
    return {
      ...paper,
      sections: paper.sections.map((section) => ({
        ...section,
        headings: section.headings || [],
        questions: section.questions.map((question) => {
          // Normalize table cells
          if (question.questionType === "table" && question.tableData) {
            return {
              ...question,
              tableData: {
                ...question.tableData,
                cells: question.tableData.cells.map((row) =>
                  row.map((cell) => normalizeToRichContent(cell)),
                ),
              },
            };
          }
          // Normalize match-pairs
          if (
            question.questionType === "match-pairs" &&
            question.matchPairsData
          ) {
            return {
              ...question,
              matchPairsData: {
                pairs: question.matchPairsData.pairs.map((pair) => ({
                  left: normalizeToRichContent(pair.left),
                  right: normalizeToRichContent(pair.right),
                })),
              },
            };
          }
          return question;
        }),
      })),
    };
  };

  // Migrate legacy questions to include board/standard metadata
  const migrateQuestion = (question: Question, prof: Profile): Question => {
    if (!question.board || !question.standard) {
      return {
        ...question,
        board: question.board || prof.preferredBoard || "CBSE",
        standard: question.standard || prof.defaultStandard || "Standard 10",
      };
    }
    return question;
  };

  /** Merge saved standards with defaults — ensures new default subjects/standards always appear */
  const mergeWithDefaults = (saved: StandardEntry[]): StandardEntry[] => {
    const defaults = buildDefaultStandards();
    const savedMap = new Map(saved.map((s) => [s.id, s]));

    // Rebuild: for each default keep saved order/subjects if exists, else use fresh default
    const merged = defaults.map((def) => {
      const existing = savedMap.get(def.id);
      if (existing) {
        return { ...def, subjects: existing.subjects };
      }
      return def;
    });

    // Append any custom standards that were saved
    const customSaved = saved.filter((s) => !s.isDefault);
    return [...merged, ...customSaved];
  };

  const initialize = () => {
    try {
      setInitializationError(null);

      if (!isStorageAvailable()) {
        throw new Error(
          "Local storage is not available. Please check your browser settings and ensure cookies/site data are enabled.",
        );
      }

      const storedIsLoggedIn = safeGetItem("isLoggedIn") === "true";
      const storedOnboardingCompleted =
        safeGetItem("onboardingCompleted") === "true";
      const storedProfile = safeGetItem("profile");
      const storedPapers = safeGetItem("papers");
      const storedPersonalQuestions = safeGetItem("personalQuestions");
      const storedStandards = safeGetItem("standards");

      setIsLoggedIn(storedIsLoggedIn);
      setOnboardingCompleted(storedOnboardingCompleted);

      let loadedProfile = defaultProfile;
      if (storedProfile) {
        try {
          loadedProfile = JSON.parse(storedProfile);
          setProfile(loadedProfile);
        } catch {
          setProfile(defaultProfile);
        }
      }

      if (storedPapers) {
        try {
          const parsedPapers = JSON.parse(storedPapers);
          setPapers(parsedPapers.map(normalizePaper));
        } catch {
          setPapers(samplePapers);
        }
      }

      if (storedPersonalQuestions) {
        try {
          const parsedQuestions = JSON.parse(storedPersonalQuestions);
          setPersonalQuestions(
            parsedQuestions.map((q: Question) =>
              migrateQuestion(q, loadedProfile),
            ),
          );
        } catch {
          setPersonalQuestions([]);
        }
      }

      if (storedStandards) {
        try {
          const parsedStandards: StandardEntry[] = JSON.parse(storedStandards);
          setStandards(mergeWithDefaults(parsedStandards));
        } catch {
          setStandards(buildDefaultStandards());
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Initialization error:", error);
      setInitializationError(
        error instanceof Error ? error.message : "Failed to initialize storage",
      );
      setIsInitialized(true);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: initialize is called once on mount
  useEffect(() => {
    initialize();
  }, []);

  const retryInitialization = () => {
    initialize();
  };

  useEffect(() => {
    if (isInitialized && !initializationError) {
      safeSetItem("isLoggedIn", isLoggedIn.toString());
    }
  }, [isLoggedIn, isInitialized, initializationError]);

  useEffect(() => {
    if (isInitialized && !initializationError) {
      safeSetItem("onboardingCompleted", onboardingCompleted.toString());
    }
  }, [onboardingCompleted, isInitialized, initializationError]);

  useEffect(() => {
    if (isInitialized && !initializationError) {
      safeSetItem("profile", JSON.stringify(profile));
    }
  }, [profile, isInitialized, initializationError]);

  useEffect(() => {
    if (isInitialized && !initializationError) {
      safeSetItem("papers", JSON.stringify(papers));
    }
  }, [papers, isInitialized, initializationError]);

  useEffect(() => {
    if (isInitialized && !initializationError) {
      safeSetItem("personalQuestions", JSON.stringify(personalQuestions));
    }
  }, [personalQuestions, isInitialized, initializationError]);

  useEffect(() => {
    if (isInitialized && !initializationError) {
      safeSetItem("standards", JSON.stringify(standards));
    }
  }, [standards, isInitialized, initializationError]);

  const login = () => setIsLoggedIn(true);
  const logout = () => {
    setIsLoggedIn(false);
    setOnboardingCompleted(false);
  };
  const completeOnboarding = () => setOnboardingCompleted(true);

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addPaper = (paper: Paper) => {
    setPapers((prev) => [...prev, paper]);
  };

  const updatePaper = (paperId: string, updates: Partial<Paper>) => {
    setPapers((prev) =>
      prev.map((paper) => {
        if (paper.id === paperId) {
          const updated = { ...paper, ...updates };
          return normalizePaper(updated);
        }
        return paper;
      }),
    );
  };

  const deletePaper = (paperId: string) => {
    setPapers((prev) => prev.filter((paper) => paper.id !== paperId));
  };

  const getPaperById = (paperId: string) => {
    return papers.find((paper) => paper.id === paperId);
  };

  const addPersonalQuestion = (question: Question) => {
    const enrichedQuestion = migrateQuestion(question, profile);
    setPersonalQuestions((prev) => [...prev, enrichedQuestion]);
  };

  const updatePersonalQuestion = (
    questionId: string,
    updates: Partial<Question>,
  ) => {
    setPersonalQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
    );
  };

  const deletePersonalQuestion = (questionId: string) => {
    setPersonalQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const getStarterQuestions = () => {
    return starterQuestions;
  };

  // ── Standards management ──────────────────────────────────────────────────

  const addStandard = (name: string) => {
    const newStandard: StandardEntry = {
      id: `custom-std-${Date.now()}`,
      name: name.trim(),
      isDefault: false,
      subjects: [
        { id: `subj-${Date.now()}-0`, name: "Science", colourIndex: 0 },
        { id: `subj-${Date.now()}-1`, name: "Mathematics", colourIndex: 1 },
        { id: `subj-${Date.now()}-2`, name: "English", colourIndex: 2 },
        { id: `subj-${Date.now()}-3`, name: "Social Science", colourIndex: 3 },
        { id: `subj-${Date.now()}-4`, name: "Hindi", colourIndex: 4 },
        {
          id: `subj-${Date.now()}-5`,
          name: "Computer Science",
          colourIndex: 5,
        },
      ],
    };
    setStandards((prev) => [...prev, newStandard]);
  };

  const renameStandard = (standardId: string, name: string) => {
    setStandards((prev) =>
      prev.map((s) =>
        s.id === standardId && !s.isDefault ? { ...s, name: name.trim() } : s,
      ),
    );
  };

  const deleteStandard = (standardId: string) => {
    setStandards((prev) =>
      prev.filter((s) => !(s.id === standardId && !s.isDefault)),
    );
  };

  const reorderStandard = (standardId: string, direction: "up" | "down") => {
    setStandards((prev) => {
      const idx = prev.findIndex((s) => s.id === standardId);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  // ── Subjects management ───────────────────────────────────────────────────

  const addSubject = (standardId: string, name: string) => {
    setStandards((prev) =>
      prev.map((s) => {
        if (s.id !== standardId) return s;
        const colourIndex = s.subjects.length % SUBJECT_COLOURS.length;
        const newSubject: SubjectEntry = {
          id: `subj-${Date.now()}`,
          name: name.trim(),
          colourIndex,
        };
        return { ...s, subjects: [...s.subjects, newSubject] };
      }),
    );
  };

  const renameSubject = (
    standardId: string,
    subjectId: string,
    name: string,
  ) => {
    setStandards((prev) =>
      prev.map((s) => {
        if (s.id !== standardId) return s;
        return {
          ...s,
          subjects: s.subjects.map((sub) =>
            sub.id === subjectId ? { ...sub, name: name.trim() } : sub,
          ),
        };
      }),
    );
  };

  const deleteSubject = (standardId: string, subjectId: string) => {
    setStandards((prev) =>
      prev.map((s) => {
        if (s.id !== standardId) return s;
        return {
          ...s,
          subjects: s.subjects.filter((sub) => sub.id !== subjectId),
        };
      }),
    );
  };

  const reorderSubject = (
    standardId: string,
    subjectId: string,
    direction: "up" | "down",
  ) => {
    setStandards((prev) =>
      prev.map((s) => {
        if (s.id !== standardId) return s;
        const idx = s.subjects.findIndex((sub) => sub.id === subjectId);
        if (idx === -1) return s;
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= s.subjects.length) return s;
        const arr = [...s.subjects];
        [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
        return { ...s, subjects: arr };
      }),
    );
  };

  const getSubjectsForStandard = (standardId: string): SubjectEntry[] => {
    return standards.find((s) => s.id === standardId)?.subjects ?? [];
  };

  const getQuestionCountForSubject = (
    standardId: string,
    subjectId: string,
  ): number => {
    const std = standards.find((s) => s.id === standardId);
    if (!std) return 0;
    const subj = std.subjects.find((s) => s.id === subjectId);
    if (!subj) return 0;
    return personalQuestions.filter(
      (q) => q.standard === std.name && q.subject === subj.name,
    ).length;
  };

  // ─────────────────────────────────────────────────────────────────────────

  const resetTutorial = () => {
    safeRemoveItem("coachmarks-completed");
    safeRemoveItem("coachmarks-active");
    safeRemoveItem("real-paper-toolbox-spotlight-completed");
  };

  const clearAllData = () => {
    setPapers([]);
    setPersonalQuestions([]);
    safeRemoveItem("papers");
    safeRemoveItem("personalQuestions");
  };

  const value: MockStoreContextType = {
    isInitialized,
    initializationError,
    retryInitialization,
    isLoggedIn,
    onboardingCompleted,
    profile,
    papers,
    personalQuestions,
    standards,
    addStandard,
    renameStandard,
    deleteStandard,
    reorderStandard,
    addSubject,
    renameSubject,
    deleteSubject,
    reorderSubject,
    getSubjectsForStandard,
    getQuestionCountForSubject,
    login,
    logout,
    completeOnboarding,
    updateProfile,
    addPaper,
    updatePaper,
    deletePaper,
    getPaperById,
    addPersonalQuestion,
    updatePersonalQuestion,
    deletePersonalQuestion,
    getStarterQuestions,
    resetTutorial,
    clearAllData,
  };

  return (
    <MockStoreContext.Provider value={value}>
      {children}
    </MockStoreContext.Provider>
  );
}

export function useMockStore() {
  const context = useContext(MockStoreContext);
  if (context === undefined) {
    throw new Error("useMockStore must be used within a MockStoreProvider");
  }
  return context;
}

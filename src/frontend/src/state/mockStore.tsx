import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, Paper, Question, defaultProfile, samplePapers, starterQuestions } from './mockData';
import { safeGetItem, safeSetItem, safeRemoveItem, isStorageAvailable } from '../lib/storage/safeStorage';
import { normalizeToRichContent } from '../lib/editor/richCellContent';

interface MockStoreContextType {
  isInitialized: boolean;
  initializationError: string | null;
  retryInitialization: () => void;
  isLoggedIn: boolean;
  onboardingCompleted: boolean;
  profile: Profile;
  papers: Paper[];
  personalQuestions: Question[];
  login: () => void;
  logout: () => void;
  completeOnboarding: () => void;
  updateProfile: (updates: Partial<Profile>) => void;
  addPaper: (paper: Paper) => void;
  updatePaper: (paperId: string, updates: Partial<Paper>) => void;
  deletePaper: (paperId: string) => void;
  getPaperById: (paperId: string) => Paper | undefined;
  addPersonalQuestion: (question: Question) => void;
  updatePersonalQuestion: (questionId: string, updates: Partial<Question>) => void;
  deletePersonalQuestion: (questionId: string) => void;
  getStarterQuestions: () => Question[];
  resetTutorial: () => void;
  clearAllData: () => void;
}

const MockStoreContext = createContext<MockStoreContextType | undefined>(undefined);

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [papers, setPapers] = useState<Paper[]>(samplePapers);
  const [personalQuestions, setPersonalQuestions] = useState<Question[]>([]);

  // Normalize paper data to handle rich content migration
  const normalizePaper = (paper: Paper): Paper => {
    return {
      ...paper,
      sections: paper.sections.map((section) => ({
        ...section,
        headings: section.headings || [],
        questions: section.questions.map((question) => {
          // Normalize table cells
          if (question.questionType === 'table' && question.tableData) {
            return {
              ...question,
              tableData: {
                ...question.tableData,
                cells: question.tableData.cells.map((row) =>
                  row.map((cell) => normalizeToRichContent(cell))
                ),
              },
            };
          }
          // Normalize match-pairs
          if (question.questionType === 'match-pairs' && question.matchPairsData) {
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
  const migrateQuestion = (question: Question, profile: Profile): Question => {
    if (!question.board || !question.standard) {
      return {
        ...question,
        board: question.board || profile.preferredBoard || 'CBSE',
        standard: question.standard || profile.defaultStandard || 'Standard 10',
      };
    }
    return question;
  };

  const initialize = () => {
    try {
      setInitializationError(null);

      // Check if storage is available
      if (!isStorageAvailable()) {
        throw new Error(
          'Local storage is not available. Please check your browser settings and ensure cookies/site data are enabled.'
        );
      }

      // Load state from localStorage
      const storedIsLoggedIn = safeGetItem('isLoggedIn') === 'true';
      const storedOnboardingCompleted = safeGetItem('onboardingCompleted') === 'true';
      const storedProfile = safeGetItem('profile');
      const storedPapers = safeGetItem('papers');
      const storedPersonalQuestions = safeGetItem('personalQuestions');

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
          // Normalize all papers
          setPapers(parsedPapers.map(normalizePaper));
        } catch {
          setPapers(samplePapers);
        }
      }

      if (storedPersonalQuestions) {
        try {
          const parsedQuestions = JSON.parse(storedPersonalQuestions);
          // Migrate legacy questions
          setPersonalQuestions(parsedQuestions.map((q: Question) => migrateQuestion(q, loadedProfile)));
        } catch {
          setPersonalQuestions([]);
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Initialization error:', error);
      setInitializationError(
        error instanceof Error ? error.message : 'Failed to initialize storage'
      );
      setIsInitialized(true); // Still mark as initialized to show error UI
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const retryInitialization = () => {
    initialize();
  };

  useEffect(() => {
    if (isInitialized && !initializationError) {
      safeSetItem('isLoggedIn', isLoggedIn.toString());
    }
  }, [isLoggedIn, isInitialized, initializationError]);

  useEffect(() => {
    if (isInitialized && !initializationError) {
      safeSetItem('onboardingCompleted', onboardingCompleted.toString());
    }
  }, [onboardingCompleted, isInitialized, initializationError]);

  useEffect(() => {
    if (isInitialized && !initializationError) {
      safeSetItem('profile', JSON.stringify(profile));
    }
  }, [profile, isInitialized, initializationError]);

  useEffect(() => {
    if (isInitialized && !initializationError) {
      safeSetItem('papers', JSON.stringify(papers));
    }
  }, [papers, isInitialized, initializationError]);

  useEffect(() => {
    if (isInitialized && !initializationError) {
      safeSetItem('personalQuestions', JSON.stringify(personalQuestions));
    }
  }, [personalQuestions, isInitialized, initializationError]);

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
      })
    );
  };

  const deletePaper = (paperId: string) => {
    setPapers((prev) => prev.filter((paper) => paper.id !== paperId));
  };

  const getPaperById = (paperId: string) => {
    return papers.find((paper) => paper.id === paperId);
  };

  const addPersonalQuestion = (question: Question) => {
    // Ensure board/standard metadata is present
    const enrichedQuestion = migrateQuestion(question, profile);
    setPersonalQuestions((prev) => [...prev, enrichedQuestion]);
  };

  const updatePersonalQuestion = (questionId: string, updates: Partial<Question>) => {
    setPersonalQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };

  const deletePersonalQuestion = (questionId: string) => {
    setPersonalQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const getStarterQuestions = () => {
    return starterQuestions;
  };

  const resetTutorial = () => {
    safeRemoveItem('coachmarks-completed');
    safeRemoveItem('coachmarks-active');
    safeRemoveItem('real-paper-toolbox-spotlight-completed');
  };

  const clearAllData = () => {
    setPapers([]);
    setPersonalQuestions([]);
    safeRemoveItem('papers');
    safeRemoveItem('personalQuestions');
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

  return <MockStoreContext.Provider value={value}>{children}</MockStoreContext.Provider>;
}

export function useMockStore() {
  const context = useContext(MockStoreContext);
  if (context === undefined) {
    throw new Error('useMockStore must be used within a MockStoreProvider');
  }
  return context;
}

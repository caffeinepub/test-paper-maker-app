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

      if (storedProfile) {
        try {
          setProfile(JSON.parse(storedProfile));
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
          setPersonalQuestions(JSON.parse(storedPersonalQuestions));
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
    setIsInitialized(false);
    setInitializationError(null);
    setTimeout(initialize, 100);
  };

  const login = () => {
    setIsLoggedIn(true);
    safeSetItem('isLoggedIn', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setOnboardingCompleted(false);
    safeRemoveItem('isLoggedIn');
    safeRemoveItem('onboardingCompleted');
  };

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
    safeSetItem('onboardingCompleted', 'true');
  };

  const updateProfile = (updates: Partial<Profile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    safeSetItem('profile', JSON.stringify(newProfile));
  };

  const addPaper = (paper: Paper) => {
    const normalizedPaper = normalizePaper(paper);
    const newPapers = [...papers, normalizedPaper];
    setPapers(newPapers);
    safeSetItem('papers', JSON.stringify(newPapers));
  };

  const updatePaper = (paperId: string, updates: Partial<Paper>) => {
    const newPapers = papers.map((p) => {
      if (p.id === paperId) {
        const updatedPaper = { ...p, ...updates };
        return normalizePaper(updatedPaper);
      }
      return p;
    });
    setPapers(newPapers);
    safeSetItem('papers', JSON.stringify(newPapers));
  };

  const deletePaper = (paperId: string) => {
    const newPapers = papers.filter((p) => p.id !== paperId);
    setPapers(newPapers);
    safeSetItem('papers', JSON.stringify(newPapers));
  };

  const getPaperById = (paperId: string) => {
    return papers.find((p) => p.id === paperId);
  };

  const addPersonalQuestion = (question: Question) => {
    const newQuestions = [...personalQuestions, question];
    setPersonalQuestions(newQuestions);
    safeSetItem('personalQuestions', JSON.stringify(newQuestions));
  };

  const updatePersonalQuestion = (questionId: string, updates: Partial<Question>) => {
    const newQuestions = personalQuestions.map((q) =>
      q.id === questionId ? { ...q, ...updates } : q
    );
    setPersonalQuestions(newQuestions);
    safeSetItem('personalQuestions', JSON.stringify(newQuestions));
  };

  const deletePersonalQuestion = (questionId: string) => {
    const newQuestions = personalQuestions.filter((q) => q.id !== questionId);
    setPersonalQuestions(newQuestions);
    safeSetItem('personalQuestions', JSON.stringify(newQuestions));
  };

  const getStarterQuestions = () => {
    return starterQuestions;
  };

  const resetTutorial = () => {
    setOnboardingCompleted(false);
    safeRemoveItem('onboardingCompleted');
    safeRemoveItem('start-tutorial');
  };

  const clearAllData = () => {
    // Clear all stored data
    safeRemoveItem('isLoggedIn');
    safeRemoveItem('onboardingCompleted');
    safeRemoveItem('profile');
    safeRemoveItem('papers');
    safeRemoveItem('personalQuestions');
    safeRemoveItem('start-tutorial');
    
    // Reset state
    setIsLoggedIn(false);
    setOnboardingCompleted(false);
    setProfile(defaultProfile);
    setPapers(samplePapers);
    setPersonalQuestions([]);
  };

  return (
    <MockStoreContext.Provider
      value={{
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
      }}
    >
      {children}
    </MockStoreContext.Provider>
  );
}

export function useMockStore() {
  const context = useContext(MockStoreContext);
  if (!context) {
    throw new Error('useMockStore must be used within MockStoreProvider');
  }
  return context;
}


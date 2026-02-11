import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, Question, Paper, defaultProfile, starterQuestions, samplePapers, PaperSection, QuestionHeading } from './mockData';
import { safeGetItem, safeSetItem, safeRemoveItem, isStorageAvailable, getStorageError } from '../lib/storage/safeStorage';

interface MockStoreContextType {
  isInitialized: boolean;
  initializationError: string | null;
  isLoggedIn: boolean;
  isGuest: boolean;
  onboardingCompleted: boolean;
  profile: Profile;
  papers: Paper[];
  personalQuestions: Question[];
  login: (asGuest?: boolean) => void;
  logout: () => void;
  updateProfile: (profile: Profile) => void;
  addPaper: (paper: Paper) => void;
  updatePaper: (paperId: string, paper: Partial<Paper>) => void;
  deletePaper: (paperId: string) => void;
  getPaperById: (paperId: string) => Paper | undefined;
  addQuestion: (question: Question) => void;
  addQuestions: (questions: Question[]) => void;
  getStarterQuestions: () => Question[];
  completeOnboarding: () => void;
  resetTutorial: () => void;
  clearAllData: () => void;
  retryInitialization: () => void;
}

const MockStoreContext = createContext<MockStoreContextType | undefined>(undefined);

const STORAGE_KEY = 'test-paper-maker-store';

interface PersistedState {
  isLoggedIn: boolean;
  isGuest: boolean;
  onboardingCompleted: boolean;
  toolboxSpotlightCompleted?: boolean;
  profile: Profile;
  papers: Array<Omit<Paper, 'createdAt'> & { createdAt: string }>;
  personalQuestions: Question[];
}

function loadPersistedState(): Partial<PersistedState> | null {
  try {
    const stored = safeGetItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error);
  }
  return null;
}

function savePersistedState(state: PersistedState): boolean {
  try {
    const serialized = JSON.stringify(state);
    return safeSetItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save persisted state:', error);
    return false;
  }
}

// Normalize old papers to include headings structure
function normalizePaper(paper: Paper): Paper {
  const normalizedSections = paper.sections.map((section) => {
    // If section doesn't have headings, create a default one
    if (!section.headings || section.headings.length === 0) {
      const defaultHeading: QuestionHeading = {
        id: `heading-${section.id}-default`,
        title: 'Questions',
        plannedQuestionCount: section.questions.length || section.plannedQuestionCount || 0,
      };
      
      // Associate all existing questions with the default heading
      const updatedQuestions = section.questions.map((q) => ({
        ...q,
        headingId: q.headingId || defaultHeading.id,
      }));

      return {
        ...section,
        headings: [defaultHeading],
        questions: updatedQuestions,
      };
    }
    
    // Ensure all questions have a headingId
    const updatedQuestions = section.questions.map((q) => {
      if (!q.headingId && section.headings && section.headings.length > 0) {
        return { ...q, headingId: section.headings[0].id };
      }
      return q;
    });

    return {
      ...section,
      questions: updatedQuestions,
    };
  });

  return {
    ...paper,
    sections: normalizedSections,
  };
}

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [papers, setPapers] = useState<Paper[]>(samplePapers);
  const [personalQuestions, setPersonalQuestions] = useState<Question[]>([]);

  const initializeStore = () => {
    setInitializationError(null);
    
    // Check storage availability
    if (!isStorageAvailable()) {
      const error = getStorageError() || 'Storage is not available';
      setInitializationError(error);
      setIsInitialized(true);
      return;
    }

    try {
      const persisted = loadPersistedState();
      if (persisted) {
        if (persisted.isLoggedIn !== undefined) setIsLoggedIn(persisted.isLoggedIn);
        if (persisted.isGuest !== undefined) setIsGuest(persisted.isGuest);
        if (persisted.onboardingCompleted !== undefined) setOnboardingCompleted(persisted.onboardingCompleted);
        if (persisted.profile) setProfile(persisted.profile);
        if (persisted.personalQuestions) setPersonalQuestions(persisted.personalQuestions);
        if (persisted.papers) {
          // Restore Date objects from serialized strings and normalize
          const restoredPapers = persisted.papers.map((p) => 
            normalizePaper({
              ...p,
              createdAt: new Date(p.createdAt),
            })
          );
          setPapers(restoredPapers);
        }
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize store:', error);
      setInitializationError(error instanceof Error ? error.message : 'Failed to load data');
      setIsInitialized(true);
    }
  };

  // Hydrate state from localStorage on mount
  useEffect(() => {
    initializeStore();
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized || initializationError) return;
    
    const stateToPersist: PersistedState = {
      isLoggedIn,
      isGuest,
      onboardingCompleted,
      profile,
      papers: papers.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
      personalQuestions,
    };
    savePersistedState(stateToPersist);
  }, [isInitialized, initializationError, isLoggedIn, isGuest, onboardingCompleted, profile, papers, personalQuestions]);

  const login = (asGuest = false) => {
    setIsLoggedIn(true);
    setIsGuest(asGuest);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsGuest(false);
    setOnboardingCompleted(false);
    setProfile(defaultProfile);
    setPapers(samplePapers);
    setPersonalQuestions([]);
    safeRemoveItem(STORAGE_KEY);
  };

  const updateProfile = (newProfile: Profile) => {
    setProfile(newProfile);
  };

  const addPaper = (paper: Paper) => {
    const normalizedPaper = normalizePaper(paper);
    setPapers((prev) => [normalizedPaper, ...prev]);
  };

  const updatePaper = (paperId: string, updates: Partial<Paper>) => {
    setPapers((prev) => {
      const paperIndex = prev.findIndex((p) => p.id === paperId);
      if (paperIndex === -1) return prev;

      const existingPaper = prev[paperIndex];
      const updatedPaper = normalizePaper({ ...existingPaper, ...updates });

      // Deep comparison to avoid unnecessary updates
      if (JSON.stringify(existingPaper) === JSON.stringify(updatedPaper)) {
        return prev;
      }

      const newPapers = [...prev];
      newPapers[paperIndex] = updatedPaper;
      return newPapers;
    });
  };

  const deletePaper = (paperId: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== paperId));
  };

  const getPaperById = (paperId: string) => {
    return papers.find((p) => p.id === paperId);
  };

  const addQuestion = (question: Question) => {
    setPersonalQuestions((prev) => [...prev, question]);
  };

  const addQuestions = (questions: Question[]) => {
    setPersonalQuestions((prev) => [...prev, ...questions]);
  };

  const getStarterQuestions = () => starterQuestions;

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  const resetTutorial = () => {
    setOnboardingCompleted(false);
    // Clear tutorial flags
    safeRemoveItem('start-tutorial');
    safeRemoveItem('real-paper-toolbox-spotlight-completed');
  };

  const clearAllData = () => {
    logout();
  };

  const retryInitialization = () => {
    setIsInitialized(false);
    initializeStore();
  };

  return (
    <MockStoreContext.Provider
      value={{
        isInitialized,
        initializationError,
        isLoggedIn,
        isGuest,
        onboardingCompleted,
        profile,
        papers,
        personalQuestions,
        login,
        logout,
        updateProfile,
        addPaper,
        updatePaper,
        deletePaper,
        getPaperById,
        addQuestion,
        addQuestions,
        getStarterQuestions,
        completeOnboarding,
        resetTutorial,
        clearAllData,
        retryInitialization,
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

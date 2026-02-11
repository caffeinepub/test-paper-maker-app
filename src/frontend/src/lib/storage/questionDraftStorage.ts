import { safeGetItem, safeSetItem, safeRemoveItem } from './safeStorage';

interface QuestionDraft {
  paperId: string;
  questionText: string;
  marks: number;
  questionType: string;
  timestamp: number;
}

const DRAFT_KEY_PREFIX = 'question-draft-';

export function saveQuestionDraft(paperId: string, draft: Omit<QuestionDraft, 'paperId' | 'timestamp'>): void {
  const fullDraft: QuestionDraft = {
    paperId,
    ...draft,
    timestamp: Date.now(),
  };
  safeSetItem(`${DRAFT_KEY_PREFIX}${paperId}`, JSON.stringify(fullDraft));
}

export function loadQuestionDraft(paperId: string): QuestionDraft | null {
  const stored = safeGetItem(`${DRAFT_KEY_PREFIX}${paperId}`);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearQuestionDraft(paperId: string): void {
  safeRemoveItem(`${DRAFT_KEY_PREFIX}${paperId}`);
}

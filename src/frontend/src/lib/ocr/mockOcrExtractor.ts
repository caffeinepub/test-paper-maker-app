import { Question } from '../../state/mockData';

interface ExtractedOCRSession {
  sessionId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedAt: string;
  questions: Array<{
    id: string;
    text: string;
    approved: boolean;
    editing: boolean;
  }>;
}

const STORAGE_KEY = 'ocr-extraction-session';

export function generateMockExtractedQuestions(file: File): ExtractedOCRSession {
  // Generate deterministic questions based on file metadata
  const seed = file.name.length + file.size + file.lastModified;
  const questionCount = 3 + (seed % 5); // 3-7 questions

  const sampleQuestions = [
    'What is the capital of France?',
    'Explain the process of photosynthesis.',
    'Calculate the area of a circle with radius 5cm.',
    'Define the term "democracy".',
    'List three renewable energy sources.',
    'What is the chemical formula for water?',
    'Describe the water cycle.',
    'What are the three states of matter?',
  ];

  const questions = Array.from({ length: questionCount }, (_, idx) => ({
    id: `ocr-${Date.now()}-${idx}`,
    text: sampleQuestions[idx % sampleQuestions.length] || `Sample question ${idx + 1} from ${file.name}`,
    approved: false,
    editing: false,
  }));

  const session: ExtractedOCRSession = {
    sessionId: `session-${Date.now()}`,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    extractedAt: new Date().toISOString(),
    questions,
  };

  return session;
}

export function saveOCRSession(session: ExtractedOCRSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save OCR session:', error);
  }
}

export function loadOCRSession(): ExtractedOCRSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load OCR session:', error);
  }
  return null;
}

export function clearOCRSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear OCR session:', error);
  }
}

export function convertOCRQuestionsToPersonalQuestions(
  ocrQuestions: Array<{ id: string; text: string; approved: boolean }>,
  defaultMarks: 1 | 2 | 3 | 4 = 2
): Question[] {
  return ocrQuestions
    .filter((q) => q.approved)
    .map((q) => ({
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: q.text,
      marks: defaultMarks,
      source: 'personal' as const,
      questionType: 'short-answer' as const,
    }));
}

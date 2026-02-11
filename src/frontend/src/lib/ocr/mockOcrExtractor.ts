import { Question } from '../../state/mockData';
import { parseQuestionsFromText, ParsedQuestion } from './extractedTextQuestionParser';

interface ExtractedOCRSession {
  sessionId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedAt: string;
  extractedText: string;
  extractionFailed: boolean;
  questions: Array<{
    id: string;
    text: string;
    approved: boolean;
    editing: boolean;
  }>;
}

const STORAGE_KEY = 'ocr-extraction-session';

export function generateMockExtractedQuestions(file: File, extractedText?: string): ExtractedOCRSession {
  const sessionId = `session-${Date.now()}`;
  const extractedAt = new Date().toISOString();

  // If no extracted text provided, mark as extraction failed
  if (!extractedText || extractedText.trim().length === 0) {
    return {
      sessionId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      extractedAt,
      extractedText: '',
      extractionFailed: true,
      questions: [],
    };
  }

  // Parse questions from the extracted text
  const parsedQuestions = parseQuestionsFromText(extractedText);

  // Convert parsed questions to OCR session format
  const questions = parsedQuestions.map((pq, idx) => ({
    id: `ocr-${Date.now()}-${idx}`,
    text: pq.text,
    approved: false,
    editing: false,
  }));

  const session: ExtractedOCRSession = {
    sessionId,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    extractedAt,
    extractedText,
    extractionFailed: false,
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

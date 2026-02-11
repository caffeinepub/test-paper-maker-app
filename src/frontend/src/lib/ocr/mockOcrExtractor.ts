import { safeGetItem, safeSetItem, safeRemoveItem } from '../storage/safeStorage';
import { parseExtractedText } from './extractedTextQuestionParser';
import { generateQuestionsFromLines, generateQuestionsFromParagraph } from './ocrQuestionGenerator';
import { Question } from '../../state/mockData';

const OCR_SESSION_KEY = 'ocr-session';

export interface OCRQuestion {
  id: string;
  text: string;
  questionType?: 'mcq' | 'fill-in-blank' | 'short-answer' | 'numerical' | 'true-false' | 'match-pairs' | 'table';
  marks?: number;
  difficulty?: string;
  mcqOptions?: { options: string[]; correctAnswer?: number };
  fillInBlankData?: { blanks: string[] };
}

export interface OCRSession {
  extractedText: string;
  questions: OCRQuestion[];
  extractionFailed: boolean;
  timestamp: number;
}

export function createOCRSession(extractedText: string): OCRSession {
  const parseResult = parseExtractedText(extractedText);
  
  let questions: OCRQuestion[] = [];
  let extractionFailed = false;

  // First, try line-based generation (new approach)
  const lineGenerated = generateQuestionsFromLines(extractedText);
  
  if (lineGenerated.length >= 3) {
    // Line-based generation succeeded
    questions = lineGenerated.map((q, idx) => ({
      id: `ocr-q-${Date.now()}-${idx}`,
      text: q.text,
      questionType: q.questionType,
      marks: q.marks,
      difficulty: q.difficulty,
      mcqOptions: q.mcqOptions,
      fillInBlankData: q.fillInBlankData
    }));
  }
  // If we have high-confidence parsed questions, use them
  else if (parseResult.confidence === 'high' && parseResult.questions.length >= 3) {
    questions = parseResult.questions.map((q, idx) => ({
      id: `ocr-q-${Date.now()}-${idx}`,
      text: q.text,
      questionType: 'short-answer' as const,
      marks: 2,
      difficulty: 'Medium'
    }));
  }
  // If it's paragraph style with meaningful content, generate questions
  else if (parseResult.isParagraphStyle && parseResult.meaningfulTextLength > 100) {
    const generated = generateQuestionsFromParagraph(extractedText, 10);
    questions = generated.map((q, idx) => ({
      id: `ocr-q-${Date.now()}-${idx}`,
      text: q.text,
      questionType: q.questionType,
      marks: q.marks,
      difficulty: q.difficulty,
      mcqOptions: q.mcqOptions,
      fillInBlankData: q.fillInBlankData
    }));
  }
  // If we have some parsed questions but not many, use them
  else if (parseResult.questions.length > 0) {
    questions = parseResult.questions.map((q, idx) => ({
      id: `ocr-q-${Date.now()}-${idx}`,
      text: q.text,
      questionType: 'short-answer' as const,
      marks: 2,
      difficulty: 'Medium'
    }));
  }
  // Otherwise, mark as extraction failed
  else {
    extractionFailed = true;
  }

  const session: OCRSession = {
    extractedText,
    questions,
    extractionFailed,
    timestamp: Date.now()
  };

  safeSetItem(OCR_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function generateMockExtractedQuestions(file: File, extractedText: string): OCRSession {
  return createOCRSession(extractedText);
}

export function saveOCRSession(session: OCRSession): void {
  safeSetItem(OCR_SESSION_KEY, JSON.stringify(session));
}

export function loadOCRSession(): OCRSession | null {
  const stored = safeGetItem(OCR_SESSION_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearOCRSession(): void {
  safeRemoveItem(OCR_SESSION_KEY);
}

export function convertOCRQuestionsToPersonalQuestions(ocrQuestions: OCRQuestion[]): Question[] {
  return ocrQuestions.map(ocrQ => {
    const baseQuestion: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: ocrQ.text,
      questionType: ocrQ.questionType || 'short-answer',
      marks: ocrQ.marks || 2,
      type: ocrQ.difficulty || 'Medium', // Store difficulty in the type field
      headingId: null,
      imageAttachment: null
    };

    // Add type-specific data
    if (ocrQ.questionType === 'mcq' && ocrQ.mcqOptions) {
      baseQuestion.mcqOptions = ocrQ.mcqOptions;
    } else if (ocrQ.questionType === 'fill-in-blank' && ocrQ.fillInBlankData) {
      baseQuestion.fillInBlankData = ocrQ.fillInBlankData;
    }

    return baseQuestion;
  });
}

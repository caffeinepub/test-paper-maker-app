export interface ParsedQuestion {
  text: string;
  options?: string[];
}

export interface ParseResult {
  questions: ParsedQuestion[];
  confidence: 'high' | 'medium' | 'low';
  isParagraphStyle: boolean;
  meaningfulTextLength: number;
}

// Detect if text contains numbered questions
function detectNumberedQuestions(text: string): ParsedQuestion[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions: ParsedQuestion[] = [];
  
  const numberPatterns = [
    /^(\d+)\.\s+(.+)/,           // 1. Question
    /^Q\.?\s*(\d+)[:\.\)]\s+(.+)/i, // Q1: Question or Q.1) Question
    /^\((\d+)\)\s+(.+)/,         // (1) Question
  ];

  for (const line of lines) {
    for (const pattern of numberPatterns) {
      const match = line.match(pattern);
      if (match && match[2] && match[2].length > 10) {
        questions.push({ text: match[2].trim() });
        break;
      }
    }
  }

  return questions;
}

// Detect bullet-point questions
function detectBulletQuestions(text: string): ParsedQuestion[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions: ParsedQuestion[] = [];
  
  const bulletPatterns = [
    /^[•\-\*]\s+(.+)/,
    /^[â€¢â€£â—¦â—¾â–ª]\s+(.+)/,
  ];

  for (const line of lines) {
    for (const pattern of bulletPatterns) {
      const match = line.match(pattern);
      if (match && match[1] && match[1].length > 10) {
        questions.push({ text: match[1].trim() });
        break;
      }
    }
  }

  return questions;
}

// Detect lines ending with question marks
function detectQuestionMarkLines(text: string): ParsedQuestion[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  return lines
    .filter(line => line.endsWith('?') && line.length > 10)
    .map(line => ({ text: line }));
}

// Detect question-word patterns
function detectQuestionWords(text: string): ParsedQuestion[] {
  const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'explain', 'describe', 'define'];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions: ParsedQuestion[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const startsWithQuestion = questionWords.some(word => lowerLine.startsWith(word));
    if (startsWithQuestion && line.length > 15) {
      questions.push({ text: line });
    }
  }

  return questions;
}

// Check if text is paragraph/essay style
function isParagraphStyle(text: string): boolean {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // If most lines are long (>50 chars) and don't start with numbers/bullets, it's likely a paragraph
  const longLines = lines.filter(l => l.length > 50);
  const structuredLines = lines.filter(l => /^(\d+\.|[•\-\*]|Q\.?\s*\d+)/.test(l));
  
  return longLines.length > lines.length * 0.6 && structuredLines.length < lines.length * 0.3;
}

export function parseExtractedText(text: string): ParseResult {
  if (!text || text.trim().length < 20) {
    return {
      questions: [],
      confidence: 'low',
      isParagraphStyle: false,
      meaningfulTextLength: 0
    };
  }

  const cleanText = text.trim();
  const meaningfulTextLength = cleanText.length;

  // Try different parsing strategies
  const numberedQuestions = detectNumberedQuestions(cleanText);
  const bulletQuestions = detectBulletQuestions(cleanText);
  const questionMarkLines = detectQuestionMarkLines(cleanText);
  const questionWordLines = detectQuestionWords(cleanText);

  // Determine if it's paragraph style
  const isParagraph = isParagraphStyle(cleanText);

  // Combine all detected questions
  const allQuestions = [
    ...numberedQuestions,
    ...bulletQuestions,
    ...questionMarkLines,
    ...questionWordLines
  ];

  // Remove duplicates
  const uniqueQuestions = Array.from(
    new Map(allQuestions.map(q => [q.text.toLowerCase(), q])).values()
  );

  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (numberedQuestions.length >= 3) {
    confidence = 'high';
  } else if (uniqueQuestions.length >= 2) {
    confidence = 'medium';
  } else if (isParagraph && meaningfulTextLength > 100) {
    confidence = 'medium'; // Paragraph with enough content
  }

  return {
    questions: uniqueQuestions,
    confidence,
    isParagraphStyle: isParagraph,
    meaningfulTextLength
  };
}

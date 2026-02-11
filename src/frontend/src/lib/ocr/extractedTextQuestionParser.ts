/**
 * Lightweight parsing utilities to derive a question list from extracted text.
 * Detects numbered questions, bullet points, and lines ending with '?'.
 * Falls back to sentence-based prompts only when text is present.
 */

export interface ParsedQuestion {
  text: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Parse questions from extracted text
 */
export function parseQuestionsFromText(extractedText: string): ParsedQuestion[] {
  if (!extractedText || extractedText.trim().length === 0) {
    return [];
  }

  const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const questions: ParsedQuestion[] = [];

  // Pattern 1: Lines ending with '?'
  const questionMarkLines = lines.filter(line => line.endsWith('?'));
  questionMarkLines.forEach(line => {
    questions.push({
      text: line,
      confidence: 'high',
    });
  });

  // Pattern 2: Numbered questions (e.g., "1.", "Q1.", "1)", "(1)")
  const numberedPattern = /^(\d+[\.\)]\s*|Q\d+[\.\)]\s*|\(\d+\)\s*)/i;
  const numberedLines = lines.filter(line => numberedPattern.test(line));
  numberedLines.forEach(line => {
    // Remove the numbering prefix
    const cleanedLine = line.replace(numberedPattern, '').trim();
    if (cleanedLine.length > 0 && !questions.some(q => q.text === cleanedLine)) {
      questions.push({
        text: cleanedLine,
        confidence: 'high',
      });
    }
  });

  // Pattern 3: Bullet points (•, -, *, etc.)
  const bulletPattern = /^[•\-\*]\s+/;
  const bulletLines = lines.filter(line => bulletPattern.test(line));
  bulletLines.forEach(line => {
    const cleanedLine = line.replace(bulletPattern, '').trim();
    if (cleanedLine.length > 0 && !questions.some(q => q.text === cleanedLine)) {
      questions.push({
        text: cleanedLine,
        confidence: 'medium',
      });
    }
  });

  // Pattern 4: Lines that look like questions (contain question words)
  const questionWords = ['what', 'when', 'where', 'who', 'why', 'how', 'which', 'explain', 'describe', 'define', 'calculate', 'list'];
  const questionWordPattern = new RegExp(`^(${questionWords.join('|')})\\b`, 'i');
  const questionWordLines = lines.filter(line => 
    questionWordPattern.test(line) && 
    !questions.some(q => q.text === line || line.includes(q.text))
  );
  questionWordLines.forEach(line => {
    questions.push({
      text: line,
      confidence: 'medium',
    });
  });

  // If we found questions, return them
  if (questions.length > 0) {
    return questions;
  }

  // Fallback: Split into sentences and treat as potential questions
  // Only if we have text but no clear questions detected
  const sentences = extractedText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10); // Minimum length to be a meaningful question

  if (sentences.length > 0) {
    return sentences.slice(0, 10).map(sentence => ({
      text: sentence.endsWith('?') ? sentence : `${sentence}?`,
      confidence: 'low',
    }));
  }

  return [];
}

/**
 * Generate a summary of parsing results
 */
export function getParsingStats(questions: ParsedQuestion[]): {
  total: number;
  high: number;
  medium: number;
  low: number;
} {
  return {
    total: questions.length,
    high: questions.filter(q => q.confidence === 'high').length,
    medium: questions.filter(q => q.confidence === 'medium').length,
    low: questions.filter(q => q.confidence === 'low').length,
  };
}

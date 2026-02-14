import { QuestionType } from '../../state/mockData';

/**
 * Lightweight heuristic-based question type detection
 * Runs immediately on newly added/pasted question text
 */
export function detectQuestionType(questionText: string): QuestionType | null {
  const text = questionText.toLowerCase().trim();

  // MCQ detection: look for options pattern (a), b), A., B., etc.)
  const mcqPattern = /\b[a-d]\)|[a-d]\.|[a-d]\)/gi;
  const mcqMatches = text.match(mcqPattern);
  if (mcqMatches && mcqMatches.length >= 2) {
    return 'mcq';
  }

  // True/False detection
  if (
    text.includes('true or false') ||
    text.includes('true/false') ||
    text.includes('t/f') ||
    (text.includes('true') && text.includes('false'))
  ) {
    return 'true-false';
  }

  // Fill in the blank detection
  if (
    text.includes('_____') ||
    text.includes('fill in the blank') ||
    text.includes('complete the sentence') ||
    text.match(/\b_{3,}\b/)
  ) {
    return 'fill-in-blank';
  }

  // Match pairs detection
  if (
    text.includes('match the following') ||
    text.includes('match') ||
    (text.includes('column a') && text.includes('column b'))
  ) {
    return 'match-pairs';
  }

  // Table detection
  if (
    text.includes('table') ||
    text.includes('fill the table') ||
    text.includes('complete the table')
  ) {
    return 'table';
  }

  // Numerical detection: look for "solve", "calculate", "find the value", numbers
  const numericalKeywords = ['solve', 'calculate', 'compute', 'find the value', 'evaluate'];
  const hasNumericalKeyword = numericalKeywords.some((keyword) => text.includes(keyword));
  const hasNumbers = /\d+/.test(text);
  if (hasNumericalKeyword && hasNumbers) {
    return 'numerical';
  }

  // Default to short-answer for descriptive questions
  return 'short-answer';
}

import { Question } from "../../state/mockData";

interface GeneratedQuestion {
  text: string;
  questionType: "mcq" | "fill-in-blank" | "short-answer";
  marks: number;
  difficulty: "Easy" | "Medium" | "Hard";
  mcqOptions?: { options: string[]; correctAnswer?: number };
  fillInBlankData?: { blanks: string[] };
}

// Trailing fragments that indicate incomplete sentences
const TRAILING_FRAGMENTS = [
  "is one of",
  "are one of",
  "is a",
  "are a",
  "is the",
  "are the",
  "of the",
  "of a",
  "to the",
  "to a",
  "and the",
  "and a",
  "or the",
  "or a",
  "in the",
  "in a",
  "on the",
  "on a",
  "at the",
  "at a",
  "for the",
  "for a",
  "with the",
  "with a",
  "by the",
  "by a",
  "from the",
  "from a",
];

// Clean and validate a line
function cleanAndValidateLine(line: string): string | null {
  // Trim whitespace
  let cleaned = line.trim();

  // Must have minimum length
  if (cleaned.length < 20) return null;

  // Must have at least 4 words
  const words = cleaned.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 4) return null;

  // Remove trailing fragments
  const lowerCleaned = cleaned.toLowerCase();
  for (const fragment of TRAILING_FRAGMENTS) {
    if (lowerCleaned.endsWith(fragment)) {
      // Remove the fragment
      cleaned = cleaned.substring(0, cleaned.length - fragment.length).trim();
      // Remove trailing punctuation after removal
      cleaned = cleaned.replace(/[,;:\s]+$/, "");
    }
  }

  // After cleaning, check if still meaningful
  if (cleaned.length < 15) return null;

  // Ensure it ends with proper punctuation
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }

  return cleaned;
}

// Extract key terms from text using simple heuristics
function extractKeyTerms(text: string): string[] {
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "could",
    "may",
    "might",
    "must",
    "can",
    "of",
    "at",
    "by",
    "for",
    "with",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "to",
    "from",
    "up",
    "down",
    "in",
    "out",
    "on",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "just",
    "but",
    "and",
    "or",
    "if",
    "because",
    "as",
    "until",
    "while",
    "it",
    "they",
    "them",
    "their",
    "what",
    "which",
    "who",
    "whom",
    "this",
    "that",
    "these",
    "those",
    "am",
    "his",
    "her",
    "its",
    "our",
    "your",
    "also",
    "known",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  // Count frequency
  const frequency: Record<string, number> = {};
  for (const word of words) {
    frequency[word] = (frequency[word] || 0) + 1;
  }

  // Sort by frequency and return top terms
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

// Split text into usable lines
function extractLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => cleanAndValidateLine(line))
    .filter((line): line is string => line !== null);
}

// Extract meaningful phrases from text for MCQ options
// biome-ignore lint/correctness/noUnusedVariables: utility function reserved for future use
function extractPhrasesFromText(text: string, count: number): string[] {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 15);
  const phrases: string[] = [];

  for (const line of lines) {
    // Split by sentence-ending punctuation
    const sentences = line
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
    phrases.push(...sentences);
  }

  // Return unique phrases
  const uniquePhrases = Array.from(new Set(phrases));
  return uniquePhrases.slice(0, count);
}

// Generate MCQ from a line with grounded options
function generateMCQFromLine(
  line: string,
  allLines: string[],
  keyTerms: string[],
): GeneratedQuestion | null {
  const words = line.split(/\s+/);
  if (words.length < 5) return null;

  // Find a key term in the line
  const lineLower = line.toLowerCase();
  const relevantTerm = keyTerms.find((term) => lineLower.includes(term));

  if (!relevantTerm) return null;

  // Create question about the key term
  const questionText = `Which of the following statements is correct about ${relevantTerm}?`;

  // Correct option: use the current line (truncated if too long)
  const correctOption = line.length > 80 ? `${line.substring(0, 77)}...` : line;

  // Generate distractors from other lines
  const otherLines = allLines.filter((l) => l !== line && l.length > 20);
  const distractors: string[] = [];

  for (const otherLine of otherLines) {
    if (distractors.length >= 3) break;
    const distractor =
      otherLine.length > 80 ? `${otherLine.substring(0, 77)}...` : otherLine;
    if (distractor !== correctOption && !distractors.includes(distractor)) {
      distractors.push(distractor);
    }
  }

  // If we don't have enough unique distractors, skip this MCQ
  if (distractors.length < 3) return null;

  const options = [correctOption, ...distractors.slice(0, 3)];

  return {
    text: questionText,
    questionType: "mcq",
    marks: 2,
    difficulty: "Medium",
    mcqOptions: { options, correctAnswer: 0 },
  };
}

// Generate fill-in-the-blank from a line
function generateFillInBlankFromLine(
  line: string,
  keyTerms: string[],
): GeneratedQuestion | null {
  const lineLower = line.toLowerCase();
  const relevantTerm = keyTerms.find((term) => lineLower.includes(term));

  if (!relevantTerm) {
    // Fallback: blank out a significant word
    const words = line.split(/\s+/);
    const significantWords = words.filter((w) => w.length > 4);
    if (significantWords.length === 0) return null;

    const wordToBlank =
      significantWords[Math.floor(significantWords.length / 2)];
    const blankSentence = line.replace(
      new RegExp(`\\b${wordToBlank}\\b`, "i"),
      "________",
    );

    return {
      text: blankSentence,
      questionType: "fill-in-blank",
      marks: 1,
      difficulty: "Easy",
      fillInBlankData: { blanks: [wordToBlank.replace(/[.,!?;:]$/, "")] },
    };
  }

  // Replace the key term with a blank
  const blankSentence = line.replace(
    new RegExp(`\\b${relevantTerm}\\b`, "i"),
    "________",
  );

  return {
    text: blankSentence,
    questionType: "fill-in-blank",
    marks: 1,
    difficulty: "Easy",
    fillInBlankData: { blanks: [relevantTerm] },
  };
}

// Generate short-answer from a line
function generateShortAnswerFromLine(
  line: string,
  keyTerms: string[],
): GeneratedQuestion | null {
  const lineLower = line.toLowerCase();
  const relevantTerm = keyTerms.find((term) => lineLower.includes(term));

  if (!relevantTerm) return null;

  const questionText = `Explain the significance of ${relevantTerm}.`;

  return {
    text: questionText,
    questionType: "short-answer",
    marks: 3,
    difficulty: "Medium",
  };
}

// Main function: generate questions from lines
export function generateQuestionsFromLines(text: string): GeneratedQuestion[] {
  const lines = extractLines(text);
  if (lines.length < 3) return [];

  const keyTerms = extractKeyTerms(text);
  const questions: GeneratedQuestion[] = [];

  // Generate mixed question types
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Alternate question types
    if (i % 3 === 0) {
      // MCQ
      const mcq = generateMCQFromLine(line, lines, keyTerms);
      if (mcq) questions.push(mcq);
    } else if (i % 3 === 1) {
      // Fill-in-blank
      const fib = generateFillInBlankFromLine(line, keyTerms);
      if (fib) questions.push(fib);
    } else {
      // Short answer
      const sa = generateShortAnswerFromLine(line, keyTerms);
      if (sa) questions.push(sa);
    }
  }

  return questions;
}

// Generate questions from paragraph-style text
export function generateQuestionsFromParagraph(
  text: string,
  maxQuestions: number,
): GeneratedQuestion[] {
  const keyTerms = extractKeyTerms(text);
  const questions: GeneratedQuestion[] = [];

  // Extract sentences
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (sentences.length < 3) return [];

  // Generate questions from sentences
  for (let i = 0; i < Math.min(sentences.length, maxQuestions); i++) {
    const sentence = sentences[i];

    if (i % 2 === 0) {
      // Fill-in-blank
      const fib = generateFillInBlankFromLine(sentence, keyTerms);
      if (fib) questions.push(fib);
    } else {
      // Short answer
      const sa = generateShortAnswerFromLine(sentence, keyTerms);
      if (sa) questions.push(sa);
    }
  }

  return questions;
}

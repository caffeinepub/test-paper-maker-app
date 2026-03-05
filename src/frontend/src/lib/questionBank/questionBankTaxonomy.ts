// Shared constants and helpers for Question Bank browsing

export const BOARDS = ["CBSE", "ICSE", "State Board", "GSEB"] as const;

export const STANDARDS = [
  "Standard 1",
  "Standard 2",
  "Standard 3",
  "Standard 4",
  "Standard 5",
  "Standard 6",
  "Standard 7",
  "Standard 8",
  "Standard 9",
  "Standard 10",
  "Standard 11",
  "Standard 12",
  "Other",
] as const;

// Question types from the paper editor toolbox
export const QUESTION_TYPES = [
  { value: "all", label: "All Questions" },
  { value: "mcq", label: "Multiple Choice" },
  { value: "fill-in-blank", label: "Fill in the Blank" },
  { value: "true-false", label: "True/False" },
  { value: "match-pairs", label: "Match Pairs" },
  { value: "table", label: "Table" },
  { value: "short-answer", label: "Short Answer" },
] as const;

export type Board = (typeof BOARDS)[number];
export type Standard = (typeof STANDARDS)[number];
export type QuestionTypeFilter = (typeof QUESTION_TYPES)[number]["value"];

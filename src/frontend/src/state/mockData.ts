export interface Profile {
  teacherName: string;
  instituteName: string;
  board: string;
  standard: string;
  medium: string;
  logoUrl: string | null;
  preferredBoard: string;
  defaultStandard: string;
  schoolLogo?: string | null;
}

export type QuestionType =
  | "mcq"
  | "numerical"
  | "fill-in-blank"
  | "true-false"
  | "match-pairs"
  | "table"
  | "short-answer"
  | "long-answer"
  | "assertion-reason"
  | "case-based";

// Support for rich content in cells (can be string or RichCellContent)
export type CellContent = string | any; // any to allow RichCellContent without circular dependency

export interface Question {
  id: string;
  text: string;
  questionType: QuestionType;
  marks: number;
  type: string;
  headingId: string | null;
  imageAttachment: string | null;
  board?: string;
  standard?: string;
  subject?: string;
  /** Optional correct/model answer for any question type — always skippable */
  answer?: string;
  /** Optional difficulty level */
  difficulty?: "easy" | "medium" | "hard";
  /** Optional topic tags */
  tags?: string[];
  mcqOptions?: {
    options: string[];
    correctAnswer?: number;
  };
  fillInBlankData?: {
    blanks: string[];
  };
  trueFalseData?: {
    correctAnswer?: boolean;
  };
  matchPairsData?: {
    pairs: Array<{ left: CellContent; right: CellContent }>;
  };
  tableData?: {
    rows: number;
    cols: number;
    cells: CellContent[][];
    columnHeaders?: string[];
  };
  assertionReasonData?: {
    assertion: string;
    reason: string;
  };
  caseBasedData?: {
    passage: string;
    subQuestions: string[];
  };
  numericalData?: {
    unit?: string;
  };
}

export interface QuestionHeading {
  id: string;
  title: string;
  plannedCount: number;
}

export interface PaperSection {
  id: string;
  title: string;
  totalMarks: number;
  marks: number;
  headings: QuestionHeading[];
  questions: Question[];
}

export interface Paper {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: string;
  totalMarks: number;
  sections: PaperSection[];
  questions: Question[];
  layoutMode: "original" | "cleaned";
  timeMinutes: number;
  board: string;
  standard: string;
  medium: string;
  createdAt: Date;
}

export const defaultProfile: Profile = {
  teacherName: "Teacher",
  instituteName: "My Institute",
  board: "CBSE",
  standard: "Standard 10",
  medium: "English",
  logoUrl: null,
  preferredBoard: "CBSE",
  defaultStandard: "Standard 10",
  schoolLogo: null,
};

export const starterQuestions: Question[] = [
  {
    id: "q1",
    text: "What is the capital of France?",
    questionType: "short-answer",
    marks: 2,
    type: "Conceptual",
    headingId: null,
    imageAttachment: null,
    board: "CBSE",
    standard: "Standard 10",
  },
  {
    id: "q2",
    text: "Solve: 2x + 5 = 15",
    questionType: "numerical",
    marks: 3,
    type: "Numerical",
    headingId: null,
    imageAttachment: null,
    board: "CBSE",
    standard: "Standard 10",
  },
  {
    id: "q3",
    text: "Explain the process of photosynthesis.",
    questionType: "short-answer",
    marks: 5,
    type: "Conceptual",
    headingId: null,
    imageAttachment: null,
    board: "CBSE",
    standard: "Standard 9",
  },
];

export const samplePapers: Paper[] = [];

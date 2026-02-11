export interface Profile {
  teacherName: string;
  instituteName: string;
  preferredBoard: 'CBSE' | 'GSEB' | 'Both';
  defaultStandard?: string;
  medium: 'English' | 'Gujarati';
  schoolLogo?: string;
}

export type QuestionType = 
  | 'short-answer'
  | 'mcq'
  | 'numerical'
  | 'fill-in-blank'
  | 'true-false'
  | 'match-pairs'
  | 'table';

export interface MCQOptions {
  options: string[];
}

export interface FillInBlankData {
  blanks: string[];
}

export interface TrueFalseData {
  correctAnswer?: boolean;
}

export interface MatchPairsData {
  pairs: Array<{ left: string; right: string }>;
}

export interface TableData {
  rows: number;
  cols: number;
  cells: string[][];
}

export interface Question {
  id: string;
  text: string;
  marks: 1 | 2 | 3 | 4;
  type?: string;
  source: 'starter' | 'personal';
  questionType?: QuestionType;
  mcqOptions?: MCQOptions;
  fillInBlankData?: FillInBlankData;
  trueFalseData?: TrueFalseData;
  matchPairsData?: MatchPairsData;
  tableData?: TableData;
  headingId?: string; // Associates question with a heading
  imageAttachment?: string; // Base64 image data for attached images
}

export interface QuestionHeading {
  id: string;
  title: string;
  plannedQuestionCount: number;
}

export interface PaperSection {
  id: string;
  marks: 1 | 2 | 3 | 4;
  questions: Question[];
  plannedQuestionCount?: number;
  headings?: QuestionHeading[]; // Multiple headings per section
}

export interface Paper {
  id: string;
  title: string;
  totalMarks: number;
  timeMinutes: number;
  sections: PaperSection[];
  createdAt: Date;
  board: 'CBSE' | 'GSEB' | 'Both';
  standard?: string;
  medium: 'English' | 'Gujarati';
  layoutMode?: 'original' | 'professional';
}

export const defaultProfile: Profile = {
  teacherName: '',
  instituteName: '',
  preferredBoard: 'CBSE',
  medium: 'English',
};

export const starterQuestions: Question[] = [
  {
    id: 'sq1',
    text: 'What is the capital of India?',
    marks: 1,
    type: 'Short Answer',
    source: 'starter',
    questionType: 'short-answer',
  },
  {
    id: 'sq2',
    text: 'Explain the process of photosynthesis.',
    marks: 2,
    type: 'Short Answer',
    source: 'starter',
    questionType: 'short-answer',
  },
  {
    id: 'sq3',
    text: 'Describe the water cycle with a diagram.',
    marks: 3,
    type: 'Descriptive',
    source: 'starter',
    questionType: 'short-answer',
  },
  {
    id: 'sq4',
    text: 'Write an essay on the importance of education in modern society.',
    marks: 4,
    type: 'Essay',
    source: 'starter',
    questionType: 'short-answer',
  },
];

export const samplePapers: Paper[] = [
  {
    id: 'paper1',
    title: 'Science Unit Test - Chapter 1',
    totalMarks: 25,
    timeMinutes: 45,
    sections: [],
    createdAt: new Date('2026-02-08'),
    board: 'CBSE',
    standard: '10',
    medium: 'English',
    layoutMode: 'original',
  },
  {
    id: 'paper2',
    title: 'Mathematics Mid-term',
    totalMarks: 50,
    timeMinutes: 90,
    sections: [],
    createdAt: new Date('2026-02-05'),
    board: 'GSEB',
    standard: '9',
    medium: 'English',
    layoutMode: 'original',
  },
];

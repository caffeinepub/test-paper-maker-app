// Shared constants and helpers for Question Bank browsing

export const BOARDS = ["CBSE", "ICSE", "State Board", "GSEB"] as const;

export const DEFAULT_STANDARDS = [
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
] as const;

// Keep STANDARDS alias for backward-compat (used in many places)
export const STANDARDS = DEFAULT_STANDARDS;

// Default subjects added to every new standard
export const DEFAULT_SUBJECTS = [
  "Science",
  "Mathematics",
  "English",
  "Social Science",
  "Hindi",
  "Computer Science",
];

// Rotating colour palette for subject/chapter dots
export const SUBJECT_COLOURS = [
  "#7c3aed", // purple
  "#2563eb", // blue
  "#16a34a", // green
  "#dc2626", // red
  "#d97706", // amber
  "#0891b2", // cyan
  "#db2777", // pink
  "#65a30d", // lime
  "#9333ea", // violet
  "#f97316", // orange
];

export interface ChapterEntry {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface SubjectEntry {
  id: string;
  name: string;
  colourIndex: number; // index into SUBJECT_COLOURS
  chapters: ChapterEntry[];
}

export interface StandardEntry {
  id: string;
  name: string;
  isDefault: boolean; // default standards cannot be renamed or deleted
  subjects: SubjectEntry[];
}

// Question types from the paper editor toolbox
export const QUESTION_TYPES = [
  { value: "all", label: "All Questions" },
  { value: "mcq", label: "Multiple Choice" },
  { value: "fill-in-blank", label: "Fill in the Blank" },
  { value: "true-false", label: "True/False" },
  { value: "match-pairs", label: "Match Pairs" },
  { value: "table", label: "Table" },
  { value: "short-answer", label: "Short Answer" },
  { value: "long-answer", label: "Long Answer" },
  { value: "numerical", label: "Numerical" },
  { value: "assertion-reason", label: "Assertion-Reason" },
  { value: "case-based", label: "Case-Based" },
] as const;

export type Board = (typeof BOARDS)[number];
export type Standard = (typeof DEFAULT_STANDARDS)[number];
export type QuestionTypeFilter = (typeof QUESTION_TYPES)[number]["value"];

/** Default NCERT-style chapters per subject */
export const DEFAULT_CHAPTERS_BY_SUBJECT: Record<string, string[]> = {
  Science: [
    "Physical World",
    "Units & Measurement",
    "Motion in a Straight Line",
    "Laws of Motion",
    "Work Energy & Power",
    "Gravitation",
    "Properties of Solids & Liquids",
    "Thermodynamics",
    "Oscillations & Waves",
    "Electrostatics",
    "Current Electricity",
    "Magnetic Effects",
    "Modern Physics",
  ],
  Mathematics: [
    "Real Numbers",
    "Polynomials",
    "Linear Equations",
    "Quadratic Equations",
    "Arithmetic Progressions",
    "Triangles",
    "Coordinate Geometry",
    "Introduction to Trigonometry",
    "Applications of Trigonometry",
    "Circles",
    "Areas Related to Circles",
    "Surface Areas & Volumes",
    "Statistics",
    "Probability",
  ],
  English: [
    "Reading Comprehension",
    "Grammar - Parts of Speech",
    "Grammar - Tenses",
    "Grammar - Voice & Narration",
    "Writing - Letters & Applications",
    "Writing - Essays",
    "Literature - Prose",
    "Literature - Poetry",
    "Literature - Drama",
  ],
  "Social Science": [
    "Our Pasts (History)",
    "Resources & Development (Geography)",
    "Democratic Politics (Civics)",
    "Understanding Economic Development",
    "Disaster Management",
  ],
  Hindi: [
    "Vasant",
    "Durva",
    "Bal Mahabharat",
    "Sparsh",
    "Sanchayan",
    "Grammar (Vyakaran)",
    "Composition (Rachna)",
  ],
  "Computer Science": [
    "Introduction to Computing",
    "Algorithms & Problem Solving",
    "Programming with Python/Scratch",
    "Internet & Web Technology",
    "Data Handling & Spreadsheets",
    "Database Management",
    "Cyber Safety & Ethics",
  ],
};

/** Build default chapters for a subject name */
function buildDefaultChapters(
  subjectName: string,
  stdIdx: number,
): ChapterEntry[] {
  const names = DEFAULT_CHAPTERS_BY_SUBJECT[subjectName] ?? [];
  return names.map((name, ci) => ({
    id: `default-ch-${stdIdx}-${subjectName.replace(/\s+/g, "-").toLowerCase()}-${ci}`,
    name,
    isDefault: true,
  }));
}

/** Build the initial list of StandardEntry objects (defaults 1–12) */
export function buildDefaultStandards(): StandardEntry[] {
  return DEFAULT_STANDARDS.map((name, si) => ({
    id: `default-std-${si + 1}`,
    name,
    isDefault: true,
    subjects: DEFAULT_SUBJECTS.map((subjectName, idx) => ({
      id: `default-subj-${si + 1}-${idx}`,
      name: subjectName,
      colourIndex: idx % SUBJECT_COLOURS.length,
      chapters: buildDefaultChapters(subjectName, si + 1),
    })),
  }));
}

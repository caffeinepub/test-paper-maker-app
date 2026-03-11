import type { PaperSection, QuestionHeading } from "../../state/mockData";

export interface PaperTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  totalMarks: number;
  timeMinutes: number;
  board: string;
  sections: Array<{
    title: string;
    marks: number;
    totalMarks: number;
    headings: Omit<QuestionHeading, "id">[];
  }>;
}

export const BUILT_IN_TEMPLATES: PaperTemplate[] = [
  {
    id: "cbse-standard",
    name: "CBSE Standard Test",
    description:
      "Classic CBSE format with MCQ, short answer and long answer sections",
    icon: "📘",
    totalMarks: 80,
    timeMinutes: 180,
    board: "CBSE",
    sections: [
      {
        title: "Section A",
        marks: 1,
        totalMarks: 20,
        headings: [{ title: "Multiple Choice Questions", plannedCount: 20 }],
      },
      {
        title: "Section B",
        marks: 2,
        totalMarks: 20,
        headings: [{ title: "Very Short Answer Questions", plannedCount: 10 }],
      },
      {
        title: "Section C",
        marks: 3,
        totalMarks: 15,
        headings: [{ title: "Short Answer Questions", plannedCount: 5 }],
      },
      {
        title: "Section D",
        marks: 5,
        totalMarks: 25,
        headings: [{ title: "Long Answer Questions", plannedCount: 5 }],
      },
    ],
  },
  {
    id: "gseb-standard",
    name: "GSEB Standard Test",
    description:
      "Gujarat board format with fill-in-blanks, match pairs and essay sections",
    icon: "📗",
    totalMarks: 100,
    timeMinutes: 180,
    board: "GSEB",
    sections: [
      {
        title: "Section A",
        marks: 1,
        totalMarks: 30,
        headings: [
          { title: "Fill in the Blanks", plannedCount: 10 },
          { title: "Match the Following", plannedCount: 10 },
          { title: "True / False", plannedCount: 10 },
        ],
      },
      {
        title: "Section B",
        marks: 2,
        totalMarks: 20,
        headings: [{ title: "Short Questions", plannedCount: 10 }],
      },
      {
        title: "Section C",
        marks: 5,
        totalMarks: 50,
        headings: [{ title: "Essay Questions", plannedCount: 10 }],
      },
    ],
  },
  {
    id: "short-quiz",
    name: "Short Quiz",
    description: "Quick 30-minute quiz with MCQ and short answers",
    icon: "⚡",
    totalMarks: 25,
    timeMinutes: 30,
    board: "CBSE",
    sections: [
      {
        title: "Section A",
        marks: 1,
        totalMarks: 10,
        headings: [{ title: "Multiple Choice Questions", plannedCount: 10 }],
      },
      {
        title: "Section B",
        marks: 3,
        totalMarks: 15,
        headings: [{ title: "Short Answer Questions", plannedCount: 5 }],
      },
    ],
  },
  {
    id: "mcq-only",
    name: "MCQ Only",
    description: "Full objective test with only multiple choice questions",
    icon: "✅",
    totalMarks: 50,
    timeMinutes: 60,
    board: "CBSE",
    sections: [
      {
        title: "Section A",
        marks: 1,
        totalMarks: 30,
        headings: [{ title: "Single Correct Answer", plannedCount: 30 }],
      },
      {
        title: "Section B",
        marks: 2,
        totalMarks: 20,
        headings: [
          { title: "Assertion Reason Based Questions", plannedCount: 10 },
        ],
      },
    ],
  },
];

export interface SavedTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  totalMarks: number;
  timeMinutes: number;
  board: string;
  sections: Array<{
    title: string;
    marks: number;
    totalMarks: number;
    headings: Omit<QuestionHeading, "id">[];
  }>;
}

const SAVED_TEMPLATES_KEY = "test-paper-maker-templates";

export function getSavedTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(SAVED_TEMPLATES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedTemplate[];
  } catch {
    return [];
  }
}

export function saveTemplate(template: SavedTemplate): void {
  try {
    const existing = getSavedTemplates();
    const updated = [...existing.filter((t) => t.id !== template.id), template];
    localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

export function deleteTemplate(templateId: string): void {
  try {
    const existing = getSavedTemplates();
    const updated = existing.filter((t) => t.id !== templateId);
    localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

/** Convert a saved/built-in template's sections into PaperSection-like data for the editor */
export function templateSectionsToEditorSections(
  template: PaperTemplate | SavedTemplate,
): Array<{
  id: string;
  title: string;
  totalMarks: number;
  marks: number;
  questions: number;
  headings: QuestionHeading[];
}> {
  return template.sections.map((sec, idx) => ({
    id: `section-${Date.now()}-${idx}`,
    title: sec.title || `Section ${String.fromCharCode(65 + idx)}`,
    totalMarks: sec.totalMarks,
    marks: sec.marks,
    questions: 0,
    headings: sec.headings.map((h, hi) => ({
      id: `heading-${Date.now()}-${idx}-${hi}`,
      title: h.title,
      plannedCount: h.plannedCount,
    })),
  }));
}

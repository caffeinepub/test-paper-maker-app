import type { Paper, PaperSection, Question } from "../../state/mockData";

/**
 * Generate a unique question ID
 */
export function generateQuestionId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Deep clone a question with a new ID
 */
export function deepCloneQuestion(source: Question): Question {
  const cloned: Question = {
    id: generateQuestionId(),
    text: source.text,
    questionType: source.questionType,
    marks: source.marks,
    type: source.type,
    headingId: null, // Will be set by caller
    imageAttachment: source.imageAttachment,
  };

  // Deep clone type-specific data
  if (source.mcqOptions) {
    cloned.mcqOptions = {
      options: [...source.mcqOptions.options],
      correctAnswer: source.mcqOptions.correctAnswer,
    };
  }

  if (source.fillInBlankData) {
    cloned.fillInBlankData = {
      blanks: [...source.fillInBlankData.blanks],
    };
  }

  if (source.trueFalseData) {
    cloned.trueFalseData = {
      correctAnswer: source.trueFalseData.correctAnswer,
    };
  }

  if (source.matchPairsData) {
    cloned.matchPairsData = {
      pairs: source.matchPairsData.pairs.map((pair) => ({
        left:
          typeof pair.left === "string"
            ? pair.left
            : JSON.parse(JSON.stringify(pair.left)),
        right:
          typeof pair.right === "string"
            ? pair.right
            : JSON.parse(JSON.stringify(pair.right)),
      })),
    };
  }

  if (source.tableData) {
    cloned.tableData = {
      rows: source.tableData.rows,
      cols: source.tableData.cols,
      cells: source.tableData.cells.map((row) =>
        row.map((cell) =>
          typeof cell === "string" ? cell : JSON.parse(JSON.stringify(cell)),
        ),
      ),
      columnHeaders: source.tableData.columnHeaders
        ? [...source.tableData.columnHeaders]
        : undefined,
    };
  }

  return cloned;
}

/**
 * Compute the appropriate headingId for a question being inserted into a section
 */
export function computeHeadingId(section: PaperSection): string | null {
  if (!section.headings || section.headings.length === 0) {
    return null;
  }
  // Use the first heading
  return section.headings[0].id;
}

/**
 * Find the insertion index for questions under a specific heading
 * Returns the index after all questions of that heading, before the next heading's questions
 */
function findHeadingInsertionIndex(
  section: PaperSection,
  targetHeadingId: string,
): number {
  const headings = section.headings || [];
  const targetHeadingIndex = headings.findIndex(
    (h) => h.id === targetHeadingId,
  );

  if (targetHeadingIndex === -1) {
    // Heading not found, append to end
    return section.questions.length;
  }

  // Find the last question with this headingId
  let lastQuestionIndex = -1;
  for (let i = section.questions.length - 1; i >= 0; i--) {
    if (section.questions[i].headingId === targetHeadingId) {
      lastQuestionIndex = i;
      break;
    }
  }

  if (lastQuestionIndex !== -1) {
    // Insert after the last question of this heading
    return lastQuestionIndex + 1;
  }

  // No questions for this heading yet, find where to insert based on heading order
  // Insert before the first question of any subsequent heading
  const subsequentHeadings = headings.slice(targetHeadingIndex + 1);
  for (const heading of subsequentHeadings) {
    const firstQuestionIndex = section.questions.findIndex(
      (q) => q.headingId === heading.id,
    );
    if (firstQuestionIndex !== -1) {
      return firstQuestionIndex;
    }
  }

  // No subsequent heading questions found, append to end
  return section.questions.length;
}

/**
 * Insert a single question into a paper section
 */
export function insertQuestionIntoSection(
  paper: Paper,
  sectionId: string,
  sourceQuestion: Question,
): PaperSection[] {
  const clonedQuestion = deepCloneQuestion(sourceQuestion);

  return paper.sections.map((section) => {
    if (section.id === sectionId) {
      const headingId = computeHeadingId(section);
      clonedQuestion.headingId = headingId;
      return {
        ...section,
        questions: [...section.questions, clonedQuestion],
      };
    }
    return section;
  });
}

/**
 * Insert multiple questions into a paper section
 */
export function insertQuestionsIntoSection(
  paper: Paper,
  sectionId: string,
  sourceQuestions: Question[],
): PaperSection[] {
  const clonedQuestions = sourceQuestions.map((q) => deepCloneQuestion(q));

  return paper.sections.map((section) => {
    if (section.id === sectionId) {
      const headingId = computeHeadingId(section);
      for (const q of clonedQuestions) {
        q.headingId = headingId;
      }
      return {
        ...section,
        questions: [...section.questions, ...clonedQuestions],
      };
    }
    return section;
  });
}

/**
 * Insert a single question into a specific heading within a section
 */
export function insertQuestionIntoHeading(
  paper: Paper,
  sectionId: string,
  headingId: string,
  sourceQuestion: Question,
): PaperSection[] {
  const clonedQuestion = deepCloneQuestion(sourceQuestion);
  clonedQuestion.headingId = headingId;

  return paper.sections.map((section) => {
    if (section.id === sectionId) {
      const insertIndex = findHeadingInsertionIndex(section, headingId);
      const newQuestions = [...section.questions];
      newQuestions.splice(insertIndex, 0, clonedQuestion);
      return {
        ...section,
        questions: newQuestions,
      };
    }
    return section;
  });
}

/**
 * Insert multiple questions into a specific heading within a section
 */
export function insertQuestionsIntoHeading(
  paper: Paper,
  sectionId: string,
  headingId: string,
  sourceQuestions: Question[],
): PaperSection[] {
  const clonedQuestions = sourceQuestions.map((q) => {
    const cloned = deepCloneQuestion(q);
    cloned.headingId = headingId;
    return cloned;
  });

  return paper.sections.map((section) => {
    if (section.id === sectionId) {
      const insertIndex = findHeadingInsertionIndex(section, headingId);
      const newQuestions = [...section.questions];
      newQuestions.splice(insertIndex, 0, ...clonedQuestions);
      return {
        ...section,
        questions: newQuestions,
      };
    }
    return section;
  });
}

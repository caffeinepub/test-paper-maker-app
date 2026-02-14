import { Question, Paper, PaperSection } from '../../state/mockData';

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
        left: typeof pair.left === 'string' ? pair.left : JSON.parse(JSON.stringify(pair.left)),
        right: typeof pair.right === 'string' ? pair.right : JSON.parse(JSON.stringify(pair.right)),
      })),
    };
  }

  if (source.tableData) {
    cloned.tableData = {
      rows: source.tableData.rows,
      cols: source.tableData.cols,
      cells: source.tableData.cells.map((row) =>
        row.map((cell) => (typeof cell === 'string' ? cell : JSON.parse(JSON.stringify(cell))))
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
 * Insert a single question into a paper section
 */
export function insertQuestionIntoSection(
  paper: Paper,
  sectionId: string,
  sourceQuestion: Question
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
  sourceQuestions: Question[]
): PaperSection[] {
  const clonedQuestions = sourceQuestions.map((q) => deepCloneQuestion(q));

  return paper.sections.map((section) => {
    if (section.id === sectionId) {
      const headingId = computeHeadingId(section);
      clonedQuestions.forEach((q) => {
        q.headingId = headingId;
      });
      return {
        ...section,
        questions: [...section.questions, ...clonedQuestions],
      };
    }
    return section;
  });
}

interface SectionInsertContext {
  paperId: string;
  sectionId: string;
  headingId?: string;
  source: "question-bank" | "ai";
}

const STORAGE_KEY = "section-insert-context";

export function setSectionInsertContext(context: SectionInsertContext): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  } catch (error) {
    console.error("Failed to save section insert context:", error);
  }
}

export function getSectionInsertContext(): SectionInsertContext | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load section insert context:", error);
  }
  return null;
}

export function clearSectionInsertContext(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear section insert context:", error);
  }
}

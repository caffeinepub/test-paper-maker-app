import type { Paper, Profile } from "../../state/mockData";

/**
 * Creates a new Paper object with default values from the user's profile.
 * This ensures consistent paper creation across the app.
 */
export function createNewPaper(profile: Profile): Paper {
  return {
    id: `paper-${Date.now()}`,
    title: "Untitled Paper",
    subject: "",
    date: new Date().toISOString().split("T")[0],
    duration: "45 min",
    totalMarks: 25,
    timeMinutes: 45,
    board: profile.preferredBoard,
    standard: profile.defaultStandard || "",
    medium: profile.medium,
    sections: [],
    questions: [],
    createdAt: new Date(),
    layoutMode: "original",
  };
}

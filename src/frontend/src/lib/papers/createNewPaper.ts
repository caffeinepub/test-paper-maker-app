import { Paper, Profile } from '../../state/mockData';

/**
 * Creates a new Paper object with default values from the user's profile.
 * This ensures consistent paper creation across the app.
 */
export function createNewPaper(profile: Profile): Paper {
  return {
    id: `paper-${Date.now()}`,
    title: 'Untitled Paper',
    totalMarks: 25,
    timeMinutes: 45,
    board: profile.preferredBoard,
    standard: profile.defaultStandard || '',
    medium: profile.medium,
    sections: [],
    createdAt: new Date(),
    layoutMode: 'original',
  };
}

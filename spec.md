# Test Paper Maker App — Part 1 Build

## Current State
- App has full question bank, paper editor, export, and sharing features
- Language support: partially referenced in project context but UI strings are hardcoded English
- Paper Statistics: partially on export screen
- Answer Key: button exists on export screen but implementation quality unknown
- Theme: forced purple/white, splash screen, dynamic standards/subjects all working

## Requested Changes (Diff)

### Add
- Multi-language support for 11 languages: English, Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, Kannada, Malayalam, Punjabi, Urdu
  - Language switcher visible on Home screen and in Settings
  - All UI labels, buttons, navigation, and section headings translate
  - Language preference stored in localStorage
- Paper Statistics shown in paper editor toolbar and on export screen:
  - Total questions count
  - Total marks
  - Difficulty breakdown (Easy/Medium/Hard/Untagged) with percentages and progress bar
  - Section count
- Answer Key Generator: robust separate print window
  - Opens answer-only print page
  - Shows question number + answer (or "Not provided")
  - MCQ shows correct option letter + text
  - True/False shows True/False
  - Others show model answer text
  - Accessible from export screen AND from paper editor toolbar/3-dot menu

### Modify
- Home screen: add language switcher (dropdown or flag selector) prominently
- Settings screen: add language section with same switcher
- Export screen: improve Paper Statistics card with full breakdown
- Paper editor toolbar: add Stats button and Answer Key button

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/lib/i18n/translations.ts` — all UI string keys in 11 languages
2. Create `src/frontend/src/lib/i18n/useLanguage.ts` — hook to get/set language from localStorage, expose `t()` translation function
3. Update `HomeDashboardWireframe.tsx` — add LanguageSwitcher component
4. Update `SettingsWireframe.tsx` — add language section
5. Update `AppShell.tsx`, `NavigationDrawer.tsx` — apply translations to nav items
6. Update `ExportPrintPreviewWireframe.tsx` — improve stats card, ensure Answer Key button works correctly
7. Update `RealPaperEditorWireframe.tsx` — add Stats and Answer Key shortcuts in toolbar/3-dot menu
8. Apply `t()` translations across all major screens (Home, Settings, Question Bank, Editor, Export, Profile, Add Questions)

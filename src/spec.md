# Specification

## Summary
**Goal:** Restore the app’s previous purple-and-white theme across the UI and fix the “Draft” screen so it never appears blank.

**Planned changes:**
- Revert recent theme/token changes to consistently apply the prior purple primary accent with white/light surfaces in light mode and appropriate dark-mode equivalents.
- Remove any hard-coded component colors that override theme tokens and cause page-to-page inconsistency.
- Fix Draft navigation/screen rendering so it reliably shows draft content when available.
- Add clear, English empty-state messaging when no drafts exist, plus a visible error state with a retry or navigation action if loading fails.

**User-visible outcome:** The app looks consistently purple-and-white again (with accessible dark mode), and the Draft screen always displays content, an empty state, or an actionable error message instead of a blank page.

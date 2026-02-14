# Specification

## Summary
**Goal:** Fix question insertion from Question Bank and AI Assistant, enable inline editing in Question Bank, and correct match-pairs/table layouts in the Paper Editor.

**Planned changes:**
- Fix Question Bank “Use” so it inserts a full deep-copied Question object (all supported fields, including images/rich content), generates a new unique question id, and assigns headingId appropriately for the destination section.
- Fix AI Assistant “Add to Paper” so it inserts full Question objects into the correct paper section based on insert context, assigns headingId when headings exist, and shows a clear error when no insert context is present.
- Add inline editing for personal questions in Question Bank (“My Questions”): edit directly within the card, save changes to the existing store update method, and avoid breaking “Use”.
- Update match-pairs (Column A / Column B) editor + renderer so columns stay strictly side-by-side at all viewport widths (use horizontal scrolling/constrained layout instead of stacking).
- Improve table question UI: show “Column A” and “Column B” headers by default, make headers editable with persistence in table data, and render darker inner/outer borders (including in print view).
- Reduce extra whitespace/blank space when an image is inserted into a table cell while keeping image controls and text editing functional, including in print rendering.

**User-visible outcome:** Users can reliably insert full questions from the Question Bank or AI into the intended paper section (visible under the correct heading), edit personal Question Bank items inline, and see match-pairs and table questions render with correct side-by-side columns, editable headers, darker borders, and tighter table-cell image spacing.

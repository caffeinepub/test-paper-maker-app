# Specification

## Summary
**Goal:** Improve the Test Paper Maker editor UX for tables and match-pairs by fixing independent cell editing, adding inline images (upload + paste) with print-safe sizing/formatting, enforcing consistent table sizing, and updating light-mode theme colors to match the uploaded screenshots.

**Planned changes:**
- Update light-mode theme to match screenshots: set the home navigation drawer background to white and adjust all purple accents to a lighter purple across buttons, borders, highlights, and selected nav item (without breaking dark-mode toggle behavior).
- Fix table and match-pairs editing so typing applies to the focused cell/box (not the main question text field), consistently on mobile and desktop.
- Add inline image insertion inside table cells and match-pairs boxes via upload-from-device and paste-from-clipboard; support mixed content (text + images) within the same cell/box; ensure content is constrained so nothing overflows the cell/box boundary.
- Add image formatting controls for inserted images inside cells/boxes: default size 5×5 cm (adjustable), aspect ratio locked by default (unlockable), alignment controls, and optional per-image caption.
- Enforce table sizing rules: equal column widths across the whole table; equal cell heights per row (rows may differ from each other) in both editor and print preview as closely as possible.
- Ensure print-safe PDF/print preview rendering for tables/match-pairs with inline images/captions: predictable A4 sizing, wrapping/clipping within cell boundaries, and no editor-only UI elements in printed output.
- Update saved paper/question data handling to persist rich cell content (text + images + formatting metadata) with backward-compatible loading/normalization for existing localStorage data.

**User-visible outcome:** Users can reliably type independently in table cells and match-pairs boxes, insert and format images inline (upload or paste) without overflow, see consistent table sizing, export/print A4-safe output, and use an updated light-mode theme that matches the provided screenshots (white drawer + lighter purple accents).

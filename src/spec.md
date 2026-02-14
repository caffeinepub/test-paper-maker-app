# Specification

## Summary
**Goal:** Improve the question-bank workflow and paper export reliability by adding a full-screen Add Questions flow with immediate type auto-detect, fixing key UI text, ensuring bottom actions stay reachable on all screens, and resolving institute logo + print/PDF rendering issues.

**Planned changes:**
- Fix mobile/desktop layouts so bottom action buttons never overflow outside the visible viewport across affected screens (Question Bank, AI Assistant, editor/preview/export), including spacing so floating UI (e.g., FAB) does not cover critical CTAs.
- Add a small “Add Questions” button near the top of both the Home screen and the Question Bank screen; open a full-screen Add Questions page.
- Implement/enable the full-screen Add Questions flow for manual entry/paste of one or multiple questions without pre-selecting a question type; save to the personal Question Bank categorized by Board and Standard (not into a paper section/heading).
- Add immediate per-question type auto-detection upon add/paste; prompt the user to confirm the detected type or require selecting a type if rejected; save each question with its confirmed type.
- Update only the specified per-screen help/empty-state text:
  - Question Bank info text: “Select a board and standard to browse available questions. Add questions to sections to build your question paper.”
  - AI Assistant description: “Create questions based on selected topics, standards, and preferences.”
  - Board+Standard screen help text: “Find questions using question type”
  - Board+Standard empty state (when zero questions): “No questions added yet.\nStart by selecting add questions .”
- Fix Teacher Profile logo upload to allow selecting and persisting a logo, and display it wherever institute/branding is shown (profile, paper editor header, export/print preview).
- Make institute name editable in the paper editor and ensure logo + institute name layout is clean and aligned in both editor and exported/printed output.
- Ensure images and tables inside questions render correctly in export/print preview and print/PDF output (images auto-resize within margins with preserved aspect ratio; tables not clipped and remain readable).

**User-visible outcome:** Users can add questions directly into their personal Question Bank via a new full-screen Add Questions flow (with immediate type detection + confirmation), see corrected help text on the relevant screens, reliably access bottom action buttons on all devices, upload and use an institute logo and editable institute name in the editor and exports, and get print/PDF outputs where images/tables fit cleanly without clipping.

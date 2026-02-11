# Specification

## Summary
**Goal:** Restore real OCR extraction using OCR.space (replacing the current “Offline Mode” placeholder) while keeping the rest of the v18 app unchanged, and ensure a consistent purple theme across all pages and buttons.

**Planned changes:**
- Replace the OCR upload “Offline Mode” placeholder with a real HTTPS OCR.space integration that extracts text from user-selected images/PDFs when “Extract Questions” is clicked.
- Update OCR upload UI copy to describe the real OCR process (remove the offline/placeholder messaging).
- Store OCR.space extracted text and the parsed questions into the existing OCR session storage so the current /ocr/review approve flow continues to work unchanged.
- Add error handling for OCR failures (network/API/quota/unsupported files) with clear messaging and retry/select-another-file behavior.
- Adjust global theme tokens/styles so primary/secondary/accent and button variants render consistently purple across the entire app in both light and dark mode, without layout or feature changes.

**User-visible outcome:** Users can select an image/PDF on the OCR upload screen, run real OCR to extract text and auto-populate questions in the existing review/approve screen, and the app’s buttons and primary UI styling appear consistently purple across all pages (light and dark mode).

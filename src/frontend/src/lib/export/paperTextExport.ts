import type { Paper } from "../../state/mockData";

export function convertPaperToText(paper: Paper): string {
  const lines: string[] = [];

  // Header
  lines.push("=".repeat(60));
  lines.push(paper.title || "Test Paper");
  lines.push("=".repeat(60));
  lines.push("");

  // Metadata
  if (paper.board) lines.push(`Board: ${paper.board}`);
  if (paper.standard) lines.push(`Standard: ${paper.standard}`);
  if (paper.medium) lines.push(`Medium: ${paper.medium}`);
  if (paper.timeMinutes) lines.push(`Time: ${paper.timeMinutes} minutes`);
  lines.push("");
  lines.push("-".repeat(60));
  lines.push("");

  // Sections
  paper.sections.forEach((section, sectionIdx) => {
    lines.push(
      `SECTION ${sectionIdx + 1}: ${section.title || `${section.marks} Marks`}`,
    );
    lines.push("");

    // Headings
    section.headings.forEach((heading, _headingIdx) => {
      if (heading.title) {
        lines.push(
          `  ${heading.title} (${heading.plannedCount || 0} questions)`,
        );
        lines.push("");
      }

      // Questions under this heading
      const headingQuestions = section.questions.filter(
        (q) => q.headingId === heading.id,
      );
      headingQuestions.forEach((question, qIdx) => {
        const questionNumber = headingQuestions.length > 0 ? qIdx + 1 : "";
        lines.push(`  Q${questionNumber}. ${question.text}`);

        // Type-specific content
        if (question.questionType === "mcq" && question.mcqOptions) {
          question.mcqOptions.options.forEach((opt, optIdx) => {
            lines.push(`      ${String.fromCharCode(65 + optIdx)}) ${opt}`);
          });
        } else if (
          question.questionType === "fill-in-blank" &&
          question.fillInBlankData
        ) {
          lines.push("      [Fill in the blank]");
        } else if (question.questionType === "true-false") {
          lines.push("      [True/False]");
        }

        lines.push(
          `      [${question.marks} mark${question.marks !== 1 ? "s" : ""}]`,
        );
        lines.push("");
      });
    });

    lines.push("-".repeat(60));
    lines.push("");
  });

  // Footer
  lines.push("");
  lines.push("End of Paper");
  lines.push("=".repeat(60));

  return lines.join("\n");
}

export function downloadPaperAsText(paper: Paper): void {
  const textContent = convertPaperToText(paper);
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${paper.title || "test-paper"}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

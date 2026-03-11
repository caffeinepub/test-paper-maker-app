import {
  RichCellContent,
  cmToPixels,
  normalizeToRichContent,
} from "../../lib/editor/richCellContent";
import type { CellContent, Question } from "../../state/mockData";

interface PaperRendererProps {
  question: Question;
}

export function PaperRenderer({ question }: PaperRendererProps) {
  const renderRichContent = (content: CellContent) => {
    const richContent = normalizeToRichContent(content);

    return (
      <div className="rich-cell-container">
        <div className="rich-cell-content">
          {richContent.text && (
            <span className="break-words whitespace-pre-wrap">
              {richContent.text}
            </span>
          )}
          {richContent.images.map((image) => (
            <div
              key={image.id}
              className="rich-cell-image-wrapper"
              style={{ textAlign: image.alignment }}
            >
              <img
                src={image.dataUrl}
                alt={image.caption || "Cell image"}
                className="rich-cell-image"
                style={{
                  maxWidth: "100%",
                  width: `min(${cmToPixels(image.widthCm)}px, 100%)`,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
              {image.caption && (
                <div className="rich-cell-caption">{image.caption}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuestionContent = () => {
    switch (question.questionType) {
      case "mcq":
        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">
              {question.text || "[Question text]"}
            </p>
            {question.mcqOptions && (
              <div className="ml-4 space-y-1">
                {Array.from(question.mcqOptions.options.entries()).map(
                  ([idx, option]) => (
                    <div
                      key={`mcq-opt-${idx}`}
                      className="flex items-start gap-2"
                    >
                      <span className="font-medium shrink-0">
                        {String.fromCharCode(97 + idx)})
                      </span>
                      <span className="break-words">
                        {option || `[Option ${idx + 1}]`}
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        );

      case "numerical":
        return (
          <div className="space-y-1">
            <p className="break-words whitespace-pre-wrap">
              {question.text || "[Question text]"}
            </p>
          </div>
        );

      case "fill-in-blank":
        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">
              {question.text || "[Question text]"}
            </p>
            {question.fillInBlankData &&
              question.fillInBlankData.blanks.length > 0 && (
                <div className="ml-4 space-y-1">
                  {Array.from(question.fillInBlankData.blanks.entries()).map(
                    ([idx, blank]) => (
                      <div
                        key={`blank-${idx}`}
                        className="flex items-center gap-2"
                      >
                        <span className="font-medium shrink-0">{idx + 1}.</span>
                        <span className="inline-block min-w-[120px] border-b border-foreground/30 px-2 py-1">
                          {blank || ""}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}
          </div>
        );

      case "true-false":
        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">
              {question.text || "[Question text]"}
            </p>
            <div className="ml-4 flex gap-4">
              <span className="font-medium">True</span>
              <span className="font-medium">False</span>
            </div>
          </div>
        );

      case "match-pairs":
        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">
              {question.text || "[Question text]"}
            </p>
            {question.matchPairsData &&
              question.matchPairsData.pairs.length > 0 && (
                <div className="match-pair-container w-full overflow-hidden">
                  <table
                    className="w-full border-collapse"
                    style={{ tableLayout: "fixed" }}
                  >
                    <colgroup>
                      <col style={{ width: "50%" }} />
                      <col style={{ width: "50%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className="border border-border bg-muted/30 px-2 py-1 text-left text-sm font-semibold">
                          Column A
                        </th>
                        <th className="border border-border bg-muted/30 px-2 py-1 text-left text-sm font-semibold">
                          Column B
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(question.matchPairsData.pairs.entries()).map(
                        ([idx, pair]) => (
                          <tr key={`pair-row-${idx}`}>
                            <td
                              className="match-pair-item border border-border px-2 py-1 align-top"
                              style={{
                                overflow: "hidden",
                                wordWrap: "break-word",
                                wordBreak: "break-word",
                                maxWidth: 0,
                              }}
                            >
                              <div className="flex min-w-0 items-start gap-1">
                                <span className="shrink-0 text-sm font-medium">
                                  {idx + 1}.
                                </span>
                                <div className="min-w-0 flex-1 overflow-hidden text-sm">
                                  {renderRichContent(pair.left)}
                                </div>
                              </div>
                            </td>
                            <td
                              className="match-pair-item border border-border px-2 py-1 align-top"
                              style={{
                                overflow: "hidden",
                                wordWrap: "break-word",
                                wordBreak: "break-word",
                                maxWidth: 0,
                              }}
                            >
                              <div className="flex min-w-0 items-start gap-1">
                                <span className="shrink-0 text-sm font-medium">
                                  {String.fromCharCode(97 + idx)})
                                </span>
                                <div className="min-w-0 flex-1 overflow-hidden text-sm">
                                  {renderRichContent(pair.right)}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        );

      case "table": {
        const rows = question.tableData?.rows || 2;
        const cols = question.tableData?.cols || 2;
        const cells =
          question.tableData?.cells ||
          Array(rows)
            .fill(null)
            .map(() => Array(cols).fill(""));
        const columnHeaders =
          question.tableData?.columnHeaders ||
          Array(cols)
            .fill(null)
            .map((_, i) => `Column ${String.fromCharCode(65 + i)}`);

        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">
              {question.text || "[Question text]"}
            </p>
            <div className="ml-2 w-full overflow-hidden">
              <table className="equal-width-table table-dark-borders text-sm">
                <thead>
                  <tr>
                    {Array.from(columnHeaders.entries()).map(
                      ([colIdx, header]) => (
                        <th
                          key={`col-header-${colIdx}`}
                          className="border border-foreground/60 bg-muted/30 px-2 py-1 text-center font-semibold"
                          style={{ width: `${100 / cols}%` }}
                        >
                          {header}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(cells.entries()).map(([rowIdx, row]) => (
                    <tr key={`row-${rowIdx}`}>
                      {Array.from(row.entries()).map(([colIdx, cell]) => (
                        <td
                          key={`cell-${rowIdx}-${colIdx}`}
                          className="border border-foreground/60 px-2 py-1 align-top"
                          style={{ width: `${100 / cols}%` }}
                        >
                          {renderRichContent(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
      case "long-answer":
        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">
              {question.text || "[Question text]"}
            </p>
            <div className="ml-2 space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={`ans-line-${i}`}
                  className="h-6 w-full border-b border-foreground/20"
                />
              ))}
            </div>
          </div>
        );

      case "assertion-reason":
        return (
          <div className="space-y-2">
            {question.text && (
              <p className="break-words whitespace-pre-wrap">{question.text}</p>
            )}
            {question.assertionReasonData && (
              <div className="ml-2 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Assertion (A): </span>
                  {question.assertionReasonData.assertion || "[Assertion text]"}
                </p>
                <p>
                  <span className="font-semibold">Reason (R): </span>
                  {question.assertionReasonData.reason || "[Reason text]"}
                </p>
              </div>
            )}
            <div className="ml-4 space-y-0.5 text-xs text-muted-foreground">
              <p>
                (a) Both A and R are true and R is the correct explanation of A
              </p>
              <p>
                (b) Both A and R are true but R is not the correct explanation
                of A
              </p>
              <p>(c) A is true but R is false</p>
              <p>(d) A is false but R is true</p>
            </div>
          </div>
        );

      case "case-based":
        return (
          <div className="space-y-2">
            {question.text && (
              <p className="break-words whitespace-pre-wrap">{question.text}</p>
            )}
            {question.caseBasedData && (
              <div className="ml-2 space-y-3">
                {question.caseBasedData.passage && (
                  <div className="rounded border border-border bg-muted/20 p-2 text-sm italic">
                    {question.caseBasedData.passage}
                  </div>
                )}
                {question.caseBasedData.subQuestions.length > 0 && (
                  <div className="space-y-1">
                    {question.caseBasedData.subQuestions.map((sq, idx) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: sub-questions don't have stable IDs
                      <p key={`sq-${idx}`} className="text-sm">
                        ({idx + 1}) {sq || `[Sub-question ${idx + 1}]`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-1">
            <p className="break-words whitespace-pre-wrap">
              {question.text || "[Question text]"}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="question-block">
      {renderQuestionContent()}
      {question.imageAttachment && (
        <div className="mt-2 block w-full">
          <img
            src={question.imageAttachment}
            alt="Question attachment"
            className="block max-h-64 max-w-full rounded border border-border object-contain"
          />
        </div>
      )}
    </div>
  );
}

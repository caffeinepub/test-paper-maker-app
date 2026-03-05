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
                  width: `${cmToPixels(image.widthCm)}px`,
                  height: `${cmToPixels(image.heightCm)}px`,
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
                <div className="match-pair-container ml-2 overflow-hidden">
                  <table className="w-full border-collapse table-fixed">
                    <thead>
                      <tr>
                        <th className="w-1/2 border border-border bg-muted/30 px-2 py-1 text-left text-sm font-semibold">
                          Column A
                        </th>
                        <th className="w-1/2 border border-border bg-muted/30 px-2 py-1 text-left text-sm font-semibold">
                          Column B
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(question.matchPairsData.pairs.entries()).map(
                        ([idx, pair]) => (
                          <tr key={`pair-row-${idx}`}>
                            <td className="match-pair-item border border-border px-2 py-1 align-top min-w-0">
                              <div className="flex items-start gap-1 min-w-0">
                                <span className="font-medium shrink-0 text-sm">
                                  {idx + 1}.
                                </span>
                                <div className="flex-1 min-w-0 overflow-hidden text-sm">
                                  {renderRichContent(pair.left)}
                                </div>
                              </div>
                            </td>
                            <td className="match-pair-item border border-border px-2 py-1 align-top min-w-0">
                              <div className="flex items-start gap-1 min-w-0">
                                <span className="font-medium shrink-0 text-sm">
                                  {String.fromCharCode(97 + idx)})
                                </span>
                                <div className="flex-1 min-w-0 overflow-hidden text-sm">
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
        <div className="mt-2">
          <img
            src={question.imageAttachment}
            alt="Question attachment"
            className="max-h-64 rounded border border-border object-contain"
          />
        </div>
      )}
    </div>
  );
}

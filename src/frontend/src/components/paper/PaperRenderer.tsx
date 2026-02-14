import { Question, CellContent } from '../../state/mockData';
import { RichCellContent, normalizeToRichContent, cmToPixels } from '../../lib/editor/richCellContent';

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
            <span className="break-words whitespace-pre-wrap">{richContent.text}</span>
          )}
          {richContent.images.map((image) => (
            <div
              key={image.id}
              className="rich-cell-image-wrapper"
              style={{ textAlign: image.alignment }}
            >
              <img
                src={image.dataUrl}
                alt={image.caption || 'Cell image'}
                className="rich-cell-image"
                style={{
                  width: `${cmToPixels(image.widthCm)}px`,
                  height: `${cmToPixels(image.heightCm)}px`,
                  objectFit: 'contain',
                }}
              />
              {image.caption && <div className="rich-cell-caption">{image.caption}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQuestionContent = () => {
    switch (question.questionType) {
      case 'mcq':
        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">{question.text || '[Question text]'}</p>
            {question.mcqOptions && (
              <div className="ml-4 space-y-1">
                {question.mcqOptions.options.map((option, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-medium shrink-0">
                      {String.fromCharCode(97 + idx)})
                    </span>
                    <span className="break-words">{option || `[Option ${idx + 1}]`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'numerical':
        return (
          <div className="space-y-1">
            <p className="break-words whitespace-pre-wrap">{question.text || '[Question text]'}</p>
          </div>
        );

      case 'fill-in-blank':
        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">{question.text || '[Question text]'}</p>
            {question.fillInBlankData && question.fillInBlankData.blanks.length > 0 && (
              <div className="ml-4 space-y-1">
                {question.fillInBlankData.blanks.map((blank, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-medium shrink-0">{idx + 1}.</span>
                    <span className="inline-block min-w-[120px] border-b border-foreground/30 px-2 py-1">
                      {blank || ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">{question.text || '[Question text]'}</p>
            <div className="ml-4 flex gap-4">
              <span className="font-medium">True</span>
              <span className="font-medium">False</span>
            </div>
          </div>
        );

      case 'match-pairs':
        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">{question.text || '[Question text]'}</p>
            {question.matchPairsData && question.matchPairsData.pairs.length > 0 && (
              <div className="ml-4">
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-2 gap-4 min-w-[500px]">
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Column A</p>
                      {question.matchPairsData.pairs.map((pair, idx) => (
                        <div
                          key={idx}
                          className="match-pair-item flex items-start gap-2 border border-border rounded p-2 min-h-[3rem]"
                          style={{ width: '100%' }}
                        >
                          <span className="font-medium shrink-0">{idx + 1}.</span>
                          <div className="flex-1 overflow-hidden">
                            {renderRichContent(pair.left)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Column B</p>
                      {question.matchPairsData.pairs.map((pair, idx) => (
                        <div
                          key={idx}
                          className="match-pair-item flex items-start gap-2 border border-border rounded p-2 min-h-[3rem]"
                          style={{ width: '100%' }}
                        >
                          <span className="font-medium shrink-0">{String.fromCharCode(97 + idx)})</span>
                          <div className="flex-1 overflow-hidden">
                            {renderRichContent(pair.right)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'table':
        const rows = question.tableData?.rows || 2;
        const cols = question.tableData?.cols || 2;
        const cells = question.tableData?.cells || Array(rows).fill(null).map(() => Array(cols).fill(''));
        const columnHeaders = question.tableData?.columnHeaders || Array(cols).fill(null).map((_, i) => `Column ${String.fromCharCode(65 + i)}`);

        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">{question.text || '[Question text]'}</p>
            <div className="ml-4 overflow-x-auto">
              <table className="equal-width-table table-dark-borders">
                <thead>
                  <tr>
                    {columnHeaders.map((header, colIdx) => (
                      <th
                        key={colIdx}
                        className="border-2 border-foreground/60 bg-muted/30 p-2 text-center font-semibold"
                        style={{ width: `${100 / cols}%` }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cells.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, colIdx) => (
                        <td
                          key={colIdx}
                          className="border-2 border-foreground/60 p-2 align-top"
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

      case 'short-answer':
      default:
        return (
          <div className="space-y-1">
            <p className="break-words whitespace-pre-wrap">{question.text || '[Question text]'}</p>
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

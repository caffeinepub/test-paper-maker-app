import { Question } from '../../state/mockData';

interface PaperRendererProps {
  question: Question;
}

export function PaperRenderer({ question }: PaperRendererProps) {
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
              <div className="ml-4 max-w-full overflow-x-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Column A</p>
                    {question.matchPairsData.pairs.map((pair, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-medium shrink-0">{idx + 1}.</span>
                        <span className="break-words">{pair.left || `[Item ${idx + 1}]`}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Column B</p>
                    {question.matchPairsData.pairs.map((pair, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-medium shrink-0">{String.fromCharCode(97 + idx)})</span>
                        <span className="break-words">{pair.right || `[Item ${String.fromCharCode(97 + idx)}]`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'table':
        return (
          <div className="space-y-2">
            <p className="break-words whitespace-pre-wrap">{question.text || '[Question text]'}</p>
            {question.tableData && (
              <div className="ml-4 max-w-full overflow-x-auto">
                <table className="min-w-0 w-full border-collapse border border-foreground/30">
                  <tbody>
                    {question.tableData.cells.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="border border-foreground/30 px-3 py-2 break-words"
                          >
                            {cell || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'short-answer':
      default:
        return <p className="break-words whitespace-pre-wrap">{question.text || '[Question text]'}</p>;
    }
  };

  return (
    <div className="text-foreground space-y-3">
      {renderQuestionContent()}
      
      {/* Render attached image as a separate block */}
      {question.imageAttachment && (
        <div className="mt-3 ml-4">
          <img
            src={question.imageAttachment}
            alt="Question attachment"
            className="max-w-full h-auto rounded border border-border"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
}

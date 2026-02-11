import { useEffect, useRef, forwardRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface AutoGrowTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  minRows?: number;
  maxRows?: number;
}

export const AutoGrowTextarea = forwardRef<HTMLTextAreaElement, AutoGrowTextareaProps>(
  ({ value, minRows = 1, maxRows = 10, className, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate the new height based on content
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      
      // Enable scrolling only if content exceeds maxRows
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }, [value, minRows, maxRows, textareaRef]);

    return (
      <Textarea
        ref={textareaRef}
        value={value}
        className={cn('resize-none overflow-hidden w-full', className)}
        {...props}
      />
    );
  }
);

AutoGrowTextarea.displayName = 'AutoGrowTextarea';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { CellContent } from '../../state/mockData';
import {
  RichCellContent,
  RichCellImage,
  normalizeToRichContent,
  extractImageFromClipboard,
  extractImageFromFile,
  cmToPixels,
} from '../../lib/editor/richCellContent';

interface RichCellEditorProps {
  value: CellContent;
  onChange: (content: RichCellContent) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function RichCellEditor({ value, onChange, placeholder, autoFocus }: RichCellEditorProps) {
  const [richContent, setRichContent] = useState<RichCellContent>(() => normalizeToRichContent(value));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRichContent(normalizeToRichContent(value));
  }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handleTextChange = (newText: string) => {
    const updated = { ...richContent, text: newText };
    setRichContent(updated);
    onChange(updated);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const imageData = await extractImageFromClipboard(e.nativeEvent);
    if (imageData) {
      e.preventDefault();
      const newImage: RichCellImage = {
        id: `img-${Date.now()}`,
        dataUrl: imageData,
        widthCm: 4,
        heightCm: 3,
        aspectRatioLocked: true,
        alignment: 'left',
        caption: '',
      };
      const updated = { ...richContent, images: [...richContent.images, newImage] };
      setRichContent(updated);
      onChange(updated);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageData = await extractImageFromFile(file);
      if (imageData) {
        const newImage: RichCellImage = {
          id: `img-${Date.now()}`,
          dataUrl: imageData,
          widthCm: 4,
          heightCm: 3,
          aspectRatioLocked: true,
          alignment: 'left',
          caption: '',
        };
        const updated = { ...richContent, images: [...richContent.images, newImage] };
        setRichContent(updated);
        onChange(updated);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpdate = (imageId: string, updates: Partial<RichCellImage>) => {
    const updated = {
      ...richContent,
      images: richContent.images.map((img) => (img.id === imageId ? { ...img, ...updates } : img)),
    };
    setRichContent(updated);
    onChange(updated);
  };

  const handleImageDelete = (imageId: string) => {
    const updated = {
      ...richContent,
      images: richContent.images.filter((img) => img.id !== imageId),
    };
    setRichContent(updated);
    onChange(updated);
  };

  return (
    <div
      className="rich-cell-editor-container"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <textarea
        ref={textareaRef}
        value={richContent.text}
        onChange={(e) => handleTextChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
        className="w-full resize-none border-0 bg-transparent p-1 text-sm focus:outline-none focus:ring-0"
        rows={2}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      />

      {richContent.images.map((image) => (
        <div
          key={image.id}
          className="rich-cell-image-wrapper mt-1 mb-1"
          style={{ textAlign: image.alignment }}
        >
          <div className="relative inline-block max-w-full">
            <img
              src={image.dataUrl}
              alt={image.caption || 'Cell image'}
              className="rich-cell-image max-w-full"
              style={{
                width: `${cmToPixels(image.widthCm)}px`,
                height: `${cmToPixels(image.heightCm)}px`,
                objectFit: 'contain',
              }}
            />
            <div className="rich-cell-image-controls">
              <Button
                variant="secondary"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageDelete(image.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="mt-1 space-y-1">
            <div className="flex gap-1">
              <Button
                variant={image.alignment === 'left' ? 'default' : 'outline'}
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageUpdate(image.id, { alignment: 'left' });
                }}
              >
                <AlignLeft className="h-3 w-3" />
              </Button>
              <Button
                variant={image.alignment === 'center' ? 'default' : 'outline'}
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageUpdate(image.id, { alignment: 'center' });
                }}
              >
                <AlignCenter className="h-3 w-3" />
              </Button>
              <Button
                variant={image.alignment === 'right' ? 'default' : 'outline'}
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageUpdate(image.id, { alignment: 'right' });
                }}
              >
                <AlignRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-1 items-center">
              <Label className="text-xs shrink-0">W:</Label>
              <Input
                type="number"
                value={image.widthCm}
                onChange={(e) => {
                  e.stopPropagation();
                  handleImageUpdate(image.id, { widthCm: parseFloat(e.target.value) || 1 });
                }}
                className="h-6 w-16 text-xs"
                step="0.5"
                min="1"
                max="15"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
              <Label className="text-xs shrink-0">H:</Label>
              <Input
                type="number"
                value={image.heightCm}
                onChange={(e) => {
                  e.stopPropagation();
                  handleImageUpdate(image.id, { heightCm: parseFloat(e.target.value) || 1 });
                }}
                className="h-6 w-16 text-xs"
                step="0.5"
                min="1"
                max="15"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <Input
              value={image.caption}
              onChange={(e) => {
                e.stopPropagation();
                handleImageUpdate(image.id, { caption: e.target.value });
              }}
              placeholder="Caption (optional)"
              className="h-6 text-xs"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ))}

      <div className="mt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <ImageIcon className="mr-1 h-3 w-3" />
          Add Image
        </Button>
      </div>
    </div>
  );
}

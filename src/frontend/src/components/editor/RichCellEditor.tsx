import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Image as ImageIcon, Trash2, Lock, Unlock, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { CellContent } from '../../state/mockData';
import {
  RichCellContent,
  RichCellImage,
  createRichCellImage,
  extractImageFromClipboard,
  extractImageFromFile,
  normalizeToRichContent,
  cmToPixels,
  updateImageSize,
} from '../../lib/editor/richCellContent';

interface RichCellEditorProps {
  value: CellContent;
  onChange: (content: RichCellContent) => void;
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

export function RichCellEditor({
  value,
  onChange,
  placeholder,
  className = '',
  onFocus,
  onBlur,
  autoFocus,
}: RichCellEditorProps) {
  const [content, setContent] = useState<RichCellContent>(() => normalizeToRichContent(value));
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setContent(normalizeToRichContent(value));
  }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const handleTextChange = (newText: string) => {
    const newContent = { ...content, text: newText };
    setContent(newContent);
    onChange(newContent);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const imageDataUrl = await extractImageFromClipboard(e.nativeEvent);
    if (imageDataUrl) {
      e.preventDefault();
      const newImage = createRichCellImage(imageDataUrl);
      const newContent = {
        ...content,
        images: [...content.images, newImage],
      };
      setContent(newContent);
      onChange(newContent);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageDataUrl = await extractImageFromFile(file);
      if (imageDataUrl) {
        const newImage = createRichCellImage(imageDataUrl);
        const newContent = {
          ...content,
          images: [...content.images, newImage],
        };
        setContent(newContent);
        onChange(newContent);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpdate = (imageId: string, updates: Partial<RichCellImage>) => {
    const newContent = {
      ...content,
      images: content.images.map((img) =>
        img.id === imageId ? { ...img, ...updates } : img
      ),
    };
    setContent(newContent);
    onChange(newContent);
  };

  const handleImageSizeChange = (imageId: string, widthCm: number, heightCm: number) => {
    const image = content.images.find((img) => img.id === imageId);
    if (!image) return;

    const updatedImage = updateImageSize(image, widthCm, heightCm);
    const newContent = {
      ...content,
      images: content.images.map((img) => (img.id === imageId ? updatedImage : img)),
    };
    setContent(newContent);
    onChange(newContent);
  };

  const handleImageDelete = (imageId: string) => {
    const newContent = {
      ...content,
      images: content.images.filter((img) => img.id !== imageId),
    };
    setContent(newContent);
    onChange(newContent);
    setEditingImageId(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`rich-cell-container ${className}`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className="rich-cell-content">
        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={content.text}
          onChange={(e) => handleTextChange(e.target.value)}
          onPaste={handlePaste}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-full resize-none border-0 bg-transparent p-1 text-sm focus:outline-none focus:ring-0"
          rows={2}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />

        {/* Images */}
        {content.images.map((image) => (
          <div
            key={image.id}
            className="rich-cell-image-wrapper"
            style={{
              textAlign: image.alignment,
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
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

            {/* Image controls */}
            <div className="rich-cell-image-controls no-print">
              <Popover
                open={editingImageId === image.id}
                onOpenChange={(open) => setEditingImageId(open ? image.id : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <ImageIcon className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-64"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Image Settings</h4>

                    {/* Size controls */}
                    <div className="space-y-2">
                      <Label className="text-xs">Size (cm)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={image.widthCm.toFixed(1)}
                          onChange={(e) =>
                            handleImageSizeChange(
                              image.id,
                              parseFloat(e.target.value) || 1,
                              image.heightCm
                            )
                          }
                          step="0.1"
                          min="0.5"
                          max="20"
                          className="h-8 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-xs">×</span>
                        <Input
                          type="number"
                          value={image.heightCm.toFixed(1)}
                          onChange={(e) =>
                            handleImageSizeChange(
                              image.id,
                              image.widthCm,
                              parseFloat(e.target.value) || 1
                            )
                          }
                          step="0.1"
                          min="0.5"
                          max="20"
                          className="h-8 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="icon"
                          variant={image.aspectRatioLocked ? 'default' : 'outline'}
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageUpdate(image.id, {
                              aspectRatioLocked: !image.aspectRatioLocked,
                            });
                          }}
                        >
                          {image.aspectRatioLocked ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Unlock className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Alignment */}
                    <div className="space-y-2">
                      <Label className="text-xs">Alignment</Label>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={image.alignment === 'left' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageUpdate(image.id, { alignment: 'left' });
                          }}
                        >
                          <AlignLeft className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={image.alignment === 'center' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageUpdate(image.id, { alignment: 'center' });
                          }}
                        >
                          <AlignCenter className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={image.alignment === 'right' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageUpdate(image.id, { alignment: 'right' });
                          }}
                        >
                          <AlignRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Caption */}
                    <div className="space-y-2">
                      <Label className="text-xs">Caption</Label>
                      <Input
                        value={image.caption}
                        onChange={(e) =>
                          handleImageUpdate(image.id, { caption: e.target.value })
                        }
                        placeholder="Add caption..."
                        className="h-8 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <Separator />

                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageDelete(image.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete Image
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        ))}

        {/* Add image button */}
        <div className="no-print">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
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
    </div>
  );
}


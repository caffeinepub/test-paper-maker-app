/**
 * Rich cell content utilities for table cells and match-pairs boxes
 * Supports text + inline images with formatting metadata
 */

import { CellContent } from '../../state/mockData';

export interface RichCellImage {
  id: string;
  dataUrl: string;
  widthCm: number;
  heightCm: number;
  aspectRatioLocked: boolean;
  alignment: 'left' | 'center' | 'right';
  caption: string;
}

export interface RichCellContent {
  text: string;
  images: RichCellImage[];
}

/**
 * Default image size in cm (5x5 as specified)
 */
export const DEFAULT_IMAGE_SIZE_CM = 5;

/**
 * Convert cm to pixels for display (assuming 96 DPI)
 */
export function cmToPixels(cm: number): number {
  return (cm * 96) / 2.54;
}

/**
 * Convert pixels to cm for storage
 */
export function pixelsToCm(pixels: number): number {
  return (pixels * 2.54) / 96;
}

/**
 * Create a new rich cell image from a data URL
 */
export function createRichCellImage(dataUrl: string): RichCellImage {
  return {
    id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dataUrl,
    widthCm: DEFAULT_IMAGE_SIZE_CM,
    heightCm: DEFAULT_IMAGE_SIZE_CM,
    aspectRatioLocked: true,
    alignment: 'left',
    caption: '',
  };
}

/**
 * Extract image from clipboard paste event
 */
export async function extractImageFromClipboard(event: ClipboardEvent): Promise<string | null> {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      const blob = item.getAsFile();
      if (blob) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }
    }
  }
  return null;
}

/**
 * Extract image from file input
 */
export async function extractImageFromFile(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Normalize legacy string content to rich content
 */
export function normalizeToRichContent(value: CellContent): RichCellContent {
  if (typeof value === 'string') {
    return { text: value, images: [] };
  }
  // If it's already a RichCellContent object
  if (value && typeof value === 'object' && 'text' in value && 'images' in value) {
    return value as RichCellContent;
  }
  // Fallback for any other type
  return { text: '', images: [] };
}

/**
 * Convert rich content to plain string (for backward compatibility)
 */
export function richContentToString(content: RichCellContent): string {
  return content.text;
}

/**
 * Update image size with aspect ratio lock
 */
export function updateImageSize(
  image: RichCellImage,
  newWidth: number,
  newHeight: number
): RichCellImage {
  if (image.aspectRatioLocked) {
    const aspectRatio = image.widthCm / image.heightCm;
    // If width changed more, adjust height
    if (Math.abs(newWidth - image.widthCm) > Math.abs(newHeight - image.heightCm)) {
      return {
        ...image,
        widthCm: newWidth,
        heightCm: newWidth / aspectRatio,
      };
    } else {
      // Height changed more, adjust width
      return {
        ...image,
        widthCm: newHeight * aspectRatio,
        heightCm: newHeight,
      };
    }
  }
  return {
    ...image,
    widthCm: newWidth,
    heightCm: newHeight,
  };
}


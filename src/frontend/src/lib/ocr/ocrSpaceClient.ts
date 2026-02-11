/**
 * OCR.space API client for real text extraction from images and PDFs
 * Free tier: 25,000 requests/month with rate limiting
 */

export interface OCRResult {
  success: boolean;
  extractedText: string;
  error?: string;
  errorDetails?: string;
}

const OCR_SPACE_API_URL = 'https://api.ocr.space/parse/image';
// Using the free API key provided by OCR.space (has rate limits)
const FREE_API_KEY = 'K87899142388957';

/**
 * Extract text from an image or PDF file using OCR.space API
 */
export async function extractTextFromFile(file: File): Promise<OCRResult> {
  // Validate file type
  const supportedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'application/pdf',
  ];

  if (!supportedTypes.includes(file.type)) {
    return {
      success: false,
      extractedText: '',
      error: 'Unsupported file type',
      errorDetails: `Please upload a JPG, PNG, GIF, BMP, TIFF, or PDF file. Your file type: ${file.type}`,
    };
  }

  // Check file size (max 1MB for free tier)
  const maxSize = 1024 * 1024; // 1MB
  if (file.size > maxSize) {
    return {
      success: false,
      extractedText: '',
      error: 'File too large',
      errorDetails: `File size must be under 1MB. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);

    // Prepare form data
    const formData = new FormData();
    formData.append('apikey', FREE_API_KEY);
    formData.append('base64Image', base64);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 is more accurate for general text

    // Make API request
    const response = await fetch(OCR_SPACE_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return {
        success: false,
        extractedText: '',
        error: 'Network error',
        errorDetails: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json();

    // Check for API errors
    if (result.IsErroredOnProcessing) {
      const errorMessages = result.ErrorMessage || [];
      return {
        success: false,
        extractedText: '',
        error: 'OCR processing failed',
        errorDetails: Array.isArray(errorMessages) ? errorMessages.join(', ') : String(errorMessages),
      };
    }

    // Check for rate limit or quota errors
    if (result.OCRExitCode === 99) {
      return {
        success: false,
        extractedText: '',
        error: 'API limit reached',
        errorDetails: 'The free OCR API limit has been reached. Please try again later or use a different file.',
      };
    }

    // Extract text from results
    const parsedResults = result.ParsedResults || [];
    if (parsedResults.length === 0) {
      return {
        success: false,
        extractedText: '',
        error: 'No text found',
        errorDetails: 'The OCR service could not find any text in the image. Please ensure the image is clear and contains readable text.',
      };
    }

    const extractedText = parsedResults
      .map((r: any) => r.ParsedText || '')
      .join('\n\n')
      .trim();

    if (!extractedText) {
      return {
        success: false,
        extractedText: '',
        error: 'No text extracted',
        errorDetails: 'The image was processed but no text could be extracted. Please try a clearer image.',
      };
    }

    return {
      success: true,
      extractedText,
    };
  } catch (error) {
    console.error('OCR extraction error:', error);
    return {
      success: false,
      extractedText: '',
      error: 'Extraction failed',
      errorDetails: error instanceof Error ? error.message : 'An unexpected error occurred during OCR processing.',
    };
  }
}

/**
 * Convert a File to base64 string with data URI prefix
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

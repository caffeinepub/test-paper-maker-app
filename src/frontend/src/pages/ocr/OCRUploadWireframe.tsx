import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileImage, FileText, Info, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateMockExtractedQuestions, saveOCRSession } from '../../lib/ocr/mockOcrExtractor';
import { extractTextFromFile } from '../../lib/ocr/ocrSpaceClient';

export function OCRUploadWireframe() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<{ message: string; details?: string } | null>(null);
  const [extractionProgress, setExtractionProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
      setExtractionError(null);
      setExtractionProgress('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setExtractionError(null);
    setExtractionProgress('Uploading file to OCR service...');

    try {
      // Perform real OCR extraction
      const result = await extractTextFromFile(selectedFile);

      if (!result.success) {
        setExtractionError({
          message: result.error || 'OCR extraction failed',
          details: result.errorDetails,
        });
        setIsExtracting(false);
        setExtractionProgress('');
        return;
      }

      setExtractionProgress('Processing extracted text...');

      // Generate questions from extracted text
      const session = generateMockExtractedQuestions(selectedFile, result.extractedText);
      saveOCRSession(session);

      setExtractionProgress('Complete!');
      
      // Navigate to review page
      setTimeout(() => {
        navigate({ to: '/ocr/review' });
      }, 500);
    } catch (error) {
      console.error('Extraction error:', error);
      setExtractionError({
        message: 'Unexpected error',
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
      setIsExtracting(false);
      setExtractionProgress('');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractionError(null);
    setExtractionProgress('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">OCR Upload</h1>
        <p className="mt-2 text-muted-foreground">Extract questions from images or PDFs using OCR</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload an image or PDF containing questions to extract automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Real OCR Extraction:</strong> This app uses OCR.space API to automatically extract text from your documents.
              The free tier supports up to 25,000 requests per month.
            </AlertDescription>
          </Alert>

          <div
            className={`flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border bg-muted/20'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="text-center">
                <FileImage className="mx-auto mb-4 h-16 w-16 text-primary" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {selectedFile.name}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isExtracting}
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <>
                <Upload className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Drag & drop files here
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">or click to browse</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileImage className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </>
            )}
          </div>

          {extractionProgress && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="text-sm">
                {extractionProgress}
              </AlertDescription>
            </Alert>
          )}

          {extractionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="font-semibold">{extractionError.message}</div>
                {extractionError.details && (
                  <div className="text-sm">{extractionError.details}</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <FileImage className="h-5 w-5" />
            <span>Supported: JPG, PNG, GIF, BMP, TIFF</span>
            <FileText className="h-5 w-5" />
            <span>PDF (max 1MB)</span>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate({ to: '/home' })} disabled={isExtracting}>
              Cancel
            </Button>
            <Button onClick={handleExtract} disabled={!selectedFile || isExtracting}>
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Extract Questions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

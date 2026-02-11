import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileImage, FileText, Info, Loader2 } from 'lucide-react';
import { generateMockExtractedQuestions, saveOCRSession } from '../../lib/ocr/mockOcrExtractor';

export function OCRUploadWireframe() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
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

    // Simulate extraction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock extracted questions
    const session = generateMockExtractedQuestions(selectedFile);
    saveOCRSession(session);

    setIsExtracting(false);
    navigate({ to: '/ocr/review' });
  };

  return (
    <div className="container mx-auto max-w-3xl p-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">OCR Upload</h1>
        <p className="mt-2 text-muted-foreground">Extract questions from images or PDFs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload an image or PDF containing questions to extract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Offline Mode:</strong> OCR extraction is simulated locally.
              Results will open in a review screen before insertion.
            </AlertDescription>
          </Alert>

          <div
            className={`flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
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
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
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

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <FileImage className="h-5 w-5" />
            <span>Supported: JPG, PNG</span>
            <FileText className="h-5 w-5" />
            <span>PDF</span>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate({ to: '/home' })}>
              Cancel
            </Button>
            <Button onClick={handleExtract} disabled={!selectedFile || isExtracting}>
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                'Extract Questions'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

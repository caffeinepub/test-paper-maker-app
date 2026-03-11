import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  FileImage,
  FileText,
  Loader2,
  ScanText,
  Upload,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  generateMockExtractedQuestions,
  saveOCRSession,
} from "../../lib/ocr/mockOcrExtractor";
import { extractTextFromFile } from "../../lib/ocr/ocrSpaceClient";

export function OCRUploadWireframe() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<{
    message: string;
    details?: string;
  } | null>(null);
  const [extractionProgress, setExtractionProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (
      file &&
      (file.type.startsWith("image/") || file.type === "application/pdf")
    ) {
      setSelectedFile(file);
      setExtractionError(null);
      setExtractionProgress("");
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
    setExtractionProgress("Uploading file to OCR service...");

    try {
      const result = await extractTextFromFile(selectedFile);

      if (!result.success) {
        setExtractionError({
          message: result.error || "OCR extraction failed",
          details: result.errorDetails,
        });
        setIsExtracting(false);
        setExtractionProgress("");
        return;
      }

      setExtractionProgress("Processing extracted text...");

      const session = generateMockExtractedQuestions(
        selectedFile,
        result.extractedText,
      );
      saveOCRSession(session);

      setExtractionProgress("Complete!");

      setTimeout(() => {
        navigate({ to: "/ocr/review" });
      }, 500);
    } catch (error) {
      console.error("Extraction error:", error);
      setExtractionError({
        message: "Unexpected error",
        details:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
      setIsExtracting(false);
      setExtractionProgress("");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setExtractionError(null);
    setExtractionProgress("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  return (
    <div
      className="min-h-screen p-4 py-8"
      style={{
        background:
          "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f3e8ff 100%)",
        colorScheme: "light",
      }}
    >
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
          >
            <ScanText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "#4c1d95" }}>
            OCR Scanner
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#6d28d9" }}>
            Extract questions from images or PDFs instantly
          </p>
        </div>

        {/* Info Banner */}
        <div
          className="mb-6 flex items-start gap-3 rounded-xl p-4"
          style={{
            background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
            border: "1px solid #c4b5fd",
          }}
        >
          <Zap
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: "#7c3aed" }}
          />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#4c1d95" }}>
              Powered by OCR.space API
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#6d28d9" }}>
              Upload a clear image of your question paper. Text will be
              extracted automatically and converted into questions.
            </p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          className="mb-6 flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer"
          aria-label="Upload file area"
          style={{
            borderColor: isDragging
              ? "#7c3aed"
              : selectedFile
                ? "#7c3aed"
                : "#c4b5fd",
            background: isDragging
              ? "rgba(124, 58, 237, 0.08)"
              : selectedFile
                ? "rgba(124, 58, 237, 0.05)"
                : "rgba(255, 255, 255, 0.7)",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !selectedFile) {
              fileInputRef.current?.click();
            }
          }}
        >
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <div
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #7c3aed22, #6d28d922)",
                }}
              >
                <FileImage className="h-10 w-10" style={{ color: "#7c3aed" }} />
              </div>
              <h3
                className="mb-1 text-lg font-bold"
                style={{ color: "#4c1d95" }}
              >
                {selectedFile.name}
              </h3>
              <p className="mb-4 text-sm" style={{ color: "#6d28d9" }}>
                {(selectedFile.size / 1024).toFixed(1)} KB •{" "}
                {selectedFile.type.includes("pdf")
                  ? "PDF Document"
                  : "Image File"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                disabled={isExtracting}
                style={{ borderColor: "#c4b5fd", color: "#7c3aed" }}
              >
                Choose Different File
              </Button>
            </div>
          ) : (
            <>
              <div
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
                style={{ background: "rgba(124, 58, 237, 0.1)" }}
              >
                <Upload className="h-10 w-10" style={{ color: "#7c3aed" }} />
              </div>
              <h3
                className="mb-1 text-xl font-bold"
                style={{ color: "#4c1d95" }}
              >
                Drop your file here
              </h3>
              <p className="mb-5 text-sm" style={{ color: "#6d28d9" }}>
                or tap to browse from your device
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  style={{
                    borderColor: "#7c3aed",
                    color: "#7c3aed",
                    background: "white",
                  }}
                >
                  <FileImage className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    color: "white",
                  }}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Supported Formats */}
        <div
          className="mb-6 flex flex-wrap items-center justify-center gap-4 rounded-xl p-3"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid #e9d5ff",
          }}
        >
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "#6d28d9" }}
          >
            <FileImage className="h-4 w-4" />
            <span>JPG, PNG, GIF, BMP, TIFF</span>
          </div>
          <div className="h-4 w-px" style={{ background: "#c4b5fd" }} />
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "#6d28d9" }}
          >
            <FileText className="h-4 w-4" />
            <span>PDF (max 1MB)</span>
          </div>
        </div>

        {/* Progress / Error */}
        {extractionProgress && (
          <div
            className="mb-4 flex items-center gap-3 rounded-xl p-4"
            style={{ background: "#ede9fe", border: "1px solid #c4b5fd" }}
          >
            {extractionProgress === "Complete!" ? (
              <CheckCircle2
                className="h-5 w-5 shrink-0"
                style={{ color: "#16a34a" }}
              />
            ) : (
              <Loader2
                className="h-5 w-5 shrink-0 animate-spin"
                style={{ color: "#7c3aed" }}
              />
            )}
            <span className="text-sm font-medium" style={{ color: "#4c1d95" }}>
              {extractionProgress}
            </span>
          </div>
        )}

        {extractionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-1">
              <div className="font-semibold">{extractionError.message}</div>
              {extractionError.details && (
                <div className="text-sm">{extractionError.details}</div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate({ to: "/home" as any })}
            disabled={isExtracting}
            style={{ borderColor: "#c4b5fd", color: "#7c3aed" }}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 font-semibold shadow-lg"
            onClick={handleExtract}
            disabled={!selectedFile || isExtracting}
            style={{
              background: selectedFile
                ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                : undefined,
              color: selectedFile ? "white" : undefined,
            }}
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <ScanText className="mr-2 h-4 w-4" />
                Extract Questions
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

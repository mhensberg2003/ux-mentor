"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";

interface AnalysisResult {
  uxInsights: string[];
  visualDesign: string[];
  bestPractices: string[];
  annotations?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
  }>;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const SUPPORTED_FORMATS = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const validateFile = (file: File): string | null => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return "Unsupported file format. Please use JPEG, PNG, GIF, or WebP.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 5MB limit.";
    }
    return null;
  };

  const createPreviewUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const preview = await createPreviewUrl(file);
      setSelectedFile(file);
      setPreviewUrl(preview);
    } catch {
      setError("Failed to preview image. Please try again.");
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setAnalysisResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearResults = () => {
    setAnalysisResults(null);
    setError(null);
  };

  const handleRerunAnalysis = async () => {
    if (!selectedFile) return;
    setAnalysisResults(null);
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append(
        "prompt",
        "Analyze this screenshot for UX/usability issues, visual design feedback, and general best practices."
      );

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result = await response.json();
      setAnalysisResults(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Analysis failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <main className="w-full max-w-4xl px-6 py-12 sm:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Screenshot Analysis Tool
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            Upload a screenshot for AI-powered UX/UI analysis
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {!selectedFile ? (
            <div>
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Drag and drop your screenshot here
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      or click to browse files
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                    aria-label="Upload screenshot"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Choose File
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium">Supported formats:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>JPEG, PNG, GIF, WebP</li>
                  <li>Maximum file size: 5MB</li>
                  <li>One file at a time</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Selected File
                </h3>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                >
                  Remove
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {previewUrl && (
                    <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Screenshot preview"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      File Name
                    </p>
                    <p className="text-gray-900 dark:text-white break-all">
                      {selectedFile.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      File Size
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      File Type
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {selectedFile.type}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    "Analyze Screenshot"
                  )}
                </button>
                {analysisResults && !isSubmitting && (
                  <button
                    onClick={handleRerunAnalysis}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Rerun Analysis
                  </button>
                )}
              </div>

              {analysisResults && !isSubmitting && (
                <div className="space-y-6 mt-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Analysis Results
                    </h2>
                    <button
                      onClick={handleClearResults}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                        <span>🎯</span> UX Insights
                      </h3>
                      {analysisResults.uxInsights &&
                      analysisResults.uxInsights.length > 0 ? (
                        <ol className="space-y-3">
                          {analysisResults.uxInsights.map((insight, index) => (
                            <li
                              key={index}
                              className="text-sm text-blue-800 dark:text-blue-200 flex gap-3"
                            >
                              <span className="font-semibold flex-shrink-0">
                                {index + 1}.
                              </span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm text-blue-600 dark:text-blue-300 italic">
                          No UX insights available for this design.
                        </p>
                      )}
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                        <span>🎨</span> Visual Design
                      </h3>
                      {analysisResults.visualDesign &&
                      analysisResults.visualDesign.length > 0 ? (
                        <ol className="space-y-3">
                          {analysisResults.visualDesign.map(
                            (insight, index) => (
                              <li
                                key={index}
                                className="text-sm text-purple-800 dark:text-purple-200 flex gap-3"
                              >
                                <span className="font-semibold flex-shrink-0">
                                  {index + 1}.
                                </span>
                                <span>{insight}</span>
                              </li>
                            )
                          )}
                        </ol>
                      ) : (
                        <p className="text-sm text-purple-600 dark:text-purple-300 italic">
                          No visual design feedback available.
                        </p>
                      )}
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
                        <span>✅</span> Best Practices
                      </h3>
                      {analysisResults.bestPractices &&
                      analysisResults.bestPractices.length > 0 ? (
                        <ol className="space-y-3">
                          {analysisResults.bestPractices.map(
                            (insight, index) => (
                              <li
                                key={index}
                                className="text-sm text-green-800 dark:text-green-200 flex gap-3"
                              >
                                <span className="font-semibold flex-shrink-0">
                                  {index + 1}.
                                </span>
                                <span>{insight}</span>
                              </li>
                            )
                          )}
                        </ol>
                      ) : (
                        <p className="text-sm text-green-600 dark:text-green-300 italic">
                          No best practices feedback available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>No login required • No history saved • Powered by OpenRouter AI</p>
        </div>
      </main>
    </div>
  );
}

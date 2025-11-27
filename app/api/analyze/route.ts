import { NextRequest, NextResponse } from "next/server";

// Define the response structure
interface AnalysisResponse {
  uxInsights: string[];
  visualDesign: string[];
  bestPractices: string[];
  annotations?: Annotation[];
}

interface Annotation {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

// OpenRouter API configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-2-70b-chat";

// Supported file formats (matching client-side validation)
const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File): string | null {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return "Unsupported file format. Please use JPEG, PNG, GIF, or WebP.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File size exceeds 5MB limit.";
  }
  return null;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 data without the data:image/type;base64, prefix
      const base64Data = result.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function parseOpenRouterResponse(text: string): AnalysisResponse {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(text);
    return {
      uxInsights: parsed.uxInsights || [],
      visualDesign: parsed.visualDesign || [],
      bestPractices: parsed.bestPractices || [],
      annotations: parsed.annotations || [],
    };
  } catch {
    // If JSON parsing fails, try to extract structured data from text
    const lines = text.split("\n").filter((line) => line.trim());
    const response: AnalysisResponse = {
      uxInsights: [],
      visualDesign: [],
      bestPractices: [],
      annotations: [],
    };

    let currentSection: keyof AnalysisResponse = "uxInsights";

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes("ux") || lowerLine.includes("usability")) {
        currentSection = "uxInsights";
      } else if (lowerLine.includes("visual") || lowerLine.includes("design")) {
        currentSection = "visualDesign";
      } else if (lowerLine.includes("best") || lowerLine.includes("practice")) {
        currentSection = "bestPractices";
      } else if (
        line.trim().startsWith("-") ||
        line.trim().startsWith("•") ||
        /^\d+\./.test(line.trim())
      ) {
        const cleanLine = line.replace(/^[-•\d.]\s*/, "").trim();
        if (cleanLine && Array.isArray(response[currentSection])) {
          response[currentSection].push(cleanLine);
        }
      }
    }

    // If no structured content found, put everything in uxInsights
    if (
      response.uxInsights.length === 0 &&
      response.visualDesign.length === 0 &&
      response.bestPractices.length === 0
    ) {
      response.uxInsights = [text];
    }

    return response;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check API key
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OpenRouter API key not configured");
      return NextResponse.json(
        { error: "Server configuration error: API key not set" },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const prompt =
      (formData.get("prompt") as string) ||
      "Analyze this screenshot for UX/usability issues, visual design feedback, and general best practices.";

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Convert file to base64
    const base64Image = await fileToBase64(file);

    // Get model from environment or use default
    const model = process.env.NEXT_PUBLIC_OPENROUTER_MODEL || DEFAULT_MODEL;

    // Prepare OpenRouter request
    const openRouterPayload = {
      model,
      messages: [
        {
          role: "system",
          content: `You are a UX/UI design expert. Analyze the provided screenshot and provide structured feedback in JSON format with the following structure:
{
  "uxInsights": ["UX/usability observation 1", "UX/usability observation 2"],
  "visualDesign": ["Visual design observation 1", "Visual design observation 2"], 
  "bestPractices": ["Best practice observation 1", "Best practice observation 2"],
  "annotations": [{"x": 100, "y": 200, "width": 50, "height": 30, "text": "Specific annotation"}]
}

Focus on actionable insights for improving the design. If you can't provide exact coordinates for annotations, omit the annotations field. Always respond with valid JSON.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    };

    // Call OpenRouter API
    const openRouterResponse = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://screenshot-analyzer.vercel.app",
        "X-Title": "Screenshot Analyzer",
      },
      body: JSON.stringify(openRouterPayload),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error("OpenRouter API error:", errorText);
      return NextResponse.json(
        { error: "Failed to analyze image. Please try again later." },
        { status: 502 }
      );
    }

    const openRouterData = await openRouterResponse.json();

    // Extract the response content
    const content = openRouterData.choices?.[0]?.message?.content;
    if (!content) {
      console.error("Invalid OpenRouter response structure:", openRouterData);
      return NextResponse.json(
        { error: "Invalid response from AI service" },
        { status: 502 }
      );
    }

    // Parse and structure the response
    const analysisResult = parseOpenRouterResponse(content);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: "Internal server error during analysis" },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to analyze images." },
    { status: 405 }
  );
}

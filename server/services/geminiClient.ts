import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

/**
 * Singleton Gemini AI client.
 * Avoids re-instantiating GoogleGenerativeAI and getGenerativeModel on every request.
 * Provides a centralized place for model configuration, retries, and error handling.
 */

let _genAI: GoogleGenerativeAI | null = null;
let _model: GenerativeModel | null = null;

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY || null;
}

/**
 * Returns the singleton GenerativeModel instance.
 * Returns null if GEMINI_API_KEY is not configured.
 */
export function getGeminiModel(): GenerativeModel | null {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(apiKey);
  }

  if (!_model) {
    _model = _genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  return _model;
}

/**
 * Returns true if running in development mode (safe to return mock data).
 */
export function isDev(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Cleans Gemini response text by stripping markdown code fences.
 * Then parses the result as JSON.
 */
export function parseGeminiJSON<T = any>(responseText: string): T {
  const cleaned = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  return JSON.parse(cleaned);
}

/**
 * Calls the Gemini model with retry logic (exponential backoff).
 * Returns the raw response text.
 * Throws on failure after all retries are exhausted.
 */
export async function callGemini(
  prompt: string | any[],
  maxRetries: number = 2
): Promise<string> {
  const model = getGeminiModel();
  if (!model) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      lastError = error;

      // Only retry on rate-limit (429) or server errors (5xx)
      const status = error?.status || error?.httpStatusCode;
      const isRetryable = status === 429 || (status >= 500 && status < 600);

      if (!isRetryable || attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s...
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`Gemini API retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Gemini API call failed');
}

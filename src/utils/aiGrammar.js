// src/utils/aiGrammar.js
// Robust AI grammar correction helper using Google Generative AI SDK
// Uses free-tier compatible model: gemini-2.5-flash

import { GoogleGenerativeAI } from "@google/generative-ai"

// ============================================================================
// API Key - read from environment (Vite .env: VITE_GEMINI_API_KEY)
// ============================================================================
const API_KEY = (
  (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_GEMINI_API_KEY) ||
  ''
)

const KEY_SOURCE = API_KEY ? 'ENV' : 'none'

// DEBUG: Check API key on module load
console.log('[aiGrammar] Module loaded. API key check:', {
  hasKey: !!API_KEY,
  keyLength: API_KEY ? API_KEY.length : 0,
  keyPrefix: API_KEY ? API_KEY.substring(0, 10) + '...' : 'none',
  source: KEY_SOURCE
})

/**
 * Use an LLM to correct grammar and return a structured result:
 * { correctedText: string, explanation: string, hasChanges: boolean }
 *
 * @param {string} text
 * @returns {Promise<{correctedText:string, explanation:string, hasChanges:boolean}>}
 */
export async function getAiGrammarCorrection(text) {
  console.log('[aiGrammar] getAiGrammarCorrection called with text:', text)

  // Defensive: require non-empty text
  if (!text || !String(text).trim()) {
    console.warn('[aiGrammar] Empty text provided')
    return { correctedText: "", explanation: "No text provided.", hasChanges: false }
  }

  // If API key missing, skip network call and return fallback
  if (!API_KEY || API_KEY.trim() === '') {
    console.error('[aiGrammar] ⚠️ No API key configured!')
    console.error('[aiGrammar] Check your .env file for VITE_GEMINI_API_KEY')
    return {
      correctedText: text,
      explanation: "⚠️ AI Grammar Assist is disabled. Please add VITE_GEMINI_API_KEY to your .env file.",
      hasChanges: false
    }
  }

  console.log('[aiGrammar] API key found, initializing client...')

  // Initialize client inside function so file-level import doesn't throw if SDK not available at build time
  let genAI
  try {
    genAI = new GoogleGenerativeAI(API_KEY)
    console.log('[aiGrammar] GoogleGenerativeAI client initialized successfully')
  } catch (err) {
    console.error('[aiGrammar] Failed to initialize GoogleGenerativeAI client:', err)
    return {
      correctedText: text,
      explanation: "Failed to initialize AI client. See console for details.",
      hasChanges: false
    }
  }

  // Build the prompt
  const prompt = `You are an expert grammar assistant. Your task is to correct the grammar, spelling, and style of the input text.

  OUTPUT FORMAT INSTRUCTIONS:
  1. "correctedText": Provide ONLY the corrected version string.
  2. "explanation": Provide the explanation in this EXACT format:
     
     * *"<Corrected Sentence>"* ✅
     
     A few notes:
     * "<Original Fragment>" → *"<Corrected Fragment>"* (<Short Reason>)
     * "<Original Fragment>" → *"<Corrected Fragment>"* (<Short Reason>)
     
     (If there are multiple sentences, list them all. If there are no errors, just say "The text is already correct! ✅")

  IMPORTANT RULES:
  - Do NOT ask questions like "Do you want me to?".
  - Do NOT include conversational filler like "Almost, but...".
  - Keep the explanation broad and educational.
  - Return STRICTLY JSON.

  Return the response STRICTLY as a JSON object with these two fields:
  {
    "correctedText": "<corrected text>",
    "explanation": "<formatted explanation>"
  }
  
  DO NOT include any extra text outside the JSON object.

  Original Text: ${JSON.stringify(text)}`

  console.log('[aiGrammar] Prompt prepared, calling API...')

  try {
    // Use gemini-2.5-flash (free tier compatible model)
    // Alternative free tier models: gemini-2.5-flash-lite, gemini-2.5-pro
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Free tier compatible
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            correctedText: { type: "string" },
            explanation: { type: "string" }
          },
          required: ["correctedText", "explanation"]
        },
        temperature: 0.7,
        topP: 0.8,
      }
    })

    console.log('[aiGrammar] Model configured, generating content...')

    // Generate content
    const result = await model.generateContent(prompt)
    console.log('[aiGrammar] API response received:', result)

    const response = await result.response
    console.log('[aiGrammar] Response object:', response)

    // Get the text from response
    const responseText = response.text()
    console.log('[aiGrammar] Response text:', responseText)

    if (!responseText) {
      console.error('[aiGrammar] Empty response text received')
      throw new Error('Empty response from AI.')
    }

    // Try to parse JSON
    let parsed = null
    try {
      parsed = JSON.parse(responseText)
      console.log('[aiGrammar] JSON parsed successfully:', parsed)
    } catch (e) {
      console.error('[aiGrammar] JSON parsing error:', e)
      console.error('[aiGrammar] Raw response text:', responseText)
      // If parsing fails, try to extract JSON from the response
      const match = responseText.match(/{[\s\S]*}/)
      if (match) {
        try {
          parsed = JSON.parse(match[0])
          console.log('[aiGrammar] Extracted JSON from response:', parsed)
        } catch (innerErr) {
          console.error('[aiGrammar] JSON extraction failed:', innerErr)
          parsed = null
        }
      }
    }

    // If parsing succeeded and has expected fields, return them
    if (parsed && typeof parsed === 'object' && parsed.correctedText && parsed.explanation) {
      const hasChanges = parsed.correctedText.trim() !== text.trim()
      console.log('[aiGrammar] Success!', {
        hasChanges,
        original: text,
        corrected: parsed.correctedText
      })
      return {
        correctedText: parsed.correctedText,
        explanation: parsed.explanation,
        hasChanges
      }
    }

    // If we couldn't extract structured JSON, return fallback but include rawText for debugging
    console.warn('[aiGrammar] Could not parse AI JSON. Raw response:', responseText)
    return {
      correctedText: text,
      explanation: `AI returned an unexpected format. Raw AI output: ${responseText.substring(0, 200)}...`,
      hasChanges: false
    }
  } catch (err) {
    console.error('[aiGrammar] Error during AI call:', err)
    console.error('[aiGrammar] Error details:', {
      message: err?.message,
      name: err?.name,
      stack: err?.stack
    })

    // Check for specific error types
    if (err?.message?.includes('API_KEY')) {
      return {
        correctedText: text,
        explanation: `⚠️ Invalid API key. Please check your VITE_GEMINI_API_KEY in .env file.`,
        hasChanges: false
      }
    }

    if (err?.message?.includes('quota') || err?.message?.includes('429')) {
      return {
        correctedText: text,
        explanation: `⚠️ API quota exceeded. Please try again later.`,
        hasChanges: false
      }
    }

    return {
      correctedText: text,
      explanation: `AI call failed: ${err?.message || String(err)}. Check console for details.`,
      hasChanges: false
    }
  }
}

export default getAiGrammarCorrection
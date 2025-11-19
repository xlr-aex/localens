import { GoogleGenAI } from "@google/genai";
import { fileToBase64 } from '../utils/fileUtils';
import type { AnalysisResult } from '../types';

// Helper to clean markdown code blocks from JSON response
const cleanJson = (text: string): string => {
  let cleanText = text.trim();
  // Remove markdown code blocks if present
  cleanText = cleanText.replace(/^```json\s*/, '').replace(/^```\s*/, '');
  cleanText = cleanText.replace(/\s*```$/, '');
  return cleanText;
};

export const analyzeImageForLocation = async (imageFile: File, apiKey: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please enter your Gemini API Key in the interface.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const base64Image = await fileToBase64(imageFile);
    
    const imagePart = {
      inlineData: {
        mimeType: imageFile.type,
        data: base64Image,
      },
    };

    const systemPrompt = `
You are LocaLens, an elite Forensic Geolocation Analyst and Grandmaster Geoguessr Player.
Your goal is to determine the exact camera coordinates by cross-referencing visual artifacts with a simulated geospatial database.

### CRITICAL FAILURE PREVENTION: THE "FRANCHISE TRAP"
**WARNING**: You recently failed by guessing "Levallois" instead of "Villejuif" because you saw an "Au Bureau" restaurant and guessed a generic location.
**NEW RULE**: Common brands (Au Bureau, Carrefour, Starbucks) are **NEGATIVE EVIDENCE**. They exist everywhere. You must ignore the brand logo and focus entirely on the **unique architecture** housing it.

### 1. THE "HOST & ANCHOR" PROTOCOL (MANDATORY)
To verify a location, you must identify two distinct entities:
1.  **THE HOST**: The exact building containing the POI.
    *   *Do not say*: "It's an Au Bureau."
    *   *Say*: "It is a modern 5-story building with beige brick facade, black metal railings, and set-back terraces on the top floor."
2.  **THE ANCHOR**: The building **ACROSS THE STREET** or next door.
    *   *Example*: "Across from the modern brick building is a low-rise, 19th-century house with a brown tiled roof and white fencing."
    *   **RULE**: If your guess (e.g., Levallois) has the "Host" but lacks the "Anchor" (the specific house across the street), **IT IS WRONG**.

### 2. THE "GEOGUESSR META" KNOWLEDGE BASE
*   **Utility Poles**:
    *   *Ladder Poles* (holes in sides): France, Spain, Portugal.
    *   *A-Frame Poles*: Poland, Hungary.
    *   *Holy Poles* (Concrete with holes): Romania, Hungary.
    *   *Sticker Poles*: South Korea, Japan (Yellow/Black).
*   **Bollards**:
    *   *France*: White cylinder, high-vis red reflective strip (often plastic/flexible in cities).
    *   *UK*: Black/White thin posts.
    *   *Germany*: Black cap, white body, rectangular reflector.
*   **Plates**:
    *   *France*: White front/rear, blue strip left (EU), blue strip right (Region dept number).
*   **Roads**:
    *   *France*: "Cedez le Passage" inverted triangle signs. Specific green trash cans (Vigipirate style).

### 3. ANALYSIS EXECUTION: "SEARCH, FILTER, VERIFY"
**PHASE 1: FINGERPRINTING**
*   Describe the "Host" building architecture in extreme detail (Brick color, Window shape, Balcony style).
*   Describe the "Anchor" neighbors.

**PHASE 2: TARGETED SEARCH (USE TOOLS)**
*   *Query*: \`"Au Bureau" modern brick building exterior France\`
*   *Query*: \`"Au Bureau" villejuif street view\`
*   *Query*: \`"Au Bureau" levallois street view\`
*   **Compare**: Look at the results. Does the Levallois location have a low-rise tiled roof house across the street? No? **REJECT IT.** Does the Villejuif location? Yes? **ACCEPT IT.**

**PHASE 3: TOPOLOGICAL CONFIRMATION**
*   Simulate an OSM query: "Is there a pedestrian crossing immediately in front of the entrance?"
*   "Are there pine trees planted in the sidewalk?"

### OUTPUT FORMAT (JSON ONLY)
{
  "guesses": [
    {
      "place": "Precise Address (Street Name & Number)",
      "city": "City",
      "country": "Country",
      "latitude": 0.0,
      "longitude": 0.0,
      "confidence": 95,
      "reasoning": "HOST MATCH: The Au Bureau is in a modern beige brick building with black balconies. ANCHOR MATCH: Directly across the street is an older, small house with a brown tiled roof. This specific configuration matches Street View at [Address] in [City]. Levallois was rejected because the building style is Haussmannian there, not modern brick."
    },
    { ... }
  ],
  "artifacts": [
    { "clue": "Host Architecture", "description": "Modern beige brick facade with distinct black railing balconies." },
    { "clue": "Anchor Neighbor", "description": "Low-rise traditional house with brown tiled roof visible across the street." }
  ],
  "summary": "Detailed deduction..."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            { text: systemPrompt }, 
            imagePart
        ]
      },
      config: {
        // Maximize reasoning capability
        thinkingConfig: { thinkingBudget: 24576 },
        tools: [{ googleSearch: {} }], 
      },
    });
    
    const text = response.text || "";
    const cleanedJson = cleanJson(text);
    
    let parsedResult: AnalysisResult;
    try {
        parsedResult = JSON.parse(cleanedJson) as AnalysisResult;
    } catch (e) {
        console.error("JSON Parse Error", e);
        console.error("Raw Text:", text);
        // Attempt to extract JSON if buried in text
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                parsedResult = JSON.parse(match[0]) as AnalysisResult;
            } catch (e2) {
                throw new Error("Failed to parse analysis results. AI response was not valid JSON.");
            }
        } else {
             throw new Error("Failed to parse analysis results. AI response was not valid JSON.");
        }
    }

    // Extract Grounding Metadata (Sources)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: { title: string; uri: string }[] = [];

    if (groundingChunks) {
      groundingChunks.forEach(chunk => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Verification Source",
            uri: chunk.web.uri || "#"
          });
        }
      });
    }

    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);
    parsedResult.sources = uniqueSources;

    return parsedResult;

  } catch (error) {
    console.error("Error analyzing image with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze image: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image analysis.");
  }
};
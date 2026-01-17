import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, Supplier, GroundingSource, SourcingParams, ReliabilityReport } from "../types";

/**
 * Utility to extract and repair JSON from a potentially messy text response.
 */
const extractJson = (text: string): any => {
  try {
    // Try simple parse first
    return JSON.parse(text);
  } catch (e) {
    // Find the first { or [ and the last } or ]
    const startBrace = text.indexOf('{');
    const startBracket = text.indexOf('[');
    const start = (startBrace !== -1 && (startBracket === -1 || startBrace < startBracket)) ? startBrace : startBracket;
    
    if (start === -1) throw new Error("No JSON structure found in response");
    
    const endBrace = text.lastIndexOf('}');
    const endBracket = text.lastIndexOf(']');
    const end = Math.max(endBrace, endBracket);
    
    if (end === -1 || end < start) throw new Error("No closing JSON structure found in response");
    
    const jsonStr = text.substring(start, end + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (e2) {
      console.error("Failed to parse extracted JSON:", jsonStr);
      throw new Error("The model output contained invalid JSON. Please try your search again.");
    }
  }
};

export const findSuppliers = async (params: SourcingParams): Promise<SearchResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { material, keywords, countryFilter, additionalRequirements, imageData, imageMimeType } = params;

  const prompt = `Act as an expert global procurement officer. Find the most reliable suppliers and traders for the following request:
  - Product/Material: ${material}
  - Keywords: ${keywords || 'N/A'}
  - Country Filter: ${countryFilter || 'Global'}
  - Additional Requirements: ${additionalRequirements || 'N/A'}
  ${imageData ? "- A reference image of the product is provided." : ""}

  Search for active companies with verified websites and certifications. Distinguish between manufacturers (Suppliers) and distributors (Traders).
  
  CRITICAL: You MUST return your answer as a JSON object with this exact structure:
  {
    "summary": "Market intelligence summary...",
    "suppliers": [
      {
        "name": "Full Company Name",
        "type": "Supplier" or "Trader",
        "address": "Company location",
        "country": "Country Name",
        "website": "Direct Website URL",
        "contact": "Contact info if available",
        "materialMatch": "Specific product match details",
        "certifications": ["ISO", "CE", etc],
        "reliabilityScore": 0-100,
        "whyScore": "Brief reasoning for the score"
      }
    ]
  }`;

  const parts: any[] = [{ text: prompt }];
  if (imageData && imageMimeType) {
    parts.push({
      inlineData: {
        data: imageData.split(',')[1],
        mimeType: imageMimeType,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType is omitted to avoid conflicts with search grounding metadata
      },
    });

    const text = response.text || "{}";
    const data = extractJson(text);
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri,
      }));

    return {
      suppliers: (data.suppliers || []).map((s: any, i: number) => ({ 
        ...s, 
        id: s.id || `s-${i}-${Date.now()}` 
      })),
      sources,
      summary: data.summary || "",
    };
  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    if (error.message?.includes('fetch')) {
      throw new Error("Network error: Could not reach Gemini API. Ensure your API Key is valid.");
    }
    throw error;
  }
};

export const analyzeCompanyReliability = async (supplier: Supplier): Promise<ReliabilityReport> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as a professional Credit Score Inspector and Company Reliability Analyst. 
  Perform a deep-dive analysis on:
  Name: ${supplier.name}
  Website: ${supplier.website}
  Country: ${supplier.country}

  Analyze: Snapshots, Score (0-100), Financials, Trade History, Compliance, Reputation, Risk Flags, Verdict, and Mitigation Strategy.
  
  RETURN JSON ONLY:
  {
    "snapshot": { "legalName": "", "location": "", "incorporationYear": "", "ownership": "", "coreActivities": "" },
    "score": { "value": 0-100, "category": "" },
    "financials": { "creditworthiness": "", "paymentBehavior": "", "redFlags": [] },
    "tradeHistory": { "experienceYears": "", "markets": "", "consistency": "", "inspections": "" },
    "compliance": { "registrationStatus": "", "certifications": [], "legalIssues": "" },
    "reputation": { "summary": "", "feedback": "", "onlinePresence": "" },
    "riskFlags": [],
    "verdict": { "status": "Safe" | "Caution" | "Not Recommended", "conditions": "" },
    "mitigation": { "paymentTerms": "", "verificationActions": "", "safeguards": "" },
    "executiveSummary": ""
  }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 4000 },
        temperature: 0.1,
      }
    });

    const text = response.text || "";
    return extractJson(text);
  } catch (error) {
    console.error("Reliability Analysis Error:", error);
    throw error;
  }
};
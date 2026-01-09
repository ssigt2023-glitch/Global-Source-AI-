
import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, Supplier, GroundingSource, SourcingParams, ReliabilityReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findSuppliers = async (params: SourcingParams): Promise<SearchResult> => {
  const { material, keywords, countryFilter, additionalRequirements, imageData, imageMimeType } = params;

  const prompt = `Act as an expert global procurement officer. Find the most reliable suppliers and traders for the following request:
  - Product/Material: ${material}
  - Keywords: ${keywords || 'N/A'}
  - Country Filter: ${countryFilter || 'Global'}
  - Additional Requirements: ${additionalRequirements || 'N/A'}
  ${imageData ? "- A reference image of the product is provided." : ""}

  Search for active companies with verified websites and certifications. Distinguish between manufacturers (Suppliers) and distributors (Traders).
  
  You MUST return the results in JSON format matching the schema provided.`;

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
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suppliers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["Supplier", "Trader"] },
                  address: { type: Type.STRING },
                  country: { type: Type.STRING },
                  website: { type: Type.STRING },
                  contact: { type: Type.STRING },
                  materialMatch: { type: Type.STRING },
                  certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  reliabilityScore: { type: Type.NUMBER },
                  whyScore: { type: Type.STRING },
                },
                required: ["name", "type", "country", "website", "reliabilityScore"],
              },
            },
          },
          required: ["summary", "suppliers"],
        },
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    const data = JSON.parse(jsonStr);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri,
      }));

    return {
      suppliers: (data.suppliers || []).map((s: any, i: number) => ({ ...s, id: `s-${i}-${Date.now()}` })),
      sources,
      summary: data.summary || "",
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};

export const analyzeCompanyReliability = async (supplier: Supplier): Promise<ReliabilityReport> => {
  const prompt = `Act as a professional Credit Score Inspector and Company Reliability Analyst. 
  Perform a deep-dive analysis on the following company:
  Name: ${supplier.name}
  Website: ${supplier.website}
  Country: ${supplier.country}
  Address: ${supplier.address}

  Search for business registration validity, shipment history, credit signals, and market reputation. 
  You MUST return the results strictly in JSON format matching the schema provided.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            snapshot: {
              type: Type.OBJECT,
              properties: {
                legalName: { type: Type.STRING },
                location: { type: Type.STRING },
                incorporationYear: { type: Type.STRING },
                ownership: { type: Type.STRING },
                coreActivities: { type: Type.STRING }
              }
            },
            score: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.NUMBER },
                category: { type: Type.STRING }
              }
            },
            financials: {
              type: Type.OBJECT,
              properties: {
                creditworthiness: { type: Type.STRING },
                paymentBehavior: { type: Type.STRING },
                redFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            tradeHistory: {
              type: Type.OBJECT,
              properties: {
                experienceYears: { type: Type.STRING },
                markets: { type: Type.STRING },
                consistency: { type: Type.STRING },
                inspections: { type: Type.STRING }
              }
            },
            compliance: {
              type: Type.OBJECT,
              properties: {
                registrationStatus: { type: Type.STRING },
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                legalIssues: { type: Type.STRING }
              }
            },
            reputation: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                feedback: { type: Type.STRING },
                onlinePresence: { type: Type.STRING }
              }
            },
            riskFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            verdict: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING, enum: ["Safe", "Caution", "Not Recommended"] },
                conditions: { type: Type.STRING }
              }
            },
            mitigation: {
              type: Type.OBJECT,
              properties: {
                paymentTerms: { type: Type.STRING },
                verificationActions: { type: Type.STRING },
                safeguards: { type: Type.STRING }
              }
            },
            executiveSummary: { type: Type.STRING }
          },
          required: ["snapshot", "score", "financials", "tradeHistory", "compliance", "reputation", "verdict", "mitigation", "executiveSummary"]
        }
      }
    });

    return JSON.parse(response.text?.trim() || "{}");
  } catch (error) {
    console.error("Reliability Analysis Error:", error);
    throw error;
  }
};

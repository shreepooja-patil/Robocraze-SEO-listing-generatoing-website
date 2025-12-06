import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProductListing, CompetitorAnalysis, CategoryMapping } from "../types";

// Support both local development (process.env) and Vite production build (import.meta.env)
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // @ts-ignore - Vite specific env handling
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  return '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const categorySchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING },
      assignedCategory: { type: Type.STRING },
      reasoning: { type: Type.STRING }
    },
    required: ["productName", "assignedCategory"]
  }
};

// Helper to safely parse JSON from model output that might contain markdown
const parseJSON = <T>(text: string | undefined, fallback: T): T => {
  if (!text) return fallback;
  
  // Remove markdown code blocks if present (```json ... ```)
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    // Attempt parsing
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.warn("Direct JSON parse failed, attempting extraction", e);
    // Fallback: try to find the first { or [ and the last } or ]
    try {
      const open = text.indexOf('{') > -1 && text.indexOf('{') < (text.indexOf('[') > -1 ? text.indexOf('[') : Infinity) ? '{' : '[';
      const close = open === '{' ? '}' : ']';
      
      const start = text.indexOf(open);
      const end = text.lastIndexOf(close);
      
      if (start > -1 && end > -1) {
        const jsonStr = text.substring(start, end + 1);
        return JSON.parse(jsonStr) as T;
      }
    } catch (e2) {
      console.error("Failed to extract JSON", e2);
    }
  }
  return fallback;
};

export const generateProductListing = async (productName: string, contextUrl: string): Promise<ProductListing> => {
  const prompt = `
    You are a Senior SEO Content Writer for Robocraze (a robotics and electronics store in India).
    Create a comprehensive product listing for: "${productName}".
    ${contextUrl ? `Context/Reference URL: ${contextUrl}` : ''}
    
    Use Google Search to verify technical details, features, and specs if you don't have exact knowledge.
    
    Requirements:
    1. **Website Title**: Clear, descriptive, includes key specs.
    2. **Amazon Title**: Keyword stuffed but readable, includes Brand, Model, Key Features.
    3. **5 Bullet Points**: Highlight features, use cases, and benefits.
    4. **SEO Description**: 150-200 words, engaging, technically accurate.
    5. **Technical Specs**: Extract plausible specs. Return as a list of name/value pairs.
    6. **Keywords**: 10-15 high volume keywords for the Indian market.
    7. **Meta Tags**: Optimized for click-through rate.
    8. **Tags**: Relevant collections (e.g., Arduino, Sensors, Wireless).

    IMPORTANT: Output ONLY valid JSON. No markdown, no explanations.
    Structure:
    {
      "productTitleWebsite": "string",
      "productTitleAmazon": "string",
      "bulletPoints": ["string"],
      "seoDescription": "string",
      "technicalSpecifications": [{"name": "string", "value": "string"}],
      "searchKeywords": ["string"],
      "metaTitle": "string",
      "metaDescription": "string",
      "suggestedTags": ["string"]
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      // responseMimeType and responseSchema are NOT supported when using tools
    }
  });

  const fallback: ProductListing = {
    productTitleWebsite: productName,
    productTitleAmazon: productName,
    bulletPoints: ["Could not generate details."],
    seoDescription: "Error generating content. Please try again.",
    technicalSpecifications: [],
    searchKeywords: [],
    metaTitle: "",
    metaDescription: "",
    suggestedTags: []
  };

  return parseJSON<ProductListing>(response.text, fallback);
};

export const findCompetitors = async (productName: string): Promise<CompetitorAnalysis[]> => {
  const prompt = `
    Find competitors selling "${productName}" in India.
    Specifically look for "Robu.in", "ThinkRobotics", "ThingBits", "Robocraze" or similar Indian robotics stores.
    
    1. Find exact product matches.
    2. Extract the URL.
    3. Analyze their listing: What specific detail (images, description formatting, video, docs) makes it "eye-catching" or better than a standard listing?
    4. Provide the Price if visible.

    IMPORTANT: Output ONLY valid JSON Array. No markdown.
    Structure:
    [
      {
        "competitorName": "string",
        "productUrl": "string",
        "price": "string",
        "eyeCatchingDetails": "string"
      }
    ]
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      // responseMimeType and responseSchema are NOT supported when using tools
    }
  });

  return parseJSON<CompetitorAnalysis[]>(response.text, []);
};

export const assignCategories = async (products: string[]): Promise<CategoryMapping[]> => {
  const prompt = `
    Assign the correct website category for the following products on the Robocraze website structure.
    Products: ${JSON.stringify(products)}
    
    Choose from typical categories like: 
    - Batteries & Chargers / Li-Ion
    - Drone Parts / Transmitters & Receivers
    - DIY Kits / STEM Education
    - Tools & Measuring Instruments / Strippers & Cutters
    - Development Boards
    
    Provide the most accurate hierarchical path.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: categorySchema,
      // No tools needed here, so strict schema is fine
    }
  });

  return JSON.parse(response.text || "[]") as CategoryMapping[];
};
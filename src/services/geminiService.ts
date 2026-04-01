import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function getCategorization(description: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Categorize this expense description: "${description}". Choose from: Food, Rent, Travel, Shopping, Entertainment, Health, Education, Bills, Others. Return ONLY the category name.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini categorization error:", error);
    return "Others";
  }
}

export async function getSpendingInsights(transactions: any[], budgets: any[]): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these transactions and budgets for an expense tracker. Provide 3-4 concise, helpful financial insights or tips. 
      Transactions: ${JSON.stringify(transactions.slice(0, 20))}
      Budgets: ${JSON.stringify(budgets)}
      Format as markdown.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini insights error:", error);
    return "Could not generate insights at this time.";
  }
}

export async function processVoiceInput(transcript: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract transaction details from this voice transcript: "${transcript}". 
      Return a JSON object with: amount (number), type ("income" or "expense"), category (string), description (string).
      Categories: Food, Rent, Travel, Shopping, Entertainment, Health, Education, Bills, Salary, Freelance, Investment, Gift, Others.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ["income", "expense"] },
            category: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["amount", "type", "category"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini voice processing error:", error);
    return null;
  }
}


import { GoogleGenAI, Type } from "@google/genai";
import type { TechnicianStats } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateTechnicianData(): Promise<TechnicianStats | null> {
    if (!API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a realistic full name, a professional job title/position from the following list: 'Apprentice', 'Tier 1 Lead', 'Tier 2 Lead', 'Tier 3 Lead', 'Tier 4 Senior Lead', 'Tier 5 Veteran Lead', a unique technician number between 1 and 99, and performance statistics for a home appliance technician. The stats should be:
      - Average Performance Percentage: between 85 and 100
      - Job Ticket Value: between 250 and 800
      - Impact Points: between 50 and 200
      - 5-Star Reviews: between 10 and 50 for a quarter
      - Memberships Sold: between 5 and 25 for a quarter`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "Technician's full name"
            },
            position: {
                type: Type.STRING,
                description: "Technician's professional job title from the provided list"
            },
            technicianNumber: {
                type: Type.INTEGER,
                description: "A unique number assigned to the technician"
            },
            avgPerformance: {
              type: Type.INTEGER,
              description: "Average performance percentage"
            },
            ticketValue: {
              type: Type.INTEGER,
              description: "Average job ticket value in dollars"
            },
            impactPoints: {
              type: Type.INTEGER,
              description: "Internal performance score"
            },
            fiveStarReviews: {
              type: Type.INTEGER,
              description: "Number of 5-star reviews received"
            },
            membershipsSold: {
              type: Type.INTEGER,
              description: "Number of service memberships sold"
            },
          },
          required: ["name", "position", "technicianNumber", "avgPerformance", "ticketValue", "impactPoints", "fiveStarReviews", "membershipsSold"]
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    const data: TechnicianStats = {
        ...parsedData,
        badges: [],
    };
    return data;
  } catch (error) {
    console.error("Error generating technician data:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
}

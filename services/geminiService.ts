import { GoogleGenAI, Type } from '@google/genai';
import { DrawnCard, AlmanacInfo, Interpretation } from '../types';

// Custom Error for better UI feedback
class GeminiServiceError extends Error {
  public userFriendlyMessage: string;

  constructor(message: string, userFriendlyMessage: string) {
    super(message);
    this.name = 'GeminiServiceError';
    this.userFriendlyMessage = userFriendlyMessage;
  }
}

const handleApiError = (error: unknown, context: string): GeminiServiceError => {
  console.error(`Error in ${context}:`, error);

  let userFriendlyMessage = 'An unexpected error occurred while communicating with the AI service. Please try again later.';
  
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes('api key not valid') || errorMessage.includes('permission denied') || errorMessage.includes('api_key')) {
        userFriendlyMessage = 'The connection to the AI service failed due to an authentication error. Please ensure the API key is configured correctly.';
    } else if (errorMessage.includes('failed to fetch') || errorMessage.includes('network')) {
        userFriendlyMessage = 'A network error occurred. Please check your internet connection and try again.';
    } else if (errorMessage.includes('deadline exceeded') || errorMessage.includes('timeout')) {
        userFriendlyMessage = 'The request to the AI service timed out. Please try again.';
    } else if (errorMessage.includes('resource exhausted') || errorMessage.includes('429')) {
         userFriendlyMessage = 'The AI service is currently busy or rate limits have been exceeded. Please try again in a few moments.';
    } else if (errorMessage.includes('500') || errorMessage.includes('internal')) {
        userFriendlyMessage = 'The AI service encountered an internal error. Please try again later.'
    }
  }
  
  return new GeminiServiceError(error instanceof Error ? error.message : 'Unknown error', userFriendlyMessage);
};


const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This log helps developers, but the UI will handle the resulting errors gracefully for the user.
  console.error("CRITICAL: API_KEY environment variable not set. API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const checkApiKey = () => {
    if (!API_KEY) {
        throw new GeminiServiceError(
            "API_KEY environment variable is not set.",
            "The connection to the AI service is currently unavailable. Please try again later."
        );
    }
};

const interpretationSchema = {
  type: Type.OBJECT,
  properties: {
    outer: {
      type: Type.STRING,
      description: 'The "Outer" meaning: The traditional, external, or worldly interpretation of the spread. Synthesize the cards to describe events, actions, and the material situation.'
    },
    inner: {
      type: Type.STRING,
      description: 'The "Inner" meaning: The psychological, archetypal, or spiritual interpretation. Synthesize the cards to describe internal states, personal growth, and subconscious influences.'
    },
    whispers: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'Three "Whispers": Gentle, evocative questions or prompts for reflection that connect the spread\'s overall message to the user\'s personal life and the current almanac context.'
    }
  },
  required: ['outer', 'inner', 'whispers']
};

export const getSpreadInterpretation = async (
  drawnCards: DrawnCard[],
  almanac: AlmanacInfo,
  spreadName: string,
  question?: string,
): Promise<Interpretation> => {
  checkApiKey();
  
  const cardsDetails = drawnCards.map(dc => {
    const orientation = dc.reversed ? 'Reversed' : 'Upright';
    const keywords = (dc.reversed ? dc.card.reversedKeywords : dc.card.uprightKeywords) || [];
    let cardLine = `- ${dc.position}: ${dc.card.name} (${orientation})`;
    if (keywords.length > 0) {
      cardLine += ` | Keywords to consider: ${keywords.join(', ')}`;
    }
    return cardLine;
  }).join('\n');

  const contextInstruction = `Integrate the following spiritual and natural context as a thematic lens for the reading. For instance, a "New Moon" might suggest new beginnings, while "Autumn" could imply harvest or letting go.
- Lunar Phase: ${almanac.lunarPhase}
- Season: ${almanac.season}
${almanac.holiday ? `- Special Day: ${almanac.holiday}` : ''}`;

  const prompt = `
    As a wise, empathetic Tarot reader, provide a deep, layered, and synthesized interpretation for the following spread. Your tone must be calm, sacred, and encouraging, like a personal journal companion, avoiding clichés. Weave the meanings of all cards into a single, coherent narrative that directly addresses the user's focus. Use the provided keywords as inspiration for your interpretation.

    **User's Focus:** ${question ? `"${question}"` : 'A general reading.'}
    
    **Spread:** ${spreadName}
    
    **Cards Drawn:**
    ${cardsDetails}
    
    **Thematic Context:**
    ${contextInstruction}

    Provide your interpretation in the required JSON format. The layers should be distinct:
    - **Outer:** Focus on the tangible, worldly events and actions.
    - **Inner:** Explore the psychological, emotional, and spiritual landscape.
    - **Whispers:** Craft three gentle, reflective questions that connect the reading to the user's life and the thematic context.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: interpretationSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    let interpretation: Partial<Interpretation>;

    try {
      interpretation = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", jsonText);
      throw new GeminiServiceError(
        "Received a malformed interpretation from the AI.",
        "The AI returned a response in an unexpected format. This may be a temporary issue. Please try your reading again."
      );
    }

    if (typeof interpretation.outer === 'string' && typeof interpretation.inner === 'string' && Array.isArray(interpretation.whispers)) {
      return interpretation as Interpretation;
    } else {
      console.error("Invalid JSON structure received:", interpretation);
       throw new GeminiServiceError(
        "Received an incomplete interpretation from the AI.",
        "The AI returned an incomplete response. Please try your reading again."
      );
    }
    
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error;
    throw handleApiError(error, 'getSpreadInterpretation');
  }
};

export const identifyCardFromImage = async (base64Image: string): Promise<string | null> => {
    checkApiKey();
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = {
      text: "Identify the primary Tarot card in this image. Respond with only the card's name (e.g., 'The Fool', 'Ten of Wands'). If no card is clearly identifiable, respond with 'Unknown'.",
    };

    try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: { parts: [imagePart, textPart] },
        });

        const cardName = response.text.trim();
        if (cardName && cardName.toLowerCase() !== 'unknown') {
            return cardName;
        }
        return null;
    } catch (error) {
        throw handleApiError(error, 'identifyCardFromImage');
    }
};

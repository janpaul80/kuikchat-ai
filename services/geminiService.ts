


import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { Message } from '../types';

// Client-side initialization. In a real app, this key should be handled securely.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Creates a new chat session with the Gemini model.
 */
export const createBotChatSession = (): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
  });
  return chat;
};

/**
 * Sends a message to the Gemini API via the chat session.
 * @param chatSession The active chat session object from createBotChatSession.
 * @param message The user's message text.
 * @returns A promise that resolves to the bot's response message.
 */
export const sendMessageToBot = async (chatSession: Chat, message: string): Promise<Message> => {
  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    // FIX: response.text is a property, not a function.
    const botResponseText = response.text || "";

    return {
      id: self.crypto.randomUUID(),
      // FIX: Gemini API returns plain text, no need to encode/decode with btoa/atob for display. Store it directly.
      text: botResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderId: 'kuik-bot',
      isBot: true,
      sentAt: Date.now(),
      type: 'user',
    };
  } catch (error) {
    console.error("Error sending message to bot:", error);
    const errorMessageText = (error instanceof Error) ? error.message : "Sorry, I'm having trouble connecting right now. Please try again later.";
    return {
      id: self.crypto.randomUUID(),
      // FIX: Store error message directly without encoding.
      text: errorMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderId: 'kuik-bot',
      isBot: true,
      sentAt: Date.now(),
      type: 'user',
    };
  }
};

/**
 * Sends a prompt to generate an image using the Imagen API.
 * @param prompt The text prompt for image generation.
 * @returns A promise that resolves to a base64 encoded image string or null on failure.
 */
export const generateImageFromPrompt = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return base64ImageBytes;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

/**
 * Translates text using Gemini.
 * @param text The text to translate.
 * @param targetLanguage The target language code (e.g., 'es', 'fr').
 * @returns The translated text.
 */
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    try {
        const languageMap: Record<string, string> = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French'
        };
        const targetLangName = languageMap[targetLanguage] || targetLanguage;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text to ${targetLangName}. Only return the translated text, nothing else.\n\nText: "${text}"`,
        });
        
        // FIX: response.text is a property, not a function.
        return response.text?.trim() || "Translation failed.";
    } catch (error) {
        console.error("Error translating text:", error);
        return "Translation failed.";
    }
};

/**
 * Transcribes audio using Gemini.
 * @param audioBase64 The base64 encoded audio string.
 * @returns The transcription text.
 */
export const generateAudioTranscript = async (audioBase64: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'audio/mp3', // Assume mp3 or similar audio format for now, Gemini handles several
                            data: audioBase64
                        }
                    },
                    {
                        text: "Listen to this audio and provide a concise transcript or summary of the voice message."
                    }
                ]
            }
        });
        // FIX: response.text is a property, not a function.
        return response.text?.trim() || "Transcription failed.";
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return "Transcription failed.";
    }
}
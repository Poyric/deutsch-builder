import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generate a high-quality image for a vocabulary word using Nano Banana (Gemini 2.5 Flash Image)
 */
export const generateVocabImage = async (
  word: string, 
  aspectRatio: AspectRatio = AspectRatio.Square, 
  imageSize: ImageSize = ImageSize.OneK
): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A clear, educational illustration representing the German word "${word}". Minimalist vector art style.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          // imageSize is removed as it is not supported by gemini-2.5-flash-image
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};

/**
 * Edit an existing image using text prompts (Nano Banana - Gemini 2.5 Flash Image)
 */
export const editImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    // Strip prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png', 
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image editing failed:", error);
    return null;
  }
};

/**
 * Text-to-Speech generation
 */
export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    // Decoding needs to happen in the component context where AudioContext exists, 
    // but we can return the base64 string or decode it here if we pass context.
    // For simplicity, we'll return the raw base64 and let component handle decoding
    // or we can reuse a global context if acceptable. 
    
    return null; 
  } catch (e) {
    console.error(e);
    return null;
  }
};

// Helper to get raw base64 audio
export const getSpeechBase64 = async (text: string): Promise<string | null> => {
    try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

/**
 * Transcribe User Audio
 */
export const transcribeAudio = async (base64Audio: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: 'audio/wav', // Assuming WAV or PCM wrapped
                        data: base64Audio
                    }
                },
                {
                    text: "Please transcribe this German audio exactly."
                }
            ]
        }
    });
    return response.text || null;
  } catch (error) {
    console.error("Transcription failed", error);
    return null;
  }
}

export { ai };
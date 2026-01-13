
import { GoogleGenAI, Type, Modality, FunctionDeclaration } from "@google/genai";
import { AIModelMode, PandaPersona, APIConfig, AppSettings, Project } from "../types";
import { decode, decodeAudioData } from "./audio";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (
  prompt: string,
  mode: AIModelMode,
  history: { role: string; content: string }[] = [],
  project?: Project,
  persona?: PandaPersona,
  attachments?: { data: string; mimeType: string }[],
  grounding?: boolean,
  apiConfigs?: APIConfig[],
  appSettings?: AppSettings,
  onStream?: (chunk: string) => void,
  abortSignal?: AbortSignal
) => {
  const ai = getAI();
  const lang = appSettings?.language || 'he';
  
  // Simplified instruction for stability
  let systemInstruction = `You are PandaAi. Respond helpfully in ${lang === 'he' ? 'Hebrew' : 'English'}. Mode: ${mode}.`;

  // Default to the robust Flash model to prevent timeouts/errors
  let modelName = 'gemini-3-flash-preview';
  const config: any = { systemInstruction };

  // Only use Thinking config if specifically requested and supported
  if (mode === AIModelMode.THINKING || mode === AIModelMode.AGENTIC) {
    modelName = 'gemini-3-pro-preview'; // Pro needed for deep thinking
    config.thinkingConfig = { thinkingBudget: 16000 }; // Lower budget for speed/stability
    config.tools = [{ googleSearch: {} }];
  }

  // Maps grounding logic
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('map') || lowerPrompt.includes('location') || lowerPrompt.includes('איפה') || lowerPrompt.includes('מפה')) {
    modelName = 'gemini-2.5-flash-lite-latest';
    config.tools = config.tools ? [...config.tools, { googleMaps: {} }] : [{ googleMaps: {} }];
  }

  const parts: any[] = attachments?.map(a => ({
    inlineData: { data: a.data.split(',')[1], mimeType: a.mimeType }
  })) || [];
  parts.push({ text: prompt });

  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    { role: 'user', parts }
  ];

  try {
    const response = await ai.models.generateContent({ model: modelName, contents, config });

    // Extreme defensive coding for thought extraction
    let thoughtSteps: any[] = [];
    try {
      if (response.candidates?.[0]?.content?.parts) {
        const rawThoughts = response.candidates[0].content.parts.filter((p: any) => p.thought);
        if (rawThoughts && rawThoughts.length > 0) {
          thoughtSteps = rawThoughts.map((p: any, i: number) => ({
            id: `step-${Date.now()}-${i}`,
            label: `Reasoning Step ${i + 1}`,
            status: 'completed',
            description: p.text || "Processing logic..."
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to parse thoughts, ignoring:", err);
      thoughtSteps = [];
    }

    return {
      text: response.text || '',
      groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
        title: c.web?.title || c.maps?.title || 'Source',
        uri: c.web?.uri || c.maps?.uri || ''
      })).filter((c: any) => c.uri) || [],
      thoughtSteps: thoughtSteps
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "נתקלתי בשגיאה זמנית בתקשורת. אנא נסה שוב. (Error: API communication failed)",
      groundingSources: [],
      thoughtSteps: []
    };
  }
};

export const generateOrEditImage = async (
  prompt: string, 
  baseImage?: string, 
  mimeType?: string, 
  config?: { aspectRatio?: string; imageSize?: string }
): Promise<string> => {
    const ai = getAI();
    
    // REVERTED TO FREE MODEL: gemini-2.5-flash-image (Nano Banana)
    // This model does NOT require a paid key and is fast.
    const model = 'gemini-2.5-flash-image';
    
    const parts: any[] = [{ text: prompt }];
    
    if (baseImage) {
      parts.unshift({
        inlineData: {
          data: baseImage.split(',')[1],
          mimeType: mimeType || 'image/png'
        }
      });
    }

    // Note: aspect ratio is supported, but imageSize is NOT supported in Flash Image.
    // Removing incompatible configs to prevent errors.
    const imageConfig: any = {};
    if (config?.aspectRatio) imageConfig.aspectRatio = config.aspectRatio;

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: { imageConfig }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Render Failed");
};

export const generateVideo = async (
  prompt: string,
  setProgress: (msg: string) => void,
  baseImage?: string,
  mimeType?: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  setProgress('Initializing Neural Sequence...');

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'Cinematic sequence',
    image: baseImage ? {
      imageBytes: baseImage.split(',')[1],
      mimeType: mimeType || 'image/png',
    } : undefined,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio
    }
  });

  while (!operation.done) {
    setProgress('Computing Frames...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const extendVideo = async (previousVideoUri: string, prompt: string, setProgress: (msg: string) => void): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  setProgress('Extending Cinematic Timeline...');
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });

  while (!operation.done) {
    setProgress('Expanding Neural Memory...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const analyzeDocument = async (files: any[], action: string, params: any, chatHistory: any[], settings: any) => {
  const ai = getAI();
  const lang = settings?.language || 'he';
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', // Switched to Flash for speed/reliability on documents
    contents: {
      role: 'user',
      parts: [
        ...files.map(f => ({ inlineData: { data: f.data.split(',')[1], mimeType: f.type } })),
        { text: `Perform ${action} on these documents. Return structured analytical insights in ${lang}.` }
      ]
    }
  });
  return response.text || "";
};

export const generateTTS = async (text: string, voiceName: string = 'Zephyr') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start();
  return source;
};

export const transcribeAudio = async (base64Data: string, mimeType: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data.split(',')[1], mimeType } },
        { text: "Transcribe exactly." }
      ]
    }
  });
  return response.text || '';
};

export const generateCowboyPrompt = async (params: any) => {
  const ai = getAI();
  const resp = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create perfect system prompt for: ${JSON.stringify(params)}`
  });
  return resp.text || '';
};

export const generateMasterMessages = async (context: string, settings: any) => {
  const ai = getAI();
  const resp = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Strategic messaging context: ${context}. Settings: ${JSON.stringify(settings)}`,
    config: { 
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            successProbability: { type: Type.NUMBER },
            predictedSentiment: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(resp.text || '[]');
};

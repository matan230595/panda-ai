
import { GoogleGenAI, Type, Modality } from "@google/genai";
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
  
  // Strict Hebrew instruction
  let systemInstruction = `You are Panda, an elite AI assistant in the Panda AI Studio system.
  CRITICAL: You must respond ONLY in Hebrew (עברית).
  Your tone should be professional, sharp, and helpful.
  When writing code, always output it in markdown code blocks with the language specified (e.g., \`\`\`typescript).
  Never use English in your response unless specifically asked to translate or write code.`;

  let modelName = 'gemini-3-flash-preview';
  const config: any = { systemInstruction };

  if (mode === AIModelMode.THINKING || mode === AIModelMode.AGENTIC) {
    modelName = 'gemini-3-pro-preview';
    config.thinkingConfig = { thinkingBudget: 16000 };
    config.tools = [{ googleSearch: {} }];
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
    let thoughtSteps: any[] = [];
    // Parsing thought process if available in the model response
    if (response.candidates?.[0]?.content?.parts) {
      const rawThoughts = response.candidates[0].content.parts.filter((p: any) => p.thought);
      thoughtSteps = rawThoughts.map((p: any, i: number) => ({
        id: `step-${Date.now()}-${i}`,
        label: `תהליך חשיבה ${i + 1}`,
        status: 'completed',
        description: p.text || "מעבד נתונים..."
      }));
    }

    return {
      text: response.text || '',
      groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
        title: c.web?.title || c.maps?.title || 'מקור',
        uri: c.web?.uri || c.maps?.uri || ''
      })).filter((c: any) => c.uri) || [],
      thoughtSteps: thoughtSteps
    };
  } catch (error: any) {
    return { text: "שגיאה בתקשורת. אנא נסה שוב מאוחר יותר.", groundingSources: [], thoughtSteps: [] };
  }
};

export const generateOrEditImage = async (
  prompt: string, 
  baseImage?: string, 
  mimeType?: string, 
  config?: { aspectRatio?: string; imageSize?: string; referenceStrength?: number; mode?: string }
): Promise<string> => {
    const ai = getAI();
    const model = 'gemini-2.5-flash-image';
    const parts: any[] = [];
    
    // Prompt augmentation for reference control simulation
    let augmentedPrompt = prompt;
    if (baseImage) {
        const strength = config?.referenceStrength ? Math.round(config.referenceStrength * 100) : 70;
        const modeMap: any = {
            'style': 'Focus primarily on copying the ARTISTIC STYLE of the reference image.',
            'layout': 'Focus primarily on copying the COMPOSITION and LAYOUT of the reference image.',
            'colors': 'Focus primarily on copying the COLOR PALETTE of the reference image.',
            'content': 'Focus primarily on the OBJECTS and CONTENT of the reference image.',
            'balanced': 'Balance the style, composition, and content of the reference image.'
        };
        const instruction = modeMap[config?.mode || 'balanced'] || modeMap['balanced'];
        
        augmentedPrompt = `${prompt}\n\n[Reference Image Instructions]\nInfluence Level: ${strength}%\nInstruction: ${instruction}`;
        
        parts.push({
            inlineData: {
                data: baseImage.split(',')[1],
                mimeType: mimeType || 'image/png'
            }
        });
    }
    
    parts.push({ text: augmentedPrompt });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: { imageConfig: { aspectRatio: config?.aspectRatio as any } }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Render Failed");
};

export const generateCowboyPrompt = async (lazyPrompt: string) => {
  const ai = getAI();
  // Super-strict system instruction for PromptCowboy level
  const systemInstruction = `You are the world's greatest Prompt Engineer (Level: PromptCowboy).
  Your goal is to take a simple request and expand it into a massive, highly detailed, professional prompt (500-1500 words).
  
  CRITICAL RULES:
  1. Output Language: HEBREW ONLY (עברית בלבד).
  2. Structure: You MUST follow the JSON schema exactly.
  3. Detail Level: Extreme. Do not be concise. Be exhaustive.
  4. Tone: Professional, authoritative, and specific.
  
  SECTIONS TO GENERATE:
  - Expert Persona: Define a specific persona with years of experience.
  - Context & Situation: Business context, why this is needed.
  - Task: Detailed step-by-step instructions.
  - Objective: Clear success criteria.
  - Knowledge & Constraints: What to do, what NOT to do, style guidelines.
  - Examples: Provide 2-3 high-quality examples of desired output.
  - Output Format: Exact structure of the final result.
  - QA: How the AI should verify its own work.
  `;

  const resp = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Expand this request into a PromptCowboy master prompt: "${lazyPrompt}"`,
    config: { 
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          situation: { type: Type.STRING, description: "Detailed context and background (200+ words)" },
          task: { type: Type.STRING, description: "Step by step instructions" },
          objective: { type: Type.STRING, description: "Clear goals" },
          knowledge: { type: Type.STRING, description: "Constraints and guidelines" },
          examples: { type: Type.STRING, description: "Concrete examples" },
          format: { type: Type.STRING, description: "Output structure" },
          qa: { type: Type.STRING, description: "Quality assurance checklist" },
          questions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Refining questions" }
        },
        required: ['situation', 'task', 'objective', 'knowledge', 'examples', 'format', 'qa', 'questions']
      }
    }
  });
  return JSON.parse(resp.text || '{}');
};

export const generateMasterMessages = async (context: string, settings: any, appSettings?: AppSettings) => {
  const ai = getAI();
  const systemInstruction = `You are a World-Class Strategic Communication Expert. Craft messages in Hebrew based on psychological triggers.`;
  const resp = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Context: ${context}. Audience: ${settings.audience}.`,
    config: { 
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            successProbability: { type: Type.NUMBER },
            predictedSentiment: { type: Type.STRING },
            predictedResponse: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(resp.text || '[]');
};

export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-2.5-flash';
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'audio/wav', data: audioBase64 } },
        { text: "Transcribe this audio exactly in Hebrew." }
      ]
    }
  });
  return response.text || "";
};

export const generateVideo = async (
  prompt: string, 
  setProgressMsg: (msg: string) => void, 
  baseImage?: string, 
  mimeType?: string, 
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  const ai = getAI();
  setProgressMsg("מאתחל יצירת וידאו...");
  
  const config: any = {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
  };

  let operation;
  
  if (baseImage) {
      operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: prompt || 'Animate this image',
          image: {
              imageBytes: baseImage.split(',')[1],
              mimeType: mimeType || 'image/png',
          },
          config
      });
  } else {
      operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: prompt,
          config
      });
  }

  setProgressMsg("מעבד וידאו... (זה עשוי לקחת דקה)");

  while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
      setProgressMsg("עדיין מעבד... אנא המתן");
  }

  if (operation.error) {
      throw new Error(operation.error.message);
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const analyzeDocument = async (files: any[], mode: string, params: any, history: any[], appSettings: AppSettings) => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview'; 
  
  let systemInstruction = "You are an expert document analyzer. Respond ONLY in Hebrew.";
  let prompt = "";
  
  switch(mode) {
      case 'summarize':
          prompt = "Summarize these documents in depth (Hebrew).";
          break;
      case 'translate':
          prompt = `Translate the documents to Hebrew.`;
          break;
      case 'extract':
          prompt = "Extract key data points from these documents in Hebrew.";
          break;
      case 'chat':
          prompt = "Answer the user's questions based on the documents in Hebrew.";
          break;
  }

  const contents: any[] = [];
  
  const fileParts = files.map(f => ({
      inlineData: {
          data: f.data.split(',')[1],
          mimeType: f.type
      }
  }));
  
  if (history.length > 0) {
      history.forEach((h: any) => {
           contents.push({
               role: h.role === 'assistant' ? 'model' : 'user',
               parts: [{ text: h.text }]
           });
      });
  }

  contents.push({
      role: 'user',
      parts: [...fileParts, { text: prompt }]
  });

  const response = await ai.models.generateContent({
      model,
      contents,
      config: { systemInstruction }
  });
  
  return response.text || "";
};

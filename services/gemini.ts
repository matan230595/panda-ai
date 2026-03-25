
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AIModelMode, PandaPersona, APIConfig, AppSettings, Project, StrategicMessageResult, MessageSettings, AIEngine, ChatMessage, ClarifyingQuestion } from "../types";
import { decode, decodeAudioData } from "./audio";

export const getAI = (apiConfigs?: APIConfig[]) => {
  let key = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  // Fallback to user-provided Google key if environment key is missing
  if (!key && apiConfigs) {
    const googleConfig = apiConfigs.find(c => c.provider === 'google' || c.provider === 'gemini');
    if (googleConfig?.apiKey) {
      key = googleConfig.apiKey;
    }
  }

  if (!key) {
    const errorMsg = "שגיאת מערכת: מפתח API חסר. אנא וודא שהגדרת מפתח API בהגדרות.";
    throw new Error(errorMsg);
  }
  return new GoogleGenAI({ apiKey: key });
};

const cleanJson = (text: string): string => {
    return text.replace(/```json\n?|```/g, '').trim();
};

const callAiProxy = async (endpoint: string, apiKey: string, body: any, headers: any = {}) => {
    try {
        const response = await fetch('/api/ai/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint,
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    ...headers
                },
                body
            })
        });
        return response;
    } catch (error) {
        console.error("Proxy call failed:", error);
        throw error;
    }
};

const getPoeResponse = async (prompt: string, model: string, apiKey: string, history: ChatMessage[]) => {
    const endpoint = 'https://api.poe.com/v1/chat/completions';

    const messages = [
        ...history.map(msg => ({
            role: msg.role === 'assistant' ? 'bot' : 'user',
            content: msg.content
        })),
        { role: 'user', content: prompt }
    ];

    try {
        const response = await callAiProxy(endpoint, apiKey, {
            model: model,
            messages: messages,
        });

        if (!response.ok) {
            let errorMessage = `שגיאה בתקשורת עם Poe: ${response.status} ${response.statusText}`;
            try {
                const errorBody = await response.json();
                console.error("Poe API Error Response:", errorBody);
                if (errorBody.error) {
                    const errorCode = errorBody.error.code;
                    if (errorCode === 'invalid_api_key') {
                        errorMessage = "שגיאה: מפתח ה-API של Poe שהוזן אינו תקין. אנא בדוק את המפתח במרכז ה-API ונסה שוב.";
                    } else if (errorCode === 'model_not_found') {
                        errorMessage = `שגיאה: המודל '${model}' לא נמצא או שאין לך גישה אליו ב-Poe. אנא בחר מודל אחר.`;
                    } else {
                        errorMessage = `שגיאת Poe: ${errorBody.error.message || errorMessage}`;
                    }
                }
            } catch (e) {
                if (response.status === 404) {
                    errorMessage = "שגיאת 'Not Found' (404) מ-Poe. שגיאה זו מתרחשת בדרך כלל כאשר שם המודל אינו נכון או שאינו זמין בחשבון שלך. ודא שבחרת מודל מהרשימה ושיש לך גישה אליו בחשבון Poe שלך (למשל, מודלים מסוימים דורשים מנוי).";
                }
                const rawError = await response.text().catch(() => "לא ניתן היה לקרוא את תגובת השגיאה.");
                console.error("Poe API Raw Error Response:", rawError);
            }
            return { text: errorMessage, groundingSources: [], thoughtSteps: [] };
        }

        const result = await response.json();
        const text = result.choices[0]?.message?.content || `קיבלתי תשובה לא צפויה מ-Poe: ${JSON.stringify(result)}`;

        return { text: text, groundingSources: [], thoughtSteps: [] };

    } catch (error: any) {
        console.error("Poe Fetch Network Error:", error);
        return { text: `שגיאת רשת בעת פנייה ל-Poe: ${error.message}`, groundingSources: [], thoughtSteps: [] };
    }
};

const getGroqResponse = async (prompt: string, model: string, apiKey: string, history: ChatMessage[]) => {
    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    const messages = history.map(msg => ({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content }));
    messages.push({ role: 'user', content: prompt });

    try {
        const response = await callAiProxy(endpoint, apiKey, { model, messages });
        if (!response.ok) {
            const error = await response.json();
            console.error("Groq API Error:", error);
            return { text: `שגיאת Groq: ${error.error.message}`, groundingSources: [], thoughtSteps: [] };
        }
        const result = await response.json();
        return { text: result.choices[0]?.message?.content || '', groundingSources: [], thoughtSteps: [] };
    } catch (error: any) {
        return { text: `שגיאת רשת עם Groq: ${error.message}`, groundingSources: [], thoughtSteps: [] };
    }
};

const getMistralResponse = async (prompt: string, model: string, apiKey: string, history: ChatMessage[]) => {
    const endpoint = 'https://api.mistral.ai/v1/chat/completions';
    const messages = history.map(msg => ({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content }));
    messages.push({ role: 'user', content: prompt });
    
    try {
        const response = await callAiProxy(endpoint, apiKey, { model, messages });
        if (!response.ok) {
            const error = await response.json();
            console.error("Mistral API Error:", error);
            return { text: `שגיאת Mistral: ${error.message || JSON.stringify(error)}`, groundingSources: [], thoughtSteps: [] };
        }
        const result = await response.json();
        return { text: result.choices[0]?.message?.content || '', groundingSources: [], thoughtSteps: [] };
    } catch (error: any) {
        return { text: `שגיאת רשת עם Mistral: ${error.message}`, groundingSources: [], thoughtSteps: [] };
    }
};

const getHuggingFaceResponse = async (prompt: string, model: string, apiKey: string) => {
    const endpoint = `https://api-inference.huggingface.co/models/${model}`;
    try {
        const response = await callAiProxy(endpoint, apiKey, { 
            inputs: prompt,
            parameters: { return_full_text: false }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Hugging Face API Error Response:", errorBody);
            if (response.status === 503) {
                 return { text: `שגיאה 503 מ-Hugging Face: המודל (${model}) כנראה בטעינה. אנא המתן כדקה ונסה שוב.`, groundingSources: [], thoughtSteps: [] };
            }
            return { text: `שגיאה בתקשורת עם Hugging Face: ${response.statusText}. וודא שהמודל ${model} זמין ושהמפתח שלך תקין.`, groundingSources: [], thoughtSteps: [] };
        }

        const result = await response.json();
        const generatedText = result[0]?.generated_text || `קיבלתי תשובה לא צפויה מ-Hugging Face: ${JSON.stringify(result)}`;
        return { text: generatedText.trim(), groundingSources: [], thoughtSteps: [] };

    } catch (error: any) {
        console.error("Hugging Face Fetch Network Error:", error);
        return { text: `שגיאת רשת בעת פנייה ל-HuggingFace: ${error.message}`, groundingSources: [], thoughtSteps: [] };
    }
};


export const getGeminiResponse = async (
  prompt: string,
  mode: AIModelMode,
  history: ChatMessage[] = [],
  project?: Project,
  persona?: PandaPersona,
  attachments?: { data: string; mimeType: string }[],
  engine: AIEngine = { provider: 'gemini', model: 'gemini-3-flash-preview' },
  apiConfigs?: APIConfig[],
  appSettings?: AppSettings,
  onStream?: (chunk: string) => void,
  abortSignal?: AbortSignal
) => {

  if (engine.provider === 'poe') {
      const poeConfig = apiConfigs?.find(api => api.provider === 'poe');
      if (!poeConfig?.apiKey || poeConfig.apiKey.trim() === '') {
          return { text: "שגיאה: מפתח API של Poe אינו מוגדר. אנא הגדר אותו במרכז ה-API.", groundingSources: [], thoughtSteps: [] };
      }
      return getPoeResponse(prompt, engine.model || 'claude-3-haiku', poeConfig.apiKey, history);
  } else if (engine.provider === 'huggingface') {
      const hfConfig = apiConfigs?.find(api => api.provider === 'huggingface');
      if (!hfConfig?.apiKey || hfConfig.apiKey.trim() === '') {
          return { text: "שגיאה: מפתח API של Hugging Face אינו מוגדר. אנא הגדר אותו במרכז ה-API.", groundingSources: [], thoughtSteps: [] };
      }
      if (!engine.model) {
           return { text: "שגיאה: לא נבחר מודל ספציפי עבור Hugging Face.", groundingSources: [], thoughtSteps: [] };
      }
      return getHuggingFaceResponse(prompt, engine.model, hfConfig.apiKey);
  } else if (engine.provider === 'groq') {
      const groqConfig = apiConfigs?.find(api => api.provider === 'groq');
      if (!groqConfig?.apiKey || groqConfig.apiKey.trim() === '') {
          return { text: "שגיאה: מפתח API של Groq אינו מוגדר. אנא הגדר אותו במרכז ה-API.", groundingSources: [], thoughtSteps: [] };
      }
      return getGroqResponse(prompt, engine.model || 'llama3-70b-8192', groqConfig.apiKey, history);
  } else if (engine.provider === 'mistral') {
      const mistralConfig = apiConfigs?.find(api => api.provider === 'mistral');
      if (!mistralConfig?.apiKey || mistralConfig.apiKey.trim() === '') {
          return { text: "שגיאה: מפתח API של Mistral אינו מוגדר. אנא הגדר אותו במרכז ה-API.", groundingSources: [], thoughtSteps: [] };
      }
      return getMistralResponse(prompt, engine.model || 'mistral-small-latest', mistralConfig.apiKey, history);
  }

  const ai = getAI(apiConfigs);
  let modelName = engine.model || 'gemini-3-flash-preview';

  if (engine.provider === 'gemini') {
    if (mode === AIModelMode.THINKING || mode === AIModelMode.RESEARCH) {
      modelName = 'gemini-3.1-pro-preview';
    }
  }

  let systemInstruction = `You are Panda, a strategic AI assistant. Persona: ${persona}. User expertise: ${appSettings?.expertiseLevel}. User role: ${appSettings?.userRole}. User bio: ${appSettings?.userBio}.`;
  if (project) {
    systemInstruction += `\nProject Context: ${project.name} - ${project.description}. Files: ${project.files.map(f => f.name).join(', ')}`;
  }

  const modelConfig: any = {
    systemInstruction,
    config: {},
  };

  if (mode === AIModelMode.THINKING) {
      modelConfig.config.thinkingConfig = { thinkingLevel: "HIGH" };
  } else if (mode === AIModelMode.RESEARCH) {
      modelConfig.config.tools = [{ googleSearch: {} }];
  }

  // FIX: Handle attachments in chat history messages to support multimodal conversations.
  const geminiHistory = history.map(m => {
    const parts: any[] = [{ text: m.content }];
    if (m.attachments) {
      m.attachments.forEach(att => {
        const base64Data = att.data.split(',')[1];
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: base64Data
          }
        });
      });
    }
    return {
      role: m.role === 'user' ? 'user' : 'model',
      parts
    };
  });

  // FIX: Explicitly type `parts` as `any[]` to prevent a TypeScript error when pushing
  // different object shapes (text vs. inlineData) for multimodal input.
  const parts: any[] = [{ text: prompt }];
  if (attachments && attachments.length > 0) {
    attachments.forEach(att => {
      const base64Data = att.data.split(',')[1];
      parts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: base64Data
        }
      });
    });
  }
  
  const contents = [...geminiHistory, { role: 'user', parts }];
  
  if (onStream) {
      // Streaming logic...
  }

  try {
      const response = await ai.models.generateContent({ 
        model: modelName, 
        ...modelConfig, 
        contents 
      });
      const text = response.text || "לא התקבלה תגובה מהמודל.";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return { text, groundingSources: groundingChunks, thoughtSteps: [] };
  } catch (error: any) {
      console.error("Gemini API Error:", error);
      return { text: `שגיאה בתקשורת עם Gemini: ${error.message}`, groundingSources: [], thoughtSteps: [] };
  }
};

export const generateOrEditImage = async (
  prompt: string,
  baseImage?: string,
  mimeType?: string,
  config: { aspectRatio: string, imageSize: '1K' | '2K' | '4K' } = { aspectRatio: '1:1', imageSize: '1K' },
  apiConfigs?: APIConfig[]
): Promise<string> => {
  const ai = getAI(apiConfigs);
  // FIX: Explicitly type `parts` as `any[]` to allow for different part types (text and inlineData).
  const parts: any[] = [{ text: prompt }];
  if (baseImage && mimeType) {
    parts.unshift({
      inlineData: {
        data: baseImage.split(',')[1],
        mimeType: mimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts: parts },
    config: { imageConfig: { aspectRatio: config.aspectRatio, imageSize: config.imageSize } }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("לא נוצרה תמונה");
};


export const generateVideo = async (
  prompt: string,
  onProgress: (msg: string) => void,
  baseImage?: string,
  mimeType?: string,
  aspectRatio: '16:9' | '9:16' = '16:9',
  apiConfigs?: APIConfig[]
): Promise<string> => {
  const ai = getAI(apiConfigs);

  const payload: any = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    }
  };

  if (baseImage && mimeType) {
    payload.image = {
      imageBytes: baseImage.split(',')[1],
      mimeType: mimeType
    };
  }

  let operation = await ai.models.generateVideos(payload);
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed.");
  
  const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const proxyUrl = `/api/video/proxy?url=${encodeURIComponent(downloadLink)}&key=${key}`;
  const response = await fetch(proxyUrl);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateSpeechSample = async (voice: string, text: string, apiConfigs?: APIConfig[]): Promise<string | null> => {
    const ai = getAI(apiConfigs);
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (error) {
        console.error("Error generating speech sample:", error);
        return null;
    }
};

export const analyzeDocument = async (files: any[], task: string, params: any, chatHistory: any[], settings: AppSettings, apiConfigs?: APIConfig[]): Promise<string> => {
    const ai = getAI(apiConfigs);
    const fileParts = files.map(f => ({
        inlineData: { data: f.data.split(',')[1], mimeType: f.type }
    }));
    
    let prompt = '';
    switch (task) {
        case 'summarize': prompt = `סכם את המסמכים המצורפים. סוג הסיכום: ${params.summaryType === 'deep' ? 'סיכום עומק מפורט' : 'נקודות מפתח עיקריות'}.`; break;
        case 'translate': prompt = `תרגם את המסמכים המצורפים לשפת ${params.targetLang}.`; break;
        case 'extract': prompt = `חלץ את המידע הבא מהמסמכים: "${params.customQuestion}".`; break;
        case 'chat': prompt = params.customQuestion; break;
    }

    const contents = [
        ...chatHistory.map(m => ({ role: m.role, parts: [{text: m.text}] })),
        { role: 'user', parts: [...fileParts, { text: prompt }] }
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: contents,
    });
    return response.text || '';
};

export const generateMasterMessages = async (context: string, settings: MessageSettings, appSettings: AppSettings, apiConfigs?: APIConfig[]): Promise<StrategicMessageResult[]> => {
    const ai = getAI(apiConfigs);
    const systemInstruction = `You are a strategic communication expert and psychologist. Your goal is to generate 3 distinct versions of a message based on a user's context and settings. For each version, provide a detailed analysis of its psychological strategy, success probability, predicted sentiment, and likely response. User bio: ${appSettings.userBio}.`;
    const prompt = `Context: "${context}". Audience: "${settings.audience}". My goal: ${settings.strategicGoal}. Desired format: ${settings.format}. Message intensity (1-10): ${settings.intensity}. Formality (1-10): ${settings.formalLevel}. Emotional tone: ${settings.emotion}.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
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

    const jsonText = cleanJson(response.text || "[]");
    return JSON.parse(jsonText);
};

export const generateWebComponent = async (prompt: string, engine: AIEngine, apiConfigs: APIConfig[]): Promise<{html: string, css: string, js: string}> => {
    const ai = getAI(apiConfigs);
    const systemInstruction = `You are an expert web developer. Your task is to generate a complete, self-contained web component based on the user's description.
    Provide the HTML, CSS, and JavaScript code in a structured JSON format.
    The CSS should be modern and clean. The JavaScript should be vanilla, without any frameworks.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [{ parts: [{ text: `User's request: "${prompt}"` }] }],
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    html: { type: Type.STRING },
                    css: { type: Type.STRING },
                    js: { type: Type.STRING }
                }
            }
        }
    });

    const jsonText = cleanJson(response.text || "{}");
    return JSON.parse(jsonText);
};

export const generateClarifyingQuestions = async (lazyPrompt: string, apiConfigs?: APIConfig[]): Promise<ClarifyingQuestion[]> => {
    const ai = getAI(apiConfigs);
    const systemInstruction = `You are a world-class prompt engineering expert named "Prompt Cowboy". Your goal is to help a user refine their simple request into a detailed, professional prompt.
    Based on the user's request, generate 3-4 insightful clarifying questions that will help you understand the user's true intent, context, and desired output format.
    For each question, provide 3-4 short, distinct, one-word or two-word answers as options.
    The questions MUST be in Hebrew. The answers MUST also be in Hebrew.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: [{ parts: [{ text: `User's initial request: "${lazyPrompt}"\n\nGenerate clarifying questions.` }] }],
            config: { 
                systemInstruction, 
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            answers: { 
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["question", "answers"]
                    }
                }
            },
        });
        const jsonText = cleanJson(response.text || "[]");
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating clarifying questions:", error);
        throw new Error("Failed to generate clarifying questions.");
    }
};

export const generateInitialCowboyPrompt = async (lazyPrompt: string, apiConfigs?: APIConfig[]): Promise<any> => {
    const ai = getAI(apiConfigs);
    const systemInstruction = `You are a world-class prompt engineer. Your task is to take a user's simple request and transform it into a highly detailed and structured "Cowboy Prompt".
    Make expert assumptions to fill in the details. The goal is to create a powerful initial prompt that can be used immediately.
    
    Structure the output as a JSON object with the following keys. All values MUST be in Hebrew:
    - persona: The expert persona the AI should adopt.
    - situation: The context or background for the task.
    - task: The main action the AI needs to perform.
    - objective: The ultimate goal or desired outcome.
    - knowledge: Specific knowledge or constraints the AI must adhere to.
    - examples: A brief example of the desired output style.
    - format: Specific formatting instructions for the output.
    - qa: A quality assurance question the AI should ask itself before responding.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: [{ parts: [{ text: `User's request: "${lazyPrompt}"\n\nGenerate the initial cowboy prompt.` }] }],
            config: { 
                systemInstruction, 
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        persona: { type: Type.STRING },
                        situation: { type: Type.STRING },
                        task: { type: Type.STRING },
                        objective: { type: Type.STRING },
                        knowledge: { type: Type.STRING },
                        examples: { type: Type.STRING },
                        format: { type: Type.STRING },
                        qa: { type: Type.STRING },
                        negative: { type: Type.STRING }
                    },
                    required: ["persona", "situation", "task", "objective", "knowledge", "examples", "format", "qa", "negative"]
                }
            },
        });
        const jsonText = cleanJson(response.text || "{}");
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating initial cowboy prompt:", error);
        throw new Error("Failed to generate initial cowboy prompt.");
    }
};

export const refineCowboyPrompt = async (
    initialPrompt: any, 
    answeredQuestions: { question: string; answer: string }[],
    speakingStyle: string,
    writingStyle: string,
    targetAudience: string,
    outputFormat: string,
    length: string,
    apiConfigs?: APIConfig[]
): Promise<any> => {
    const ai = getAI(apiConfigs);
    const systemInstruction = `You are a world-class prompt engineer. Your task is to revise and improve an initial prompt based on user feedback and style preferences.
    Integrate the new information seamlessly into the existing structure.
    Adjust the language and instructions within the prompt to reflect the chosen speaking and writing styles, target audience, output format, and length.
    
    CRITICAL: Structure the final prompt using the following professional framework for maximum effectiveness:
    1. Persona/Role: Define who the model is.
    2. Context: Provide relevant background.
    3. Task: Define the exact task.
    4. Objective: State the final goal.
    5. Constraints/Rules: Set boundaries.
    6. Chain-of-Thought: Instruct the model to think step-by-step.
    7. Few-Shot Examples: Provide concrete examples.
    8. Output Format: Define how the output should look.
    9. Negative Constraints: Specify what NOT to do.
    
    Ensure the prompt is extremely clear, actionable, and follows best practices for LLM prompting.
    Maintain the same JSON structure as the initial prompt. All values MUST be in Hebrew.`;

    const context = `
    This is the initial, expert-assumed "Cowboy Prompt":
    ${JSON.stringify(initialPrompt, null, 2)}

    The user has provided the following answers and style preferences to refine the prompt:
    ${answeredQuestions.map(a => `- Question: "${a.question}"\n  - User's Answer: "${a.answer}"`).join('\n')}
    - Desired Speaking Style: ${speakingStyle}
    - Desired Writing Style: ${writingStyle}
    - Target Audience: ${targetAudience}
    - Output Format: ${outputFormat}
    - Desired Length: ${length}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: [{ parts: [{ text: context }] }],
            config: { 
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        persona: { type: Type.STRING },
                        situation: { type: Type.STRING },
                        task: { type: Type.STRING },
                        objective: { type: Type.STRING },
                        knowledge: { type: Type.STRING },
                        examples: { type: Type.STRING },
                        format: { type: Type.STRING },
                        qa: { type: Type.STRING },
                        negative: { type: Type.STRING }
                    },
                    required: ["persona", "situation", "task", "objective", "knowledge", "examples", "format", "qa", "negative"]
                }
            },
        });
        const jsonText = cleanJson(response.text || "{}");
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error refining cowboy prompt:", error);
        throw new Error("Failed to refine cowboy prompt.");
    }
};

/**
 * Critiques a prompt and provides improvement suggestions.
 */
export const critiquePrompt = async (components: any, apiConfigs?: APIConfig[]): Promise<any> => {
    const ai = getAI(apiConfigs);
    const systemInstruction = `You are a Senior Prompt Auditor. Analyze the following prompt components and provide a critical review in Hebrew.
    Provide a score (1-100), identify strengths, weaknesses, and specific suggestions for improvement.
    Also provide a "DNA" profile with scores (0-10) for Clarity, Context, Persona, and Constraints.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: [{ parts: [{ text: `PROMPT COMPONENTS:\n${JSON.stringify(components, null, 2)}` }] }],
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        dna: {
                            type: Type.OBJECT,
                            properties: {
                                clarity: { type: Type.NUMBER },
                                context: { type: Type.NUMBER },
                                persona: { type: Type.NUMBER },
                                constraints: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            }
        });
        const jsonText = cleanJson(response.text || "{}");
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error critiquing prompt:", error);
        return null;
    }
};

/**
 * Refines a prompt based on a specific chat instruction.
 */
export const chatRefinePrompt = async (components: any, instruction: string, apiConfigs?: APIConfig[]): Promise<any> => {
    const ai = getAI(apiConfigs);
    const systemInstruction = `You are a World-Class Prompt Engineer.
    The user wants to refine their current prompt based on a specific instruction.
    
    Current Components:
    ${JSON.stringify(components, null, 2)}
    
    Instruction:
    "${instruction}"
    
    Task:
    1. Apply the instruction to the relevant components.
    2. Maintain the overall structure and persona.
    3. Ensure the final prompt is clear, actionable, and follows best practices.
    4. Return the updated components as JSON in Hebrew.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: [{ parts: [{ text: instruction }] }],
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        persona: { type: Type.STRING },
                        situation: { type: Type.STRING },
                        task: { type: Type.STRING },
                        objective: { type: Type.STRING },
                        knowledge: { type: Type.STRING },
                        examples: { type: Type.STRING },
                        format: { type: Type.STRING },
                        qa: { type: Type.STRING },
                        negative: { type: Type.STRING }
                    },
                    required: ["persona", "situation", "task", "objective", "knowledge", "examples", "format", "qa", "negative"]
                }
            }
        });
        const jsonText = cleanJson(response.text || "{}");
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error in chatRefinePrompt:", error);
        return components;
    }
};



export const magicEnhancePrompt = async (text: string, context: string = "", apiConfigs?: APIConfig[]): Promise<string> => {
    const ai = getAI(apiConfigs);
    const systemInstruction = `You are a Master of Language and Logic. Your task is to take the following text (which is part of an AI prompt) and "Magic Enhance" it.
    Make it more professional, precise, and effective. Use advanced vocabulary and clear structure.
    Return ONLY the enhanced text in Hebrew. Do not include any explanations.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: [{ parts: [{ text: `TEXT TO ENHANCE: "${text}"\n${context ? `CONTEXT: ${context}` : ""}` }] }],
            config: { systemInstruction }
        });
        return response.text || text;
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        return text;
    }
};


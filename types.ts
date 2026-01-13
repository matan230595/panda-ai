

export enum AIModelMode {
  STANDARD = 'FAST',
  THINKING = 'REASONING',
  RESEARCH = 'RESEARCH',
  VISION = 'VISION',
  AGENTIC = 'AGENTIC' // New mode for autonomous task execution
}

export enum UserRole {
  BEGINNER = 'USER',
  DEVELOPER = 'DEV',
  BUSINESS = 'BUSINESS'
}

export enum PandaPersona {
  DEVELOPER = 'מפתח תוכנה',
  PSYCHOLOGIST = 'פסיכולוג אסטרטגי',
  MARKETER = 'מומחה שיווק',
  DESIGNER = 'מעצב מוצר',
  WRITER = 'כותב תוכן',
  STRATEGIST = 'אסטרטג'
}

export enum ViewMode {
  CHAT = 'מרחב שיחה',
  PROJECT_DASHBOARD = 'ניהול פרויקט',
  VOICE = 'ממשק קולי',
  API_HUB = 'חיבורי מערכת',
  PROMPT_LAB = 'מעבדת הנחיות',
  MESSAGE_GEN = 'אסטרטגיית מסרים',
  SETTINGS = 'הגדרות',
  IMAGE_GEN = 'סטודיו תמונות',
  VIDEO_GEN = 'סטודיו וידאו',
  DASHBOARD = 'לוח בקרה',
  DOC_ANALYSIS = 'ניהול מסמכים',
  TEMPLATES = 'ספריית תבניות',
  NEURAL_MIND = 'מוח עצבי' // New visualization view
}

export interface ThoughtStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  description?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // base64
  size: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: AIModelMode;
  timestamp: string;
  attachments?: Attachment[];
  groundingSources?: { title: string; uri: string }[];
  thoughtProcess?: ThoughtStep[]; // New field for visualizing AI logic
  sentiment?: string;
  relatedQuestions?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  projectId?: string;
  persona: PandaPersona;
  lastUpdate: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface LegalContent {
  terms: string;
  privacy: string;
  accessibility: string;
  contact: string;
}

export interface AppSettings {
  language: 'he' | 'en' | 'es';
  theme: 'midnight';
  enableSearch: boolean;
  codeExecutionEnabled: boolean;
  autoSave: boolean;
  selfReflect: boolean;
  autonomousAPIs: boolean;
  uiIntensity: number;
  voiceName: string;
  voiceTone: 'professional' | 'aggressive' | 'calm';
  bargeInSensitivity: number;
  userRole: UserRole;
  userBio: string;
  legalContent: LegalContent;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  files: any[];
  createdAt: string;
  environment?: {
    framework: string;
    libraries: string[];
    target: string;
  };
}

export interface MessageSettings {
  intensity: number;
  formalLevel: number;
  emotion: 'professional' | 'warm' | 'sharp' | 'neutral';
  strategicGoal: string;
  format: string;
}

export interface StrategicMessageResult {
  content: string;
  successProbability: number;
  predictedSentiment: string;
  reasoning: string;
}

export interface APIConfig {
  id: string;
  name: string;
  baseUrl?: string;
  authHeader?: string;
  provider: 'google' | 'openai' | 'anthropic' | 'groq' | 'mistral';
  apiKey: string;
  status: 'active' | 'testing' | 'inactive';
  latency?: number;
  description?: string;
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
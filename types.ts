
export enum AIModelMode {
  STANDARD = 'FAST',
  THINKING = 'REASONING',
  RESEARCH = 'RESEARCH',
  VISION = 'VISION',
  AGENTIC = 'AGENTIC'
}

export enum UserRole {
  BEGINNER = 'USER',
  DEVELOPER = 'DEV',
  BUSINESS = 'BUSINESS'
}

export enum ExpertiseLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
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
  LANDING = 'LANDING',
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
  NEURAL_MIND = 'מוח עצבי',
  ADMIN_PANEL = 'ניהול מערכת',
  PANDA_CODER = 'סטודיו קוד',
  ACADEMY = 'האקדמיה'
}

export interface DynamicContent {
  landingTitle: string;
  landingSubtitle: string;
  landingDesc: string;
  dashboardWelcome: string;
  dashboardSubWelcome: string;
  toolsTitle: string;
  newChatBtn: string;
  newProjectBtn: string;
  footerCopyright: string;
  
  // Editable Nav Items
  navDashboard: string;
  navChat: string;
  navTemplates: string;
  navDocs: string;
  navProjects: string;
  navVoice: string;
  navPrompt: string;
  navImage: string;
  navMessage: string;
  navPandaCoder: string;
  navAcademy: string;

  // Editable Tool Titles
  toolStrategy: string;
  toolDocs: string;
  toolProjects: string;
  toolArt: string;
  toolVoice: string;
  toolVideo: string;
  toolPrompt: string;
  toolMessage: string;
  toolTemplates: string;
  toolPandaCoder: string;

  // Editable Model Names
  modeStandard: string;
  modeThinking: string;
  modeResearch: string;
  modeVision: string;
  modeAgentic: string;
}

export interface AppSettings {
  language: 'he' | 'en' | 'es';
  theme: 'midnight';
  themeMode: 'light' | 'dark' | 'system';
  expertiseLevel: ExpertiseLevel;
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
  brandVoice: string;
  legalContent: {
    terms: string;
    privacy: string;
    accessibility: string;
    contact: string;
    mobile: string;
    email: string;
    address: string;
    waLink: string;
    mapEmbed: string;
  };
  dynamicContent: DynamicContent;
  isAdmin: boolean;
  customLogoUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  files: any[];
  linkedChatIds: string[];
  createdAt: string;
}

export interface ThoughtStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  description?: string;
}

export interface AIEngine {
  provider: 'gemini' | 'poe' | 'huggingface' | 'groq' | 'mistral';
  model?: string; // e.g., 'gemini-pro' or 'claude-3-opus'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: AIModelMode;
  engine?: AIEngine;
  timestamp: string;
  attachments?: { data: string; mimeType: string; name: string }[];
  thoughtProcess?: ThoughtStep[];
  status?: 'sending' | 'sent' | 'error';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  projectId?: string;
  persona: PandaPersona;
  lastUpdate: string;
  isPinned?: boolean;
}

export interface APIConfig {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  status: 'active' | 'inactive';
}

export interface MessageSettings {
  intensity: number;
  formalLevel: number;
  emotion: 'professional' | 'warm' | 'sharp' | 'neutral';
  strategicGoal: string;
  format: string;
  length: 'short' | 'medium' | 'long';
  audience: string;
}

export interface StrategicMessageResult {
  content: string;
  successProbability: number;
  predictedSentiment: string;
  predictedResponse: string;
  reasoning: string;
}

export interface ClarifyingQuestion {
  question: string;
  answers: string[];
}

export interface SavedPrompt {
    id: string;
    name: string;
    content: any; // The full cowboy prompt object
    createdAt: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    webkitAudioContext: typeof AudioContext;
    aistudio?: AIStudio;
  }
}
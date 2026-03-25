
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppSettings, ChatSession, Project, APIConfig, ViewMode, 
  UserRole, PandaPersona, ExpertiseLevel, AIModelMode, SavedPrompt
} from '../types';
import { translations } from '../utils/translations';
import { useToast, ToastMessage } from '../components/Toast';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

// --- Context Interfaces ---
interface IUIContext {
  view: ViewMode;
  isSidebarOpen: boolean;
  legalModal: { isOpen: boolean; type: 'terms' | 'privacy' | 'accessibility' | 'contact' };
  toasts: ToastMessage[];
  setView: (view: ViewMode) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  openLegalModal: (type: 'terms' | 'privacy' | 'accessibility' | 'contact') => void;
  closeLegalModal: () => void;
  showToast: (text: string, type?: 'success' | 'info' | 'celebrate' | 'error') => void;
}
interface IAppSettingsContext { appSettings: AppSettings; updateAppSettings: (newSettings: Partial<AppSettings>) => void; }
interface IChatContext { sessions: ChatSession[]; activeSessionId: string | null; activeSession: ChatSession | null; newChat: (prompt?: string, title?: string, attachments?: any[], projectId?: string) => ChatSession; updateSession: (session: ChatSession) => void; deleteSession: (id: string) => void; continueChat: (sessionId: string) => void; togglePinSession: (id: string) => void; }
interface IProjectContext { projects: Project[]; newProject: (project: Project) => void; updateProject: (project: Project) => void; deleteProject: (id: string) => void; }
interface IApiContext { apiConfigs: APIConfig[]; addApi: (api: APIConfig) => void; removeApi: (id: string) => void; }
interface IPromptContext { savedPrompts: SavedPrompt[]; savePrompt: (prompt: SavedPrompt) => void; deletePrompt: (id: string) => void; }


// --- Context Creation ---
const UIContext = createContext<IUIContext | undefined>(undefined);
const AppSettingsContext = createContext<IAppSettingsContext | undefined>(undefined);
const ChatContext = createContext<IChatContext | undefined>(undefined);
const ProjectContext = createContext<IProjectContext | undefined>(undefined);
const ApiContext = createContext<IApiContext | undefined>(undefined);
const PromptContext = createContext<IPromptContext | undefined>(undefined);

// --- Custom Hooks ---
export const useUI = () => { const context = useContext(UIContext); if (!context) throw new Error('useUI must be used within a UIProvider'); return context; };
export const useAppSettings = () => { const context = useContext(AppSettingsContext); if (!context) throw new Error('useAppSettings must be used within an AppSettingsProvider'); return context; };
export const useChat = () => { const context = useContext(ChatContext); if (!context) throw new Error('useChat must be used within a ChatProvider'); return context; };
export const useProjects = () => { const context = useContext(ProjectContext); if (!context) throw new Error('useProjects must be used within a ProjectProvider'); return context; };
export const useApi = () => { const context = useContext(ApiContext); if (!context) throw new Error('useApi must be used within an ApiProvider'); return context; };
export const usePrompts = () => { const context = useContext(PromptContext); if (!context) throw new Error('usePrompts must be used within a PromptProvider'); return context; };

// --- Individual Providers ---

const UIProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setViewState] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'terms' | 'privacy' | 'accessibility' | 'contact' }>({ isOpen: false, type: 'terms' });
  const { toasts, showToast } = useToast();

  // Map paths to ViewMode
  const pathToView = useMemo(() => ({
    '/': ViewMode.DASHBOARD,
    '/dashboard': ViewMode.DASHBOARD,
    '/chat': ViewMode.CHAT,
    '/projects': ViewMode.PROJECT_DASHBOARD,
    '/settings': ViewMode.SETTINGS,
    '/image-gen': ViewMode.IMAGE_GEN,
    '/video-gen': ViewMode.VIDEO_GEN,
    '/prompt': ViewMode.PROMPT_LAB,
    '/message-gen': ViewMode.MESSAGE_GEN,
    '/docs': ViewMode.DOC_ANALYSIS,
    '/templates': ViewMode.TEMPLATES,
    '/voice': ViewMode.VOICE,
    '/admin': ViewMode.ADMIN_PANEL,
    '/api-hub': ViewMode.API_HUB,
    '/coder': ViewMode.PANDA_CODER,
    '/academy': ViewMode.ACADEMY,
  }), []);

  // Map ViewMode to paths
  const viewToPath = useMemo(() => ({
    [ViewMode.DASHBOARD]: '/dashboard',
    [ViewMode.CHAT]: '/chat',
    [ViewMode.PROJECT_DASHBOARD]: '/projects',
    [ViewMode.SETTINGS]: '/settings',
    [ViewMode.IMAGE_GEN]: '/image-gen',
    [ViewMode.VIDEO_GEN]: '/video-gen',
    [ViewMode.PROMPT_LAB]: '/prompt',
    [ViewMode.MESSAGE_GEN]: '/message-gen',
    [ViewMode.DOC_ANALYSIS]: '/docs',
    [ViewMode.TEMPLATES]: '/templates',
    [ViewMode.VOICE]: '/voice',
    [ViewMode.ADMIN_PANEL]: '/admin',
    [ViewMode.API_HUB]: '/api-hub',
    [ViewMode.PANDA_CODER]: '/coder',
    [ViewMode.ACADEMY]: '/academy',
  }), []);

  // Sync state with URL on mount and location change
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedView = (pathToView as any)[currentPath];
    if (matchedView && matchedView !== view) {
      setViewState(matchedView);
    }
  }, [location.pathname, pathToView, view]);

  const setView = useCallback((newView: ViewMode) => {
    setViewState(newView);
    const path = (viewToPath as any)[newView] || '/';
    navigate(path);
  }, [navigate, viewToPath]);

  const value = useMemo(() => ({
    view, setView, isSidebarOpen, setIsSidebarOpen, legalModal, 
    openLegalModal: (type: 'terms' | 'privacy' | 'accessibility' | 'contact') => setLegalModal({ isOpen: true, type }),
    closeLegalModal: () => setLegalModal({ isOpen: false, type: 'terms' }),
    toasts, showToast
  }), [view, setView, isSidebarOpen, legalModal, toasts, showToast]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

const AppSettingsProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [appSettings, setAppSettingsState] = useState<AppSettings>(() => {
    const t = translations.he;
    const defaultSettings: AppSettings = { 
        language: 'he', 
        theme: 'midnight', 
        themeMode: 'dark', 
        expertiseLevel: ExpertiseLevel.BASIC, 
        enableSearch: true, 
        codeExecutionEnabled: false, 
        autoSave: true, 
        selfReflect: true, 
        autonomousAPIs: false, 
        uiIntensity: 80, 
        voiceName: 'Zephyr', 
        voiceTone: 'professional', 
        bargeInSensitivity: 0.6, 
        userRole: UserRole.BEGINNER, 
        userBio: 'משתמש יקר', 
        brandVoice: '', 
        isAdmin: false, 
        legalContent: { terms: '', privacy: '', accessibility: '', contact: '', mobile: '', email: '', address: '', waLink: '', mapEmbed: '' }, 
        dynamicContent: { 
            landingTitle: 'PANDA AI Studio', 
            landingSubtitle: 'סטודיו בינה מלאכותית מקצועי בעברית', 
            landingDesc: 'המערכת המובילה בישראל לניהול משימות ושיחות.', 
            dashboardWelcome: 'ברוך הבא, {name}', 
            dashboardSubWelcome: '', 
            toolsTitle: 'סט הכלים של פנדה', 
            newChatBtn: 'שיחה חדשה ⚡', 
            newProjectBtn: 'פרויקט חדש 📁', 
            footerCopyright: 'כל הזכויות שמורות לפנדה סוכנות דיגיטל 2026', 
            navDashboard: t.dashboard, 
            navChat: t.newChat, 
            navTemplates: t.templates, 
            navDocs: t.docAnalysis, 
            navProjects: t.projects, 
            navVoice: t.voice, 
            navPrompt: t.promptLab, 
            navImage: t.imageGen, 
            navMessage: t.messageGen, 
            navPandaCoder: t.titlePandaCoder,
            navAcademy: 'האקדמיה',
            toolStrategy: t.titleStrategy, 
            toolDocs: t.titleDocs, 
            toolProjects: t.titleProjects, 
            toolArt: t.titleArt, 
            toolVoice: t.titleVoice, 
            toolVideo: t.videoGen, 
            toolPrompt: t.titlePrompt, 
            toolMessage: t.titleMessage, 
            toolTemplates: t.templates, 
            toolPandaCoder: t.titlePandaCoder,
            modeStandard: t.modeStandard, 
            modeThinking: t.modeThinking, 
            modeResearch: t.modeResearch, 
            modeVision: t.modeVision, 
            modeAgentic: t.modeAgentic 
        }
    };

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge with defaults to prevent missing keys on updates
        return { 
          ...defaultSettings, 
          ...parsed, 
          dynamicContent: { ...defaultSettings.dynamicContent, ...parsed.dynamicContent }, 
          legalContent: { ...defaultSettings.legalContent, ...parsed.legalContent } 
        };
      }
    } catch (e) { 
      console.error("Failed to parse settings from localStorage", e); 
    }
    
    return defaultSettings;
  });

  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(appSettings)); }, [appSettings]);
  
  const updateAppSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setAppSettingsState(prev => ({ ...prev, ...newSettings }));
  }, []);

  const value = useMemo(() => ({ appSettings, updateAppSettings }), [appSettings, updateAppSettings]);

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};

const ProjectProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS) || '[]'));
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(projects)); }, [projects]);

  const value = useMemo(() => ({
    projects,
    newProject: (p: Project) => setProjects(prev => [...prev, p]),
    updateProject: (p: Project) => setProjects(prev => prev.map(proj => proj.id === p.id ? p : proj)),
    deleteProject: (id: string) => setProjects(prev => prev.filter(p => p.id !== id)),
  }), [projects]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

const ChatProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { projects, updateProject } = useProjects();
  const [sessions, setSessions] = useState<ChatSession[]>(() => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SESSIONS) || '[]'));
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.SESSIONS, JSON.stringify(sessions)); }, [sessions]);
  
  const togglePinSession = useCallback((id: string) => {
    setSessions(prev => {
        const session = prev.find(s => s.id === id);
        if (!session) return prev;
        const otherSessions = prev.filter(s => s.id !== id);
        const updatedSession = { ...session, isPinned: !session.isPinned };
        return [...otherSessions, updatedSession]; // This might mess order, better to map
    });
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s));
  }, []);

  const value = useMemo(() => ({
    sessions, activeSessionId,
    activeSession: sessions.find(s => s.id === activeSessionId) || null,
    newChat: (prompt?: string, title?: string, attachments?: any[], projectId?: string) => {
      const newSession: ChatSession = { id: Date.now().toString(), title: title || 'שיחה חדשה', messages: prompt ? [{ id: '1', role: 'user', content: prompt, mode: AIModelMode.STANDARD, timestamp: new Date().toISOString(), attachments }] : [], persona: PandaPersona.STRATEGIST, lastUpdate: new Date().toISOString(), projectId };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      
      if (projectId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          const updatedLinkedChatIds = [...new Set([...(project.linkedChatIds || []), newSession.id])];
          updateProject({ ...project, linkedChatIds: updatedLinkedChatIds });
        }
      }
      
      return newSession;
    },
    updateSession: (updatedSession: ChatSession) => { setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s)); },
    deleteSession: (id: string) => { 
        setSessions(prev => prev.filter(s => s.id !== id)); 
        if (activeSessionId === id) { 
            setActiveSessionId(null);
        } 
    },
    continueChat: (sessionId: string) => { 
        setActiveSessionId(sessionId);
    },
    togglePinSession
  }), [sessions, activeSessionId, projects, updateProject, togglePinSession]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

const ApiProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [apiConfigs, setApiConfigs] = useState<APIConfig[]>(() => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.APIS) || '[]'));
  useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.APIS, JSON.stringify(apiConfigs)); }, [apiConfigs]);

  const value = useMemo(() => ({
    apiConfigs,
    addApi: (api: APIConfig) => setApiConfigs(prev => [...prev, api]),
    removeApi: (id: string) => setApiConfigs(prev => prev.filter(a => a.id !== id)),
  }), [apiConfigs]);
  
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

const PromptProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(() => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_PROMPTS) || '[]'));
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_PROMPTS, JSON.stringify(savedPrompts)); }, [savedPrompts]);

    const value = useMemo(() => ({
        savedPrompts,
        savePrompt: (prompt: SavedPrompt) => setSavedPrompts(prev => [prompt, ...prev]),
        deletePrompt: (id: string) => setSavedPrompts(prev => prev.filter(p => p.id !== id)),
    }), [savedPrompts]);

    return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>;
};

// --- Main AppProvider Composition ---
export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  return (
    <UIProvider>
      <AppSettingsProvider>
        <ProjectProvider>
          <ChatProvider>
            <ApiProvider>
              <PromptProvider>
                {children}
              </PromptProvider>
            </ApiProvider>
          </ChatProvider>
        </ProjectProvider>
      </AppSettingsProvider>
    </UIProvider>
  );
};
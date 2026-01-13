
import React, { useState, useEffect, Suspense } from 'react';
import { ViewMode, ChatSession, Project, AppSettings, UserRole, PandaPersona, ExpertiseLevel, AIModelMode } from '../types';
import { translations } from '../utils/translations';
import { ToastContainer } from './components/Toast';

// Lazy Load Components
const Sidebar = React.lazy(() => import('./components/Sidebar'));
const ChatArea = React.lazy(() => import('./components/ChatArea'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const ProjectDashboard = React.lazy(() => import('./components/ProjectDashboard'));
const VoiceInterface = React.lazy(() => import('./components/VoiceInterface'));
const Settings = React.lazy(() => import('./components/Settings'));
const ImageGenerator = React.lazy(() => import('./components/ImageGenerator'));
const PromptCowboy = React.lazy(() => import('./components/PromptCowboy'));
const MessageMaster = React.lazy(() => import('./components/MessageMaster'));
const DocumentAnalyzer = React.lazy(() => import('./components/DocumentAnalyzer'));
const Templates = React.lazy(() => import('./components/Templates'));
const ProjectCreationModal = React.lazy(() => import('./components/ProjectCreationModal'));
const LegalModal = React.lazy(() => import('./components/LegalModal'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));

const App: React.FC = () => {
  // FORCE TRUE - NO LANDING PAGE
  const [hasStarted, setHasStarted] = useState<boolean>(true);
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => 
    JSON.parse(localStorage.getItem('panda_sessions_v2') || '[]')
  );
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  
  // Manage Legal Modal State
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'terms' | 'privacy' | 'accessibility' | 'contact' }>({ isOpen: false, type: 'terms' });
  
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('panda_settings_v2');
    return saved ? JSON.parse(saved) : {
      language: 'he', theme: 'midnight', themeMode: 'dark', expertiseLevel: ExpertiseLevel.BASIC,
      enableSearch: true, codeExecutionEnabled: false, autoSave: true, selfReflect: true, autonomousAPIs: false,
      uiIntensity: 80, voiceName: 'Zephyr', voiceTone: 'professional', bargeInSensitivity: 0.6,
      userRole: UserRole.BEGINNER, userBio: 'משתמש יקר', brandVoice: '', isAdmin: false,
      legalContent: { terms: '', privacy: '', accessibility: '', contact: '', mobile: '', email: '', address: '', waLink: '', mapEmbed: '' },
      dynamicContent: {
        landingTitle: 'PANDA AI Studio', landingSubtitle: 'סטודיו בינה מלאכותית מקצועי בעברית',
        landingDesc: 'המערכת המובילה בישראל לניהול משימות ושיחות.',
        dashboardWelcome: 'ברוך הבא למערכת Panda AI Studio',
        dashboardSubWelcome: '',
        toolsTitle: 'סט הכלים של פנדה',
        newChatBtn: 'שיחה חדשה ⚡',
        newProjectBtn: 'פרויקט חדש 📁',
        footerCopyright: 'כל הזכויות שמורות לפנדה סוכנות דיגיטל 2026'
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('panda_sessions_v2', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('panda_settings_v2', JSON.stringify(appSettings));
  }, [appSettings]);

  const handleNewChat = (initialPrompt?: string, title?: string) => {
    const newSession: ChatSession = {
      id: Date.now().toString(), 
      title: title || 'שיחה חדשה', 
      messages: initialPrompt ? [{ id: '1', role: 'user', content: initialPrompt, mode: AIModelMode.STANDARD, timestamp: new Date().toISOString() }] : [],
      persona: PandaPersona.STRATEGIST, 
      lastUpdate: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setView(ViewMode.CHAT);
  };

  const currentSession = sessions.find(s => s.id === activeSessionId) || null;

  return (
    <Suspense fallback={<div className="h-screen bg-[#050508] flex items-center justify-center text-white font-black italic">טוען מערכת...</div>}>
      <div className="flex h-screen bg-[#050508] text-white overflow-hidden" dir="rtl">
        
        {/* SIDEBAR - Fixed Right in RTL */}
        <aside className={`fixed md:relative right-0 top-0 bottom-0 z-[200] h-full transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <Sidebar 
            currentView={view} 
            setView={(v) => { setView(v); setIsSidebarOpen(false); }}
            sessions={sessions} 
            activeSessionId={activeSessionId || ''} 
            onSelectSession={(id) => { setActiveSessionId(id); setIsSidebarOpen(false); }}
            onDeleteSession={id => setSessions(s => s.filter(x => x.id !== id))} 
            onNewChat={() => { handleNewChat(); setIsSidebarOpen(false); }}
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            appSettings={appSettings} 
          />
        </aside>

        {/* OVERLAY FOR MOBILE SIDEBAR */}
        {isSidebarOpen && (
           <div className="fixed inset-0 bg-black/80 z-[150] md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0 relative bg-[#050508] h-full overflow-hidden">
          {view === ViewMode.DASHBOARD && <Dashboard setView={setView} appSettings={appSettings} onUpdateSettings={setAppSettings} onNewChat={handleNewChat} onNewProject={() => setShowProjectModal(true)} onOpenMenu={() => setIsSidebarOpen(true)} onOpenLegal={type => setLegalModal({ isOpen: true, type })} />}
          {view === ViewMode.CHAT && <ChatArea session={currentSession} setView={setView} onNewChat={handleNewChat} onUpdateSession={u => setSessions(s => s.map(x => x.id === u.id ? u : x))} appSettings={appSettings} onUpdateSettings={setAppSettings} apiConfigs={[]} onOpenMenu={() => setIsSidebarOpen(true)} />}
          {view === ViewMode.DOC_ANALYSIS && <DocumentAnalyzer onBack={() => setView(ViewMode.DASHBOARD)} appSettings={appSettings} />}
          {view === ViewMode.VOICE && <VoiceInterface onBack={() => setView(ViewMode.DASHBOARD)} appSettings={appSettings} onSaveAsChat={h => handleNewChat(h.map(x => `${x.role === 'user' ? 'אתה' : 'פנדה'}: ${x.text}`).join('\n'), 'שיחה קולית')} />}
          {view === ViewMode.IMAGE_GEN && <ImageGenerator setView={setView} appSettings={appSettings} />}
          {view === ViewMode.PROMPT_LAB && <PromptCowboy onBack={() => setView(ViewMode.DASHBOARD)} onTestPrompt={handleNewChat} appSettings={appSettings} />}
          {view === ViewMode.MESSAGE_GEN && <MessageMaster onBack={() => setView(ViewMode.DASHBOARD)} appSettings={appSettings} />}
          {view === ViewMode.TEMPLATES && <Templates setView={setView} onSelectPrompt={(p, title) => handleNewChat(p, title)} appSettings={appSettings} />}
          {view === ViewMode.SETTINGS && <Settings settings={appSettings} onUpdate={setAppSettings} onBack={() => setView(ViewMode.DASHBOARD)} onExport={() => {}} onImport={() => {}} onRecover={() => {}} />}
          {view === ViewMode.PROJECT_DASHBOARD && <ProjectDashboard projects={projects} sessions={sessions} onUpdateProject={(p) => setProjects(prev => prev.map(x => x.id === p.id ? p : x))} onDeleteProject={id => setProjects(p => p.filter(x => x.id !== id))} onBack={() => setView(ViewMode.DASHBOARD)} onStartChat={(pid) => handleNewChat('', projects.find(p=>p.id===pid)?.name)} onNewProject={() => setShowProjectModal(true)} appSettings={appSettings} />}
          {view === ViewMode.ADMIN_PANEL && <AdminPanel settings={appSettings} onUpdate={setAppSettings} onBack={() => setView(ViewMode.DASHBOARD)} />}
        </main>

        {showProjectModal && <ProjectCreationModal onClose={() => setShowProjectModal(false)} onCreate={p => { setProjects([...projects, p]); setShowProjectModal(false); }} />}
        
        {/* LEGAL MODAL - Forced High Z-Index */}
        {legalModal.isOpen && (
          <LegalModal 
            isOpen={legalModal.isOpen} 
            type={legalModal.type} 
            onClose={() => setLegalModal(prev => ({ ...prev, isOpen: false }))} 
            title={legalModal.type === 'terms' ? translations.he.terms : legalModal.type === 'privacy' ? translations.he.privacy : translations.he.accessibility} 
            appSettings={appSettings}
          />
        )}
        
        <ToastContainer toasts={[]} />
      </div>
    </Suspense>
  );
};

export default App;

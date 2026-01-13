
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Dashboard from './components/Dashboard';
import ProjectDashboard from './components/ProjectDashboard';
import VoiceInterface from './components/VoiceInterface';
import ApiHub from './components/ApiHub';
import Settings from './components/Settings';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import PromptCowboy from './components/PromptCowboy';
import MessageMaster from './components/MessageMaster';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import Templates from './components/Templates';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import ProjectCreationModal from './components/ProjectCreationModal';
import CommandPalette from './components/CommandPalette';
import LegalModal from './components/LegalModal';
import TutorialOverlay from './components/TutorialOverlay';
import { ToastContainer, useToast } from './components/Toast';
import { ViewMode, ChatSession, Project, AppSettings, UserRole, APIConfig, PandaPersona, AIModelMode } from './types';
import { translations } from './utils/translations';

// Default Legal Content - Restored Full Versions
const DEFAULT_TERMS = `תנאי שימוש במערכת PandaAi Elite

1. מבוא והגדרות
ברוכים הבאים למערכת PandaAi Elite. השימוש במערכת מעיד על הסכמתך המלאה לתנאים אלו. המערכת מבוססת על מודלים של בינה מלאכותית (Gemini/OpenAI) ומונגשת ככלי עזר טכנולוגי (SaaS).

2. קניין רוחני
כל הזכויות על קוד המקור, העיצוב, הלוגו והממשק שמורות ל-PandaAi Elite Studio. התוצרים שנוצרים על ידי המשתמש (User Generated Content) שייכים למשתמש, בכפוף למדיניות ספקי ה-AI צד ג'.

3. אחריות ושיפוי
השירות ניתן כפי שהוא (AS IS). החברה לא תישא באחריות לכל נזק ישיר או עקיף הנובע משימוש בתוצרים (קוד, טקסט, תמונות) שנוצרו במערכת. באחריות המשתמש לבדוק את התוצרים לפני שימוש מבצעי.

4. שימוש הוגן
אין להשתמש במערכת למטרות לא חוקיות, יצירת תוכן פוגעני, או הנדסה לאחור של המערכת.

5. תשלומים וחיובים
השימוש במודלים מתקדמים (כגון Veo/Gemini Pro) עשוי לדרוש מפתח API אישי בתשלום מול Google/OpenAI.`;

const DEFAULT_PRIVACY = `מדיניות פרטיות - PandaAi Elite

אנו ב-PandaAi Elite מתייחסים לפרטיותך ברצינות רבה.

1. איסוף מידע
המערכת שומרת מידע באופן מקומי (Local Storage) על דפדפן המשתמש. מפתחות API אינם נשמרים בשרתי החברה אלא מוזרקים ישירות לקריאות השרת בצורה מוצפנת.

2. שימוש במידע
המידע שאתה מזין בצ'אט משמש אך ורק לצורך קבלת תשובה מהמודל. איננו מוכרים, משכירים או מעבירים מידע לצד שלישי למטרות שיווקיות.

3. אבטחת מידע
אנו נוקטים באמצעי זהירות מקובלים לאבטחת המידע. עם זאת, במרחב המקוון אין ודאות מוחלטת, והשימוש הינו באחריות המשתמש.

4. זכויות המשתמש
זכותך למחוק את כל ההיסטוריה וההגדרות בכל עת דרך תפריט ההגדרות (כפתור "איפוס מערכת").`;

const DEFAULT_ACCESSIBILITY = `הצהרת נגישות

PandaAi Elite רואה חשיבות עליונה בהנגשת המערכת לכלל האוכלוסייה, כולל אנשים עם מוגבלויות.

1. תקני נגישות
האתר נבנה בהתאם להוראות נגישות תכנים באינטרנט WCAG 2.1 ברמה AA.

2. התאמות שבוצעו
- ניווט מקלדת מלא.
- תמיכה בקוראי מסך.
- ניגודיות צבעים גבוהה (Theme Midnight).
- אפשרות להגדלת פונטים ללא פגיעה במבנה הדף.
- תמיכה בפקודות קוליות.

3. יצירת קשר
במידה ונתקלת בקושי בגלישה, נשמח לקבל פנייה במייל: accessibility@panda-ai.co.il ואנו נטפל בבעיה בהקדם.`;

const App: React.FC = () => {
  // --- State Management ---
  // Check localStorage immediately to initialize state correctly
  const savedRole = localStorage.getItem('panda_user_role');
  const [hasStarted, setHasStarted] = useState<boolean>(!!savedRole);
  
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [apis, setApis] = useState<APIConfig[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'terms' | 'privacy' | 'accessibility' | 'contact' }>({ isOpen: false, type: 'terms' });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const { toasts, showToast } = useToast();

  const [appSettings, setAppSettings] = useState<AppSettings>({
    language: 'he',
    theme: 'midnight',
    enableSearch: true,
    codeExecutionEnabled: false,
    autoSave: true,
    selfReflect: true,
    autonomousAPIs: false,
    uiIntensity: 80,
    voiceName: 'Zephyr',
    voiceTone: 'professional',
    bargeInSensitivity: 0.6,
    userRole: savedRole ? (savedRole as UserRole) : UserRole.BEGINNER,
    userBio: '',
    legalContent: {
      terms: DEFAULT_TERMS,
      privacy: DEFAULT_PRIVACY,
      accessibility: DEFAULT_ACCESSIBILITY,
      contact: 'Contact Info...'
    }
  });

  // --- Derived State ---
  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const activeProject = projects.find(p => p.id === activeProjectId);
  const t = translations[appSettings.language] || translations.he;
  const isRTL = appSettings.language === 'he';

  // --- Effects ---
  useEffect(() => {
    // Check for first time visitor only if not started
    if (!hasStarted) {
        const visited = localStorage.getItem('panda_visited');
        if (!visited) {
          setShowOnboarding(true);
          localStorage.setItem('panda_visited', 'true');
        }
    }

    // Keybind for Command Palette
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hasStarted]);

  // --- Handlers ---
  const handleStart = (role: UserRole) => {
    setAppSettings(prev => ({ ...prev, userRole: role }));
    setHasStarted(true);
    localStorage.setItem('panda_user_role', role); 
    showToast(`${t.welcome}`, 'celebrate');
  };

  const handleNewChat = (initialPrompt?: string, title?: string) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: title || t.newChat,
      messages: initialPrompt ? [{
        id: '1',
        role: 'user',
        content: initialPrompt,
        mode: AIModelMode.STANDARD,
        timestamp: new Date().toISOString()
      }] : [],
      persona: PandaPersona.STRATEGIST,
      lastUpdate: new Date().toISOString(),
      projectId: activeProjectId || undefined
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setView(ViewMode.CHAT);
  };

  const handleUpdateSession = (updated: ChatSession) => {
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleCreateProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
    setShowProjectModal(false);
    showToast(`${t.createProject}: ${project.name}`, 'success');
  };

  const handleCommandAction = (action: any) => {
    setShowCommandPalette(false);
    if (action.type === 'view') setView(action.payload);
    if (action.type === 'chat') handleNewChat();
    if (action.type === 'project') setShowProjectModal(true);
    if (action.type === 'selectProject') {
       setActiveProjectId(action.payload);
       setView(ViewMode.PROJECT_DASHBOARD);
    }
  };

  if (!hasStarted) {
    return <LandingPage onStart={handleStart} appSettings={appSettings} onLanguageChange={(lang) => setAppSettings(p => ({...p, language: lang}))} />;
  }

  return (
    <div className={`flex h-screen bg-[#050508] text-white overflow-hidden font-sans transition-all duration-300 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Sidebar - Positioned based on Direction */}
      <Sidebar 
        currentView={view}
        setView={setView}
        sessions={sessions}
        activeSessionId={activeSessionId || ''}
        onSelectSession={setActiveSessionId}
        onDeleteSession={(id) => setSessions(prev => prev.filter(s => s.id !== id))}
        onTogglePin={(id) => setSessions(prev => prev.map(s => s.id === id ? {...s, isPinned: !s.isPinned} : s))}
        onToggleArchive={(id) => setSessions(prev => prev.map(s => s.id === id ? {...s, isArchived: !s.isArchived} : s))}
        onNewChat={() => handleNewChat()}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        appSettings={appSettings}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-[#050508]">
        
        {/* Mobile Header Trigger - Hidden on CHAT view to avoid overlap with ChatArea's own header */}
        {view !== ViewMode.CHAT && (
          <div className={`md:hidden absolute top-4 z-50 ${isRTL ? 'right-4' : 'left-4'}`}>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/10 rounded-lg">☰</button>
          </div>
        )}

        {view === ViewMode.DASHBOARD && (
          <Dashboard 
            setView={setView} 
            appSettings={appSettings}
            onUpdateSettings={setAppSettings}
            onNewChat={handleNewChat}
            onNewProject={() => setShowProjectModal(true)}
            onOpenMenu={() => setIsSidebarOpen(true)}
            onOpenLegal={(type) => setLegalModal({ isOpen: true, type })}
          />
        )}

        {view === ViewMode.CHAT && (
          <ChatArea 
            session={activeSession}
            project={activeProject || undefined}
            onNewChat={handleNewChat}
            onUpdateSession={handleUpdateSession}
            appSettings={appSettings}
            onUpdateSettings={setAppSettings}
            apiConfigs={apis}
            onOpenMenu={() => setIsSidebarOpen(true)}
          />
        )}

        {view === ViewMode.PROJECT_DASHBOARD && (
          <ProjectDashboard 
             projects={projects}
             project={projects.find(p => p.id === activeProjectId)}
             onUpdateProject={(p) => setProjects(prev => prev.map(proj => proj.id === p.id ? p : proj))}
             onDeleteProject={(id) => {
                setProjects(prev => prev.filter(p => p.id !== id));
                if (activeProjectId === id) setActiveProjectId(null);
             }}
             onBack={() => setActiveProjectId(null)}
             onStartChat={(pid) => { setActiveProjectId(pid); handleNewChat(undefined, `Project: ${projects.find(p => p.id === pid)?.name}`); }}
             onNewProject={() => setShowProjectModal(true)}
             appSettings={appSettings}
          />
        )}

        {view === ViewMode.DOC_ANALYSIS && (
          <DocumentAnalyzer appSettings={appSettings} />
        )}

        {view === ViewMode.API_HUB && (
          <ApiHub 
            apis={apis}
            onAdd={(api) => setApis(prev => [...prev, api])}
            onRemove={(id) => setApis(prev => prev.filter(a => a.id !== id))}
            appSettings={appSettings}
          />
        )}
        
        {view === ViewMode.VOICE && (
           <VoiceInterface 
             appSettings={appSettings}
             onSaveAsChat={(history) => {
                const text = history.map(h => `${h.role}: ${h.text}`).join('\n');
                handleNewChat(`Voice Session Log:\n${text}`, 'Voice Transcription');
             }}
           />
        )}

        {view === ViewMode.IMAGE_GEN && <ImageGenerator appSettings={appSettings} />}
        {view === ViewMode.VIDEO_GEN && <VideoGenerator appSettings={appSettings} />}
        {view === ViewMode.PROMPT_LAB && <PromptCowboy onBack={() => setView(ViewMode.DASHBOARD)} onTestPrompt={(p) => handleNewChat(p, 'Prompt Test')} userRole={appSettings.userRole} appSettings={appSettings} />}
        {view === ViewMode.MESSAGE_GEN && <MessageMaster onBack={() => setView(ViewMode.DASHBOARD)} appSettings={appSettings} />}
        
        {view === ViewMode.TEMPLATES && (
           <Templates onSelectPrompt={(p, title) => handleNewChat(p, title)} appSettings={appSettings} />
        )}

        {view === ViewMode.SETTINGS && (
           <Settings 
             settings={appSettings}
             onUpdate={setAppSettings}
             onBack={() => setView(ViewMode.DASHBOARD)}
             onExport={() => {}}
             onImport={() => {}}
             onRecover={() => {}}
           />
        )}
      </div>

      {/* Modals & Overlays */}
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      {showProjectModal && <ProjectCreationModal onClose={() => setShowProjectModal(false)} onCreate={handleCreateProject} />}
      {showCommandPalette && <CommandPalette onClose={() => setShowCommandPalette(false)} onAction={handleCommandAction} projects={projects} />}
      {legalModal.isOpen && (
        <LegalModal 
          isOpen={legalModal.isOpen} 
          type={legalModal.type} 
          onClose={() => setLegalModal({...legalModal, isOpen: false})} 
          title={legalModal.type.toUpperCase()} 
          content={appSettings.legalContent[legalModal.type] || ''} 
        />
      )}
      {showTutorial && (
        <TutorialOverlay 
           steps={[
             { title: t.welcome, desc: t.dashboard, icon: '🏠' },
             { title: t.newChat, desc: t.chatPlaceholder, icon: '💬' }
           ]} 
           onClose={() => setShowTutorial(false)} 
        />
      )}
      
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default App;

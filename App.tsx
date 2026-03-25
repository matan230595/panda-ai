
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ViewMode } from './types';
import { useUI, useProjects, useChat } from './contexts/AppContext';
import { ToastContainer } from './components/Toast';
import { LOCAL_STORAGE_KEYS } from './utils/constants';

// Lazy Load Components
import { LoadingScreen } from './components/LoadingScreen';

const Sidebar = React.lazy(() => import('./components/Sidebar'));
const ChatArea = React.lazy(() => import('./components/ChatArea'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const ProjectDashboard = React.lazy(() => import('./components/ProjectDashboard'));
const VoiceInterface = React.lazy(() => import('./components/VoiceInterface'));
const Settings = React.lazy(() => import('./components/Settings'));
const ImageGenerator = React.lazy(() => import('./components/ImageGenerator'));
const VideoGenerator = React.lazy(() => import('./components/VideoGenerator'));
const PromptCowboy = React.lazy(() => import('./components/PromptCowboy'));
const MessageMaster = React.lazy(() => import('./components/MessageMaster'));
const DocumentAnalyzer = React.lazy(() => import('./components/DocumentAnalyzer'));
const Templates = React.lazy(() => import('./components/Templates'));
const LegalModal = React.lazy(() => import('./components/LegalModal'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const ApiHub = React.lazy(() => import('./components/ApiHub'));
const Onboarding = React.lazy(() => import('./components/Onboarding'));
const CommandPalette = React.lazy(() => import('./components/CommandPalette'));
const PandaCoder = React.lazy(() => import('./components/PandaCoder'));
const Academy = React.lazy(() => import('./components/Academy'));

const App: React.FC = () => {
  const { view, setView, isSidebarOpen, setIsSidebarOpen, legalModal, toasts, showToast } = useUI();
  const { projects } = useProjects();
  const { newChat } = useChat();
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem(LOCAL_STORAGE_KEYS.ONBOARDING) === 'true';
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handleOnboardingComplete = () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ONBOARDING, 'true');
    setShowOnboarding(false);
  };

  const handleCommandAction = (action: any) => {
    setShowPalette(false);
    switch(action.type) {
      case 'view':
        setView(action.payload);
        break;
      case 'chat':
        newChat();
        setView(ViewMode.CHAT);
        break;
      case 'project':
        setView(ViewMode.PROJECT_DASHBOARD);
        showToast('נווט אל מרכז הפרויקטים ליצירת פרויקט חדש', 'info');
        break;
      case 'selectProject':
        setView(ViewMode.PROJECT_DASHBOARD);
        showToast(`ניווט לפרויקטים. החלפת קונטקסט תתווסף בקרוב!`, 'info');
        break;
      default:
        break;
    }
  };

  if (showOnboarding) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Onboarding onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#050508] font-['Heebo']">
      <Suspense fallback={<LoadingScreen />}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} isOpen={isSidebarOpen} />
      </Suspense>
      <main className="flex-1 flex flex-col h-full min-w-0">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatArea />} />
            <Route path="/projects" element={<ProjectDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/image-gen" element={<ImageGenerator />} />
            <Route path="/video-gen" element={<VideoGenerator />} />
            <Route path="/prompt" element={<PromptCowboy />} />
            <Route path="/message-gen" element={<MessageMaster />} />
            <Route path="/docs" element={<DocumentAnalyzer />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/api-hub" element={<ApiHub />} />
            <Route path="/coder" element={<PandaCoder />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/voice" element={<VoiceInterface />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      
      <ToastContainer toasts={toasts} />
      
      <Suspense fallback={<LoadingScreen />}>
        {legalModal.isOpen && <LegalModal />}
        {showPalette && <CommandPalette onClose={() => setShowPalette(false)} onAction={handleCommandAction} projects={projects} />}
      </Suspense>
    </div>
  );
};

export default App;
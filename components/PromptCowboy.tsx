
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  generateClarifyingQuestions, 
  generateInitialCowboyPrompt, 
  refineCowboyPrompt,
  critiquePrompt,
  magicEnhancePrompt,
  chatRefinePrompt
} from '../services/gemini';
import { ViewMode, ClarifyingQuestion, SavedPrompt } from '../types';
import { useUI, useChat, usePrompts, useAppSettings, useApi } from '../contexts/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { translations } from '../utils/translations';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { PandaAvatar } from './PandaAvatar';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { 
  Sparkles, Wand2, Copy, Save, MessageSquare, RotateCcw, 
  ChevronDown, ChevronUp, Check, Target, Users, FileText, 
  Zap, Shield, Info, X, Send, History, Layers, Download, Edit3,
  AlignLeft, Settings2, HelpCircle, Eye, PenTool, Trash2, Plus,
  Monitor, AlertCircle, BookOpen, Cpu, BarChart3, Terminal,
  GripVertical, Upload, LayoutTemplate
} from 'lucide-react';

const PROMPT_PRESETS = [
  {
    id: 'developer',
    name: 'מתכנת סניור',
    icon: <Terminal size={16} />,
    components: {
      persona: 'אתה מתכנת סניור עם 15 שנות ניסיון בפיתוח מערכות מורכבות, מתמחה ב-React ו-Node.js.',
      situation: 'אני בונה אפליקציית ווב חדשה שדורשת ביצועים גבוהים וסקלביליות.',
      task: 'כתוב לי ארכיטקטורה מומלצת לפרויקט, כולל ספריות מומלצות ודפוסי עיצוב.',
      objective: 'לקבל תוכנית עבודה ברורה ומוכנה ליישום עבור הפרויקט.',
      knowledge: 'השתמש ב-Best Practices עדכניים ל-2024.',
      examples: 'למשל: שימוש ב-Zustand לניהול מצב, React Query לשליפת נתונים.',
      format: 'הצג את התשובה בפורמט של מסמך טכני מקצועי עם דוגמאות קוד ב-Markdown.',
      qa: 'האם הארכיטקטורה שהצעת באמת סקיילבילית וקלה לתחזוקה?',
      negative: 'אל תשתמש בספריות מיושנות כמו Redux (אלא אם יש סיבה מוצדקת), הימנע מקוד מסורבל.'
    }
  },
  {
    id: 'copywriter',
    name: 'קופירייטר שיווקי',
    icon: <PenTool size={16} />,
    components: {
      persona: 'אתה קופירייטר שיווקי מבריק שעובד במשרד פרסום מוביל, מומחה בכתיבה המניעה לפעולה (Direct Response).',
      situation: 'אנחנו משיקים קורס דיגיטלי חדש בנושא בינה מלאכותית למתחילים.',
      task: 'כתוב 3 הצעות שונות למודעות פייסבוק שיגרמו לאנשים להקליק ולהירשם לוובינר חינמי.',
      objective: 'להשיג כמה שיותר הרשמות לוובינר בעלות הנמוכה ביותר לליד (CPL).',
      knowledge: 'קהל היעד הוא אנשים בני 25-45 שרוצים להתקדם בקריירה אבל חוששים שה-AI יחליף אותם.',
      examples: 'כותרת לדוגמה: "ה-AI לא יחליף אותך, אבל מישהו שיודע להשתמש ב-AI כן."',
      format: 'הצג כל מודעה עם כותרת, גוף טקסט, וקריאה לפעולה (CTA).',
      qa: 'האם המודעה באמת יוצרת רגש וגורמת לפעולה מיידית?',
      negative: 'הגבל כל מודעה ל-150 מילים מקסימום. אל תישמע מכירתי מדי או "ספאמי".'
    }
  },
  {
    id: 'analyst',
    name: 'מנתח נתונים',
    icon: <BarChart3 size={16} />,
    components: {
      persona: 'אתה מנתח נתונים (Data Analyst) בכיר עם מומחיות בסטטיסטיקה והסקת מסקנות עסקיות.',
      situation: 'יש לי קובץ נתונים של מכירות מהרבעון האחרון שמראה ירידה של 15% בהכנסות.',
      task: 'נתח את הסיבות האפשריות לירידה והצע 5 שאלות מחקר שכדאי לי לבדוק בנתונים כדי למצוא את הבעיה.',
      objective: 'לזהות את צוואר הבקבוק או הבעיה המרכזית שגרמה לירידה במכירות.',
      knowledge: 'החברה מוכרת מוצרי תוכנה (SaaS) לעסקים קטנים (B2B).',
      examples: 'למשל: "האם הירידה נובעת מנטישת לקוחות קיימים (Churn) או מירידה בהצטרפות לקוחות חדשים?"',
      format: 'רשימה ממוספרת של שאלות מחקר, עם הסבר קצר למה כל שאלה חשובה ואיך לבדוק אותה.',
      qa: 'האם השאלות שהצעת ניתנות למדידה ובדיקה אמפירית?',
      negative: 'הימנע מהשערות חסרות בסיס, התמקד רק במה שניתן למדוד ולהוכיח.'
    }
  }
];

const keyTranslations: { [key: string]: { title: string, icon: React.ReactNode, desc: string } } = {
  persona: { title: 'פרסונה ותפקיד', icon: <Users size={18} />, desc: 'מי ה-AI צריך להיות?' },
  situation: { title: 'הקשר ורקע', icon: <FileText size={18} />, desc: 'מה הסיטואציה או רקע למשימה?' },
  task: { title: 'המשימה המרכזית', icon: <Target size={18} />, desc: 'מה בדיוק ה-AI צריך לעשות?' },
  objective: { title: 'מטרה ויעדים', icon: <Sparkles size={18} />, desc: 'מה התוצאה הסופית הרצויה?' },
  knowledge: { title: 'ידע ואילוצים', icon: <AlignLeft size={18} />, desc: 'אילו חוקים או מידע ספציפי יש לשלב?' },
  examples: { title: 'דוגמאות', icon: <PenTool size={18} />, desc: 'דוגמאות לסגנון או לתוצאה הרצויה' },
  format: { title: 'פורמט פלט', icon: <Settings2 size={18} />, desc: 'איך התשובה צריכה להיות מוצגת?' },
  qa: { title: 'בקרת איכות', icon: <HelpCircle size={18} />, desc: 'שאלת וידוא שה-AI ישאל את עצמו' },
  negative: { title: 'מה להימנע', icon: <AlertCircle size={18} />, desc: 'מה ה-AI אסור לו לעשות?' }
};

interface PromptComponents {
  persona: string;
  situation: string;
  task: string;
  objective: string;
  knowledge: string;
  examples: string;
  format: string;
  qa: string;
  negative?: string;
}

function useLocalStorageState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item);
        if (parsed !== null) return parsed;
      }
      return defaultValue;
    } catch (error) {
      console.error(error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      if (state === undefined || state === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, state]);

  return [state, setState];
}

const DraggableComponentItem = ({ 
  itemKey, 
  value, 
  meta, 
  isExpanded, 
  setExpandedSection, 
  handleMagicEnhance, 
  enhancingKey, 
  handleComponentChange, 
  t 
}: any) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item 
      key={itemKey}
      value={itemKey}
      dragListener={false}
      dragControls={dragControls}
      className={`border rounded-2xl overflow-hidden transition-colors ${isExpanded ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10 bg-black/40 hover:border-white/20'}`}
    >
      <div 
        className="w-full flex items-center justify-between p-4 text-right bg-transparent focus:outline-none focus:bg-white/5"
      >
        <div className="flex items-center gap-3">
          <div 
            className="cursor-grab active:cursor-grabbing p-1 text-zinc-600 hover:text-zinc-300 transition-colors" 
            title="גרור לשינוי סדר"
            onPointerDown={(e) => dragControls.start(e)}
            style={{ touchAction: "none" }}
          >
            <GripVertical size={18} />
          </div>
          <div 
            className={`p-2 rounded-lg cursor-pointer ${isExpanded ? 'bg-orange-500/20 text-orange-500' : 'bg-white/5 text-zinc-400'}`}
            onClick={() => setExpandedSection(isExpanded ? null : itemKey)}
          >
            {meta.icon}
          </div>
          <div className="text-right cursor-pointer" onClick={() => setExpandedSection(isExpanded ? null : itemKey)}>
            <h4 className={`font-bold text-sm ${isExpanded ? 'text-white' : 'text-zinc-300'}`}>{meta.title}</h4>
            {!isExpanded && <p className="text-xs text-zinc-500 truncate max-w-[150px] sm:max-w-xs">{value as string}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleMagicEnhance(itemKey); }}
              disabled={enhancingKey === itemKey}
              className="p-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg transition-all"
              title={t.promptMagicEnhance}
            >
              {enhancingKey === itemKey ? <RotateCcw size={14} className="animate-spin" /> : <Wand2 size={14} />}
            </button>
          )}
          <div 
            className="text-zinc-500 cursor-pointer p-1"
            onClick={() => setExpandedSection(isExpanded ? null : itemKey)}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <p className="text-[10px] text-orange-400 mb-2 font-medium">{meta.desc}</p>
            <textarea
              value={value as string}
              onChange={(e) => handleComponentChange(itemKey, e.target.value)}
              className="w-full bg-black/60 border border-white/10 focus:border-orange-500/50 rounded-xl p-3 text-zinc-200 text-sm outline-none transition-all resize-y min-h-[100px] custom-scrollbar leading-relaxed"
              dir="rtl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
};

const PromptCowboy: React.FC = () => {
  const { setView, showToast } = useUI();
  const { newChat } = useChat();
  const { savePrompt, savedPrompts: prompts } = usePrompts();
  const { appSettings } = useAppSettings();
  const { apiConfigs } = useApi();
  const t = translations[appSettings.language === 'he' ? 'he' : 'he'];

  const [step, setStep] = useLocalStorageState<'initial' | 'builder'>('pc_step', 'initial');
  const [mode, setMode] = useLocalStorageState<'quick' | 'engineering'>('pc_mode', 'quick');
  const [lazyPrompt, setLazyPrompt] = useLocalStorageState('pc_lazyPrompt', '');
  
  const [components, setComponents] = useLocalStorageState<PromptComponents | null>('pc_components', null);
  const [questions, setQuestions] = useLocalStorageState<ClarifyingQuestion[]>('pc_questions', []);
  const [answers, setAnswers] = useLocalStorageState<Record<number, string>>('pc_answers', {});
  
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [enhancingKey, setEnhancingKey] = useState<string | null>(null);
  const [critique, setCritique] = useLocalStorageState<any | null>('pc_critique', null);
  const [isCritiquing, setIsCritiquing] = useState(false);
  
  // Advanced Settings
  const [speakingStyle, setSpeakingStyle] = useLocalStorageState('pc_speakingStyle', 'מקצועי');
  const [writingStyle, setWritingStyle] = useLocalStorageState('pc_writingStyle', 'ברור');
  const [targetAudience, setTargetAudience] = useLocalStorageState('pc_targetAudience', 'כללי');
  const [outputFormat, setOutputFormat] = useLocalStorageState('pc_outputFormat', 'טקסט חופשי');
  const [length, setLength] = useLocalStorageState('pc_length', 'בינוני');
  const [modelPreset, setModelPreset] = useLocalStorageState('pc_modelPreset', 'Gemini 1.5 Pro');

  const [activeTab, setActiveTab] = useLocalStorageState<'preview' | 'components'>('pc_activeTab', 'preview');
  const [expandedSection, setExpandedSection] = useLocalStorageState<string | null>('pc_expandedSection', 'task');
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!key) {
      setApiKeyMissing(true);
    }
  }, []);

  // New State for "Maximum Upgrade"
  const [history, setHistory] = useLocalStorageState<PromptComponents[]>('pc_history', []);
  const [componentOrder, setComponentOrder] = useLocalStorageState<string[]>('pc_componentOrder', [
    'persona', 'situation', 'task', 'objective', 'knowledge', 'examples', 'format', 'qa', 'negative'
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowSaveModal(true);
      }
      // Ctrl/Cmd + C to Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        // Only if no text is selected to avoid overriding normal copy
        if (!window.getSelection()?.toString()) {
          e.preventDefault();
          handleCopy();
        }
      }
      // Ctrl/Cmd + Z to Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        // Only if not inside an input
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          undoLast();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, components]); // dependencies needed for handleCopy and undoLast

  // Click outside listener for templates dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templatesRef.current && !templatesRef.current.contains(event.target as Node)) {
        setShowTemplates(false);
      }
    };
    if (showTemplates) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTemplates]);

  // Sync componentOrder with components keys
  useEffect(() => {
    if (components) {
      const keys = Object.keys(components);
      const newOrder = [...componentOrder];
      let changed = false;
      keys.forEach(k => {
        if (!newOrder.includes(k)) {
          newOrder.push(k);
          changed = true;
        }
      });
      if (changed) setComponentOrder(newOrder);
    }
  }, [components]);

  const speakingStyles = ['מקצועי', 'הומוריסטי', 'יצירתי', 'ידידותי', 'סמכותי', 'אמפתי', 'ציני', 'רשמי'];
  const writingStyles = ['ברור', 'מפורט', 'תמציתי', 'שיווקי', 'אקדמי', 'סיפורי', 'טכני', 'פואטי'];
  const audiences = ['כללי', 'ילדים', 'בני נוער', 'מומחים', 'מתחילים', 'לקוחות', 'משקיעים', 'מפתחים'];
  const formats = ['טקסט חופשי', 'נקודות (Bullet points)', 'טבלה', 'קוד', 'מאמר', 'פוסט לרשתות חברתיות', 'תסריט', 'מייל'];
  const lengths = ['קצר (עד פסקה)', 'בינוני (2-3 פסקאות)', 'ארוך (מאמר שלם)', 'מפורט מאוד (מדריך מקיף)'];
  const modelPresets = ['Gemini 1.5 Pro', 'GPT-4o', 'Claude 3.5 Sonnet', 'Llama 3 (Groq)'];

  const examplePrompts = [
      'כתוב לי תסריט לסרטון טיקטוק על ניהול זמן',
      'סכם לי את המאמר הזה על בינה מלאכותית',
      'צור תוכנית אימונים למתחילים בחדר כושר',
      'כתוב פוסט לינקדאין על השקת מוצר חדש'
  ];

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  
  const saveModalRef = useFocusTrap<HTMLDivElement>();

  const radarData = useMemo(() => {
    if (!critique?.dna) return [];
    return [
      { subject: t.promptClarity, A: critique.dna.clarity * 10, fullMark: 100 },
      { subject: t.promptContext, A: critique.dna.context * 10, fullMark: 100 },
      { subject: t.promptPersona, A: critique.dna.persona * 10, fullMark: 100 },
      { subject: t.promptConstraints, A: critique.dna.constraints * 10, fullMark: 100 },
    ];
  }, [critique, t]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && activeTab === 'components') {
        setActiveTab('preview');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  const handleQuickUpgrade = async () => {
    if (!lazyPrompt.trim()) return;
    setLoading(true);
    setMode('quick');
    setLoadingMessage("בונה עבורך פרומפט מושלם בשניות...");
    try {
      const promptData = await generateInitialCowboyPrompt(lazyPrompt, apiConfigs);
      setComponents(promptData as PromptComponents);
      setQuestions([]); // No questions in quick mode
      setStep('builder');
      setActiveTab('preview');
      showToast("הפרומפט מוכן! תוכל לערוך אותו או לעבור למצב הנדסה עמוקה.", "success");
    } catch (e: any) {
      showToast(e.message || "שגיאה בבניית הפרומפט. נסה שוב.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEngineering = async () => {
    if (!lazyPrompt.trim()) return;
    setLoading(true);
    setMode('engineering');
    setLoadingMessage("מנתח את הבקשה ובונה שלד מקצועי...");
    try {
      const [promptData, questionsData] = await Promise.all([
        generateInitialCowboyPrompt(lazyPrompt, apiConfigs),
        generateClarifyingQuestions(lazyPrompt, apiConfigs),
      ]);
      setComponents(promptData as PromptComponents);
      setQuestions(questionsData);
      setStep('builder');
      setActiveTab('components');
    } catch (e: any) {
      showToast(e.message || "שגיאה בניתוח הבקשה. נסה לנסח אחרת.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefinePrompt = async () => {
    if (!components) return;
    setLoading(true);
    setLoadingMessage("משכלל את הפרומפט בעזרת ההגדרות שלך...");
    const answeredQuestions = questions.map((q, i) => {
      const answer = answers[i]?.trim() || q.answers[0];
      return { question: q.question, answer };
    });
    try {
      setHistory(prev => [components, ...prev].slice(0, 10));
      const result = await refineCowboyPrompt(
        components, 
        answeredQuestions, 
        speakingStyle, 
        writingStyle,
        targetAudience,
        outputFormat,
        length,
        apiConfigs
      );
      setComponents(result as PromptComponents);
      setActiveTab('preview');
      showToast("הפרומפט שודרג בהצלחה!", "success");
      handleCritique(result);
    } catch (e: any) {
      showToast(e.message || "שגיאה בשדרוג הפרומפט. נסה שוב.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChatRefine = async () => {
    if (!chatInput.trim() || !components) return;
    setIsChatting(true);
    try {
      setHistory(prev => [components, ...prev].slice(0, 10));
      const refined = await chatRefinePrompt(components, chatInput, apiConfigs);
      setComponents(refined as PromptComponents);
      setChatInput('');
      handleCritique(refined);
      showToast("הפרומפט עודכן בהצלחה", "success");
    } catch (error) {
      showToast("שגיאה בעדכון הפרומפט", "error");
    } finally {
      setIsChatting(false);
    }
  };

  const handleCritique = async (comps: any = components) => {
    if (!comps) return;
    setIsCritiquing(true);
    try {
      const result = await critiquePrompt(comps, apiConfigs);
      setCritique(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCritiquing(false);
    }
  };

  const handleMagicEnhance = async (key: keyof PromptComponents) => {
    if (!components) return;
    setEnhancingKey(key);
    try {
      const componentValue = components[key] || '';
      const context = `This is part of a prompt about: ${lazyPrompt}. The full prompt objective is: ${components.objective}`;
      const enhanced = await magicEnhancePrompt(componentValue, context, apiConfigs);
      setHistory(prev => [components, ...prev].slice(0, 10));
      setComponents({ ...components, [key]: enhanced });
      showToast("הסעיף שודרג בקסם!", "success");
    } catch (e) {
      showToast("השדרוג נכשל", "error");
    } finally {
      setEnhancingKey(null);
    }
  };

  const undoLast = () => {
    if (history.length === 0) return;
    const last = history[0];
    setComponents(last);
    setHistory(prev => prev.slice(1));
    handleCritique(last);
    showToast("בוצע ביטול", "info");
  };

  const handleAnswerSelect = (qIndex: number, answer: string) => {
    setAnswers(prev => {
      const currentText = prev[qIndex] || '';
      const parts = currentText ? currentText.split(',').map(p => p.trim()).filter(p => p) : [];
      const answerIndex = parts.indexOf(answer);
      let newParts;
      if (answerIndex > -1) {
        newParts = parts.filter(p => p !== answer);
      } else {
        newParts = [...parts, answer];
      }
      return { ...prev, [qIndex]: newParts.join(', ') };
    });
  };

  const handleCustomAnswer = (qIndex: number, customText: string) => {
    setAnswers(prev => ({ ...prev, [qIndex]: customText }));
  };

  const handleLoadPreset = (preset: typeof PROMPT_PRESETS[0]) => {
    if (components) {
      setHistory(prev => [components, ...prev].slice(0, 10));
    }
    setComponents(preset.components as PromptComponents);
    setShowTemplates(false);
    showToast(`תבנית נטענה: ${preset.name}`, "success");
  };

  const handleComponentChange = (key: keyof PromptComponents, value: string) => {
    if (components) {
      setComponents({ ...components, [key]: value });
    }
  };
  
  const getFullPromptText = () => {
    if (!components) return '';
    
    let modelInstructions = '';
    if (modelPreset === 'Claude 3.5 Sonnet') {
      modelInstructions = "Please wrap your response in XML tags where appropriate for structure.";
    } else if (modelPreset === 'GPT-4o') {
      modelInstructions = "Be extremely concise and follow instructions to the letter.";
    }

    // Chain of Thought instruction
    const cotInstruction = "### הנחיית עבודה (Chain of Thought)\nלפני מתן התשובה הסופית, נתח את הבקשה, תכנן את המבנה, וודא שכל האילוצים מתקיימים. עבוד צעד-אחר-צעד.";

    let text = componentOrder
      .filter(key => components[key as keyof PromptComponents] && components[key as keyof PromptComponents]!.trim() !== '' && key !== 'negative')
      .map(key => `<${key}>\n${components[key as keyof PromptComponents]}\n</${key}>`)
      .join('\n\n');
    
    if (components.negative) {
      text += `\n\n<negative>\n${components.negative}\n</negative>`;
    }

    text = `${cotInstruction}\n\n${text}`;

    if (modelInstructions) {
      text = `[Model Optimization: ${modelPreset}]\n${modelInstructions}\n\n${text}`;
    }
    
    return text;
  };

  const tokenStats = useMemo(() => {
    const text = getFullPromptText();
    const chars = text.length;
    const words = text.split(/\s+/).filter(w => w).length;
    const tokens = Math.ceil(chars / 4); // Rough estimate
    return { chars, words, tokens };
  }, [components, modelPreset]);

  const handleCopy = () => {
    const text = getFullPromptText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("הפרומפט המלא הועתק!", 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSavePrompt = () => {
    if (saveName.trim() && components) {
      savePrompt({ id: Date.now().toString(), name: saveName.trim(), content: components, createdAt: new Date().toISOString() });
      showToast("הפרומפט נשמר בהצלחה!", 'success');
      setShowSaveModal(false);
      setSaveName('');
    }
  };
  
  const handleExportGallery = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prompts));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "panda-ai-prompts.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast("הגלריה יוצאה בהצלחה", "success");
  };

  const handleImportGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedPrompts = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedPrompts)) {
          let importedCount = 0;
          importedPrompts.forEach(p => {
            if (p.id && p.name && p.content) {
              // Avoid duplicates by ID
              if (!prompts.find(existing => existing.id === p.id)) {
                savePrompt(p);
                importedCount++;
              }
            }
          });
          if (importedCount > 0) {
            showToast(`יובאו בהצלחה ${importedCount} פרומפטים`, "success");
          } else {
            showToast("לא נמצאו פרומפטים חדשים לייבוא", "info");
          }
        }
      } catch (err) {
        showToast("שגיאה בייבוא הקובץ", "error");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const resetAll = () => {
    setLazyPrompt('');
    setQuestions([]);
    setAnswers({});
    setComponents(null);
    setStep('initial');
    setHistory([]);
    setCritique(null);
    setExpandedSection('task');
    setActiveTab('preview');
  };

  const renderInitialStep = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-4xl mx-auto mt-4 md:mt-10 px-4"
    >
      {apiKeyMissing && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-3 text-orange-200 text-sm"
        >
          <AlertCircle size={20} className="shrink-0 text-orange-500" />
          <p>
            שים לב: מפתח API לא הוגדר. המערכת עשויה לא לעבוד כראוי. 
            <button onClick={() => setView(ViewMode.API_HUB)} className="underline font-bold mr-1">הגדר מפתח עכשיו</button>
          </p>
        </motion.div>
      )}
      <div className="glass p-6 md:p-16 rounded-[2rem] md:rounded-[3rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent space-y-8 md:space-y-10 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 space-y-4 md:space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-400/20 to-orange-600/20 text-orange-500 text-3xl md:text-5xl mb-2 shadow-[0_0_50px_rgba(249,115,22,0.2)] border border-orange-500/30"
          >
            <PandaAvatar size={window.innerWidth < 768 ? 20 : 32} />
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Prompt <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Cowboy</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            הפוך כל רעיון פשוט לפרומפט מקצועי, מדויק ועוצמתי בשניות.
          </p>
        </div>

        <div className="relative z-10 bg-black/40 p-1 md:p-2 rounded-2xl md:rounded-3xl border border-white/10 backdrop-blur-md shadow-inner">
          <textarea 
            value={lazyPrompt} 
            onChange={e => setLazyPrompt(e.target.value)} 
            placeholder="מה תרצה שה-AI יעשה עבורך? (לדוגמה: 'כתוב לי פוסט ויראלי ללינקדאין על בינה מלאכותית')" 
            className="w-full bg-transparent text-lg md:text-2xl font-medium text-white outline-none h-32 md:h-40 resize-none placeholder-zinc-600 p-4 md:p-6 leading-relaxed text-right custom-scrollbar"
            dir="rtl"
          />
          <div className="flex flex-col md:flex-row justify-end items-center gap-3 p-2">
            <button 
              onClick={handleStartEngineering} 
              disabled={!lazyPrompt.trim() || loading} 
              className="w-full md:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-base rounded-xl border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              <span>הנדסה עמוקה</span>
              <Cpu size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
            </button>
            <button 
              onClick={handleQuickUpgrade} 
              disabled={!lazyPrompt.trim() || loading} 
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold text-lg rounded-xl md:rounded-2xl shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              <span>שדרוג מהיר</span>
              <Zap size={20} className="group-hover:scale-125 transition-transform" />
            </button>
          </div>
        </div>

        <div className="relative z-10 pt-2 md:pt-4 space-y-3 md:space-y-4">
            <p className="text-[10px] md:text-sm font-medium text-zinc-500 uppercase tracking-widest">או בחר דוגמה להתחלה מהירה</p>
            <div className="flex gap-2 md:gap-3 justify-center flex-wrap">
                {examplePrompts.map((p, i) => (
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={p} 
                    onClick={() => setLazyPrompt(p)} 
                    className="px-3 py-1.5 md:px-5 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs md:text-sm font-medium text-zinc-300 hover:text-white transition-all hover:scale-105 active:scale-95"
                  >
                    {p}
                  </motion.button>
                ))}
            </div>
        </div>
      </div>
    </motion.div>
  );

  const [showGallery, setShowGallery] = useState(false);

  const renderGalleryModal = () => (
    <AnimatePresence>
      {showGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setShowGallery(false)} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="relative w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <BookOpen size={20} className="text-orange-500" />
                ספריית הפרומפטים שלי
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={handleExportGallery} className="p-2 text-zinc-400 hover:text-orange-500 rounded-lg hover:bg-white/5 transition-colors" title="ייצוא גלריה" aria-label="ייצוא גלריה">
                  <Download size={18} />
                </button>
                <label className="p-2 text-zinc-400 hover:text-orange-500 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" title="ייבוא גלריה" aria-label="ייבוא גלריה">
                  <Upload size={18} />
                  <input type="file" accept=".json" className="hidden" onChange={handleImportGallery} />
                </label>
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                <button onClick={() => setShowGallery(false)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors" aria-label="סגור גלריה">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 gap-3">
                {prompts.length > 0 ? prompts.map((p: SavedPrompt) => (
                  <button 
                    key={p.id}
                    onClick={() => {
                      setComponents(p.content as PromptComponents);
                      setLazyPrompt(p.name);
                      setActiveTab('preview');
                      setShowGallery(false);
                      showToast(`נטען: ${p.name}`, "info");
                    }}
                    className="bg-white/5 border border-white/5 p-4 rounded-2xl text-right hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <h6 className="font-bold text-white group-hover:text-orange-500 transition-colors">{p.name}</h6>
                      <span className="text-[10px] text-zinc-600">{new Date(p.createdAt).toLocaleDateString('he-IL')}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 truncate">{(p.content as any).task || 'ללא תיאור'}</p>
                  </button>
                )) : (
                  <div className="text-center py-12 space-y-4 opacity-40">
                    <Layers size={48} className="mx-auto text-zinc-600" />
                    <p className="text-zinc-500 italic">אין פרומפטים שמורים עדיין. שמור את היצירות שלך כדי לראות אותן כאן.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderBuilderStep = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col lg:flex-row gap-6 w-full pb-20 lg:pb-0 lg:h-full lg:overflow-hidden"
    >
      {/* Left Column: Components & Questions */}
      <div className={`w-full lg:w-1/3 flex flex-col gap-4 lg:h-full order-2 lg:order-1 ${activeTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="glass rounded-3xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-xl flex flex-col lg:h-full shadow-2xl">
          <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                <PenTool size={18} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-white">בניית הפרומפט</h3>
                <p className="text-[10px] text-zinc-400">ערוך את החלקים השונים</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mode === 'quick' && (
                <button 
                  onClick={handleStartEngineering}
                  className="px-3 py-1.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded-lg border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all hidden sm:flex items-center gap-1"
                >
                  <Cpu size={12} />
                  מצב הנדסה
                </button>
              )}
              <div className="relative" ref={templatesRef}>
                <button onClick={() => setShowTemplates(!showTemplates)} className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white" title="תבניות מוכנות" aria-label="תבניות מוכנות">
                  <LayoutTemplate size={18} />
                </button>
                <AnimatePresence>
                  {showTemplates && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                        <h4 className="text-sm font-bold text-white">תבניות מוכנות</h4>
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        {PROMPT_PRESETS.map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => handleLoadPreset(preset)}
                            className="flex items-center gap-3 w-full text-right p-3 rounded-lg hover:bg-white/5 transition-colors group"
                          >
                            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors">
                              {preset.icon}
                            </div>
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={() => setShowGallery(true)} className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white" title="הפרומפטים שלי" aria-label="הפרומפטים שלי">
                <BookOpen size={18} />
              </button>
              <button onClick={() => setActiveTab('preview')} className="lg:hidden p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white" aria-label="הצג תצוגה מקדימה">
                <Eye size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {questions.length > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-orange-500 font-bold">
                  <HelpCircle size={18} />
                  <h4>שאלות מיקוד</h4>
                </div>
                {questions.map((q, i) => (
                  <div key={i} className="space-y-3 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                    <label className="font-bold text-sm text-white block">
                      {q.question}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {q.answers.map(ans => {
                        const isSelected = (answers[i] || '').split(', ').includes(ans);
                        return (
                          <button 
                            key={ans} 
                            onClick={() => handleAnswerSelect(i, ans)} 
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-all flex items-center gap-1.5 ${isSelected ? 'bg-orange-500 border-orange-400 text-white' : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'}`}
                          >
                            {isSelected && <Check size={12} />}
                            {ans}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      placeholder="תשובה חופשית..."
                      value={answers[i] || ''}
                      onChange={(e) => handleCustomAnswer(i, e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-lg p-2.5 text-white text-xs outline-none focus:border-orange-500 transition-all mt-2"
                    />
                  </div>
                ))}
                <button 
                  onClick={handleRefinePrompt} 
                  disabled={loading}
                  className="w-full py-3 bg-orange-500/20 text-orange-500 font-bold text-sm rounded-xl hover:bg-orange-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RotateCcw size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  <span>שדרג פרומפט עם התשובות</span>
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-300 font-bold">
                <Layers size={18} />
                <h4>מרכיבים</h4>
              </div>
              <AnimatePresence>
                {components && (
                  <Reorder.Group 
                    axis="y" 
                    values={componentOrder.filter(key => key !== 'negative' && components[key as keyof PromptComponents] !== undefined)} 
                    onReorder={(newOrder) => {
                      const hidden = componentOrder.filter(key => key === 'negative' || components[key as keyof PromptComponents] === undefined);
                      setComponentOrder([...newOrder, ...hidden]);
                    }} 
                    className="flex flex-col gap-3"
                  >
                    {componentOrder.filter(key => key !== 'negative' && components[key as keyof PromptComponents] !== undefined).map((key) => {
                      const value = components[key as keyof PromptComponents];
                      const meta = keyTranslations[key] || { title: key, icon: <Sparkles size={18}/>, desc: '' };
                      const isExpanded = expandedSection === key;
                      
                      return (
                        <DraggableComponentItem
                          key={key}
                          itemKey={key}
                          value={value}
                          meta={meta}
                          isExpanded={isExpanded}
                          setExpandedSection={setExpandedSection}
                          handleMagicEnhance={handleMagicEnhance}
                          enhancingKey={enhancingKey}
                          handleComponentChange={handleComponentChange}
                          t={t}
                        />
                      );
                    })}
                  </Reorder.Group>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Preview & Chat */}
      <div className={`w-full lg:w-2/3 flex flex-col lg:h-full order-1 lg:order-2 ${activeTab === 'components' ? 'hidden lg:flex' : 'flex'}`}>
        <div className="glass rounded-3xl border border-white/10 bg-[#050508]/90 backdrop-blur-xl flex flex-col lg:h-full shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Eye size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">תצוגה מקדימה</h3>
                <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mt-1">
                  <span>{tokenStats.tokens} Tokens</span>
                  <div className="w-px h-3 bg-white/10"></div>
                  <span>{tokenStats.words} Words</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveTab('components')} className="lg:hidden p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white" aria-label="הצג רכיבים">
                <PenTool size={18} />
              </button>
              <button onClick={undoLast} disabled={history.length === 0} className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 transition-colors" title="ביטול שינוי אחרון" aria-label="ביטול שינוי אחרון">
                <History size={18} />
              </button>
              <button onClick={() => setShowSaveModal(true)} className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors" title="שמור פרומפט" aria-label="שמור פרומפט">
                <Save size={18} />
              </button>
              <button onClick={handleCopy} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-orange-900/20">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span className="hidden sm:inline">{copied ? 'הועתק!' : 'העתק'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            <div className="relative flex-1 flex flex-col min-h-[300px]">
              <textarea
                readOnly
                value={getFullPromptText()}
                className="w-full flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 md:p-6 text-zinc-200 text-sm md:text-base leading-relaxed resize-none outline-none focus:border-orange-500/30 transition-colors custom-scrollbar"
                dir="rtl"
              />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button onClick={handleCopy} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all shadow-lg border border-white/10">
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 border-t border-white/5 bg-white/[0.02] shrink-0">
            <div className="relative flex items-center">
              <input 
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChatRefine()}
                placeholder="בקש שיפור (למשל: 'הפוך ליותר מקצועי')..."
                className="w-full bg-black/60 border border-white/10 rounded-xl pr-4 pl-12 py-3 md:py-4 text-xs md:text-sm text-white outline-none focus:border-orange-500 transition-all"
                dir="rtl"
              />
              <button 
                onClick={handleChatRefine}
                disabled={isChatting || !chatInput.trim()}
                className="absolute left-1.5 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all shadow-md"
              >
                {isChatting ? <RotateCcw size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl">
        <button 
          onClick={() => setActiveTab('components')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'components' ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40' : 'text-zinc-400'}`}
        >
          <PenTool size={16} />
          <span>עריכה</span>
        </button>
        <button 
          onClick={() => setActiveTab('preview')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40' : 'text-zinc-400'}`}
        >
          <Eye size={16} />
          <span>תצוגה</span>
        </button>
      </div>
    </motion.div>
  );
  
  return (
    <div className="flex-1 bg-[#050508] p-4 md:p-6 lg:p-8 text-right overflow-y-auto lg:overflow-hidden flex flex-col h-full" dir="rtl" role="main" aria-label="מהנדס פרומפטים">
      <header className="flex justify-between items-center mb-6 shrink-0">
         <div className="flex items-center gap-4">
            <button onClick={() => setView(ViewMode.DASHBOARD)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors" aria-label="חזור ללוח הבקרה">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Prompt <span className="text-orange-500">Cowboy</span> <PandaAvatar size={24} className="mr-2 inline-block" />
              </h2>
            </div>
         </div>
         {step === 'builder' && (
           <button onClick={resetAll} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition-colors" aria-label="התחל מחדש">
             <RotateCcw size={16} />
             התחל מחדש
           </button>
         )}
      </header>

      <div className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          {step === 'initial' ? renderInitialStep() : renderBuilderStep()}
        </AnimatePresence>
      </div>

      {renderGalleryModal()}

      {/* Save Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              ref={saveModalRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem] w-full max-w-md space-y-6 shadow-2xl"
            >
              <h3 className="text-2xl font-black text-white">שמירת פרומפט</h3>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400">שם הפרומפט</label>
                <input 
                  type="text" 
                  value={saveName} 
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="למשל: מחולל פוסטים ללינקדאין"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-orange-500 transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSavePrompt} className="flex-1 py-4 bg-orange-500 text-white font-black rounded-xl hover:bg-orange-600 transition-colors">שמור</button>
                <button onClick={() => setShowSaveModal(false)} className="flex-1 py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">ביטול</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center"><PandaAvatar size={32} /></div>
              </div>
              <p className="text-xl font-black text-white animate-pulse">{loadingMessage}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptCowboy;

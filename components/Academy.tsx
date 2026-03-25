
import React, { useState, useRef, useEffect } from 'react';
import { useUI } from '../contexts/AppContext';
import { ViewMode } from '../types';

const Academy: React.FC = () => {
    const { setView } = useUI();
    const contentRef = useRef<HTMLDivElement>(null);
    const [activeSection, setActiveSection] = useState('intro');

    const sections = {
        intro: { label: 'מבוא', icon: '🌟' },
        concepts: { label: 'מושגי יסוד', icon: '💡' },
        tools: { label: 'סקירת כלים', icon: '🛠️' },
        models: { label: 'מדריך מודלים', icon: '🧠' },
        api: { label: 'מפתחות API', icon: '🔌' },
    };

    const tools = [
        { icon: "💬", title: "מרחב שיחה", desc: "הכלי המרכזי לכל משימה. תומך בשיחה רגילה, חשיבה עמוקה, מחקר עם חיבור לאינטרנט וניתוח תמונות (Vision).", bestFor: "פתרון בעיות, כתיבה, מחקר, סיעור מוחות.", tip: "השתמשו ב'מצב חשיבה' (Thinking) לשאלות מורכבות הדורשות ניתוח רב-שלבי." },
        { icon: "📄", title: "ניתוח מסמכים", desc: "העלו קבצי PDF, תמונות או טקסט וקבלו סיכומים, תרגומים, או חילוץ מידע ספציפי.", bestFor: "ניתוח חוזים, סיכום מאמרים, חילוץ נתונים.", tip: "אחרי ניתוח ראשוני, עברו ללשונית 'שיחה חופשית' כדי לשאול שאלות המשך על המסמכים." },
        { icon: "</>", title: "סטודיו קוד", desc: "סביבת פיתוח אינטראקטיבית. תארו רכיב אינטרנט, והמערכת תכתוב את ה-HTML, CSS ו-JavaScript ותציג לכם תצוגה חיה.", bestFor: "בניית אבות-טיפוס (prototypes), לימוד קוד, יצירת רכיבים במהירות.", tip: "היו ספציפיים בתיאור. למשל: 'צור טופס התחברות מודרני עם אנימציה על כפתור השליחה'." },
        { icon: "🚀", title: "ספריית תבניות", desc: "נקודת פתיחה מוכנה למשימות נפוצות. חוסך זמן ומבטיח פרומפטים איכותיים.", bestFor: "משימות שחוזרות על עצמן כמו כתיבת פוסטים, מיילים, או ניתוחים עסקיים.", tip: "השתמשו בתבנית כבסיס ועשו לה התאמות קטנות לצרכים המדויקים שלכם." },
        { icon: "🎨", title: "סטודיו תמונות", desc: "מחולל תמונות מתקדם התומך ביצירה מטקסט, עם שליטה על סגנון, יחס גובה-רוחב ורזולוציה עד 4K.", bestFor: "יצירת תוכן ויזואלי לשיווק, אמנות קונספט, או כל צורך עיצובי.", tip: "הוסיפו מונחים כמו 'photorealistic', '8k', 'cinematic lighting' כדי לשדרג את איכות התמונה פלאים." },
        { icon: "🎬", title: "הפקת וידאו", desc: "יצירת סרטונים קצרים (עד 7 שניות) מטקסט או מתמונה. דורש חיבור API לפרויקט Google Cloud עם חיוב פעיל.", bestFor: "יצירת סרטונים קצרים לרשתות חברתיות, אנימציות לוגו, או קטעי אווירה.", tip: "התחילו עם תמונה קיימת כדי לתת למודל נקודת פתיחה ויזואלית חזקה יותר." },
        { icon: "🧠", title: "מהנדס פרומפטים", desc: "הכלי הסודי של המקצוענים. הפכו בקשה פשוטה לפרומפט מפלצתי ומפורט במבנה מקצועי, מה שישפר את איכות התוצאה פי 10.", bestFor: "משימות קריטיות הדורשות דיוק מוחלט מהבינה המלאכותית.", tip: "השתמשו בשאלות שהכלי מציע בסוף כדי לדייק עוד יותר את הפרומפט שיצרתם." },
        { icon: "📩", title: "מחולל ההודעות", desc: "כלי אסטרטגי לכתיבת הודעות מבוסס פסיכולוגיה. מקבלים 3 גרסאות עם ניתוח סיכויי הצלחה ותגובה צפויה.", bestFor: "משא ומתן, מיילים חשובים, תגובות ללקוחות, וכל תקשורת שחשוב שתהיה מדויקת.", tip: "שימו לב לניתוח ('Reasoning') של כל גרסה כדי להבין את האסטרטגיה שמאחורי המילים." },
    ];
    
    const models = [
       { provider: 'Google Gemini', name: 'Gemini 3 Flash', strengths: 'מהיר מאוד, יעיל למשימות כלליות', use: 'תשובות מהירות, סיכומים, כתיבת טקסטים פשוטים.' },
       { provider: 'Google Gemini', name: 'Gemini 3 Pro', strengths: 'חזק מאוד, חשיבה רב-שלבית, חיבור לאינטרנט', use: 'מצב "חשיבה עמוקה", מחקר, ניתוח מורכב, כתיבת קוד.' },
       { provider: 'Hugging Face', name: 'Mistral 7B', strengths: 'מודל קוד פתוח מהיר ואיכותי', use: 'אלטרנטיבה מהירה ל-Gemini Flash, מצוין לשיחה כללית.' },
       { provider: 'Hugging Face', name: 'Gemma 7B', strengths: 'מודל קוד פתוח של גוגל, מאוזן היטב', use: 'משימות כתיבה יצירתית ופתרון בעיות כללי.' },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { root: contentRef.current, threshold: 0.5 }
        );

        const currentContentRef = contentRef.current;
        if (currentContentRef) {
            Object.keys(sections).forEach(id => {
                const el = currentContentRef.querySelector(`#${id}`);
                if (el) observer.observe(el);
            });
        }

        return () => {
            if (currentContentRef) {
                Object.keys(sections).forEach(id => {
                    const el = currentContentRef.querySelector(`#${id}`);
                    if (el) observer.unobserve(el);
                });
            }
        };
    }, []);

    const scrollToSection = (id: string) => {
        contentRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="flex-1 flex h-full bg-[#050508] text-right" dir="rtl">
            <aside className="w-64 h-full bg-[#0a0a0c] border-l border-white/10 p-6 space-y-2 hidden md:block">
                <h3 className="text-xl font-black text-white italic px-4 pb-4">🎓 האקדמיה</h3>
                {Object.entries(sections).map(([id, { label, icon }]) => (
                    <button key={id} onClick={() => scrollToSection(id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all ${activeSection === id ? 'bg-orange-600 text-white font-bold' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'}`}>
                        <span>{icon}</span> {label}
                    </button>
                ))}
            </aside>
            <main ref={contentRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-24 pb-20">
                    
                    <section id="intro" className="space-y-6">
                        <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">ברוכים הבאים לאקדמיית <span className="text-orange-600">PandaAI</span></h2>
                        <p className="text-lg text-zinc-400 leading-relaxed border-r-4 border-orange-500/50 pr-6">המטרה שלנו היא לא רק לתת לכם כלי, אלא להפוך אתכם למאסטרים בשימוש בו. כאן תמצאו את כל הידע הדרוש כדי למצות את הפוטנציאל המלא של המערכת, מהבסיס ועד לטכניקות של מקצוענים.</p>
                    </section>

                    <section id="concepts" className="space-y-8">
                        <h2 className="text-4xl font-black text-white italic">מושגי יסוד 💡</h2>
                        <div className="glass p-8 rounded-2xl border border-white/10 space-y-4">
                            <h3 className="text-xl font-bold text-orange-400">מה זה פרומפט (Prompt)?</h3>
                            <p className="text-zinc-300">פרומפט הוא פשוט ההנחיה שאתם נותנים לבינה המלאכותית. ככל שההנחיה תהיה מפורטת, ברורה ועם הקשר רחב יותר, כך התוצאה שתקבלו תהיה איכותית ומדויקת יותר. במקום "כתוב לי פוסט", נסו: "כתוב לי פוסט ללינקדאין באורך 200 מילה על חשיבות ניהול זמן, המיועד למנהלים בדרג ביניים בתעשיית ההייטק".</p>
                        </div>
                         <div className="glass p-8 rounded-2xl border border-white/10 space-y-4">
                            <h3 className="text-xl font-bold text-orange-400">מה זה מפתח API?</h3>
                            <p className="text-zinc-300">חשבו על זה כמו מפתח לדירה. זהו קוד ייחודי שמאפשר למערכת PandaAI לגשת למנועי הבינה המלאכותית (כמו Gemini או מודלים ב-Hugging Face) בשמכם. המערכת שלנו לא שומרת את המפתח בשרתים, הוא נשאר רק אצלכם בדפדפן, מה שמבטיח פרטיות ואבטחה מקסימלית.</p>
                        </div>
                    </section>
                    
                    <section id="tools" className="space-y-8">
                        <h2 className="text-4xl font-black text-white italic">סקירת כלים 🛠️</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {tools.map(tool => (
                             <div key={tool.title} className="glass p-6 rounded-2xl border border-white/10 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{tool.icon}</div>
                                    <h3 className="text-lg font-black text-white">{tool.title}</h3>
                                </div>
                                <p className="text-sm text-zinc-400">{tool.desc}</p>
                                <p className="text-xs text-zinc-500 pt-2 border-t border-white/5"><b className="text-zinc-400">מתאים במיוחד ל:</b> {tool.bestFor}</p>
                                <p className="text-xs text-orange-400/70 bg-orange-900/20 p-2 rounded-lg"><b className="text-orange-400">טיפ למקצוענים:</b> {tool.tip}</p>
                             </div>
                           ))}
                        </div>
                    </section>

                    <section id="models" className="space-y-8">
                        <h2 className="text-4xl font-black text-white italic">מדריך מודלים 🧠</h2>
                        <p className="text-zinc-400">בחירת המודל הנכון היא המפתח לתוצאה מושלמת. לכל מודל יש התמחות שונה.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-zinc-400">
                                <thead className="text-xs text-zinc-400 uppercase bg-white/5">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 rounded-r-lg">ספק</th>
                                        <th scope="col" className="px-6 py-3">שם המודל</th>
                                        <th scope="col" className="px-6 py-3">חוזקות</th>
                                        <th scope="col" className="px-6 py-3 rounded-l-lg">מתי להשתמש?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {models.map(m => (
                                        <tr key={m.name} className="border-b border-white/5">
                                            <td className="px-6 py-4 font-bold text-white">{m.provider}</td>
                                            <td className="px-6 py-4">{m.name}</td>
                                            <td className="px-6 py-4">{m.strengths}</td>
                                            <td className="px-6 py-4">{m.use}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section id="api" className="space-y-8">
                         <h2 className="text-4xl font-black text-white italic">מפתחות API 🔌</h2>
                         <div className="glass p-8 rounded-2xl border border-white/10 space-y-4">
                            <h3 className="text-xl font-bold text-orange-400">למה צריך את זה?</h3>
                            <p className="text-zinc-300">המערכת פועלת ישירות מול ספקיות ה-AI הגדולות. חיבור מפתח אישי מבטיח שהשיחות שלכם פרטיות לחלוטין, מאפשר לכם לנצל תוכניות חינמיות שהספקיות מציעות, ונותן לכם שליטה מלאה על השימוש. כדי להתחיל, עברו ל<button onClick={() => setView(ViewMode.API_HUB)} className="text-orange-400 underline mx-1">מרכז ה-API</button>וחברו את המפתח הראשון שלכם.</p>
                         </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Academy;
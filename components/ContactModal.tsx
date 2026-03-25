
import React, { useState } from 'react';
import { useUI, useAppSettings } from '../contexts/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

const ContactModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { showToast } = useUI();
    const { appSettings } = useAppSettings();
    const modalRef = useFocusTrap<HTMLDivElement>();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const legal = appSettings.legalContent;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) {
            showToast('נא למלא את כל השדות', 'info');
            return;
        }
        // In a real app, this would send the data to a server.
        // For this demo, we'll just show a success message.
        showToast('הודעתך נשלחה בהצלחה!', 'success');
        onClose();
    };
    
    // Construct Google Maps URL from address
    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(legal.address)}`;

    return (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in" dir="rtl" onClick={onClose} role="dialog" aria-labelledby="contact-modal-title" aria-modal="true">
            <div ref={modalRef} className="max-w-xl w-full bg-[#18181b] p-10 rounded-[3rem] border border-white/10 space-y-8 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h3 id="contact-modal-title" className="text-2xl font-black text-white italic">צור קשר</h3>
                    <button onClick={onClose} className="text-2xl text-zinc-500 hover:text-white" aria-label="סגור">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="שם מלא" aria-label="שם מלא" className="w-full bg-white/5 p-3 rounded-lg text-sm" required />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="כתובת מייל" aria-label="כתובת מייל" className="w-full bg-white/5 p-3 rounded-lg text-sm" required />
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="ההודעה שלך..." aria-label="ההודעה שלך" className="w-full bg-white/5 p-3 rounded-lg text-sm h-24 resize-none" required></textarea>
                    <button type="submit" className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl uppercase tracking-widest">שלח הודעה</button>
                </form>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                    <a href={legal.waLink || '#'} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-lg text-center text-sm">WhatsApp</a>
                    <a href={`mailto:${legal.email}`} className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg text-center text-sm">Email</a>
                </div>
                <div className="text-center text-xs text-zinc-400">
                    <p>{legal.address}</p>
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-400">הצג על המפה</a>
                </div>
            </div>
        </div>
    );
};

export default ContactModal;

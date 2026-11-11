import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  Trash2, 
  Sparkles, 
  User, 
  CheckCircle2, 
  Droplets,
  HelpCircle,
  Copy,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export default function AiChatPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    'Quelle quantité d\'eau dois-je utiliser aujourd\'hui ?',
    'Pourquoi ma consommation d\'eau a-t-elle augmenté ?',
    'Comment économiser davantage d\'eau ?',
    'Quand dois-je irriguer mes oliviers ?',
    'Comment interpréter le niveau d\'humidité du sol ?',
    'Comment réduire mes dépenses d\'irrigation ?',
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadChatHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else {
        // Welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Marhaban ${user?.name || ''} ! Je suis **AquaSmart AI**, votre conseiller agronome digital. Je suis connecté aux données réelles de vos parcelles et sondes d'humidité. Posez-moi une question ou cliquez sur une suggestion ci-dessous.`
          }
        ]);
      }
      if (res.suggested_questions) {
        setSuggestedQuestions(res.suggested_questions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    setInputMessage('');

    // Append user message immediately
    const tempUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: text });
      const assistantMsg = {
        id: res.message_id || Date.now().toString(),
        role: 'assistant',
        content: res.reply,
        created_at: res.created_at || new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Désolé, une erreur réseau est survenue lors de l'analyse agronomique. Veuillez réessayer.",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Voulez-vous effacer l\'historique de la conversation ?')) return;
    try {
      await api.delete('/ai/history');
      setMessages([
        {
          id: 'welcome_reset',
          role: 'assistant',
          content: "Conversation réinitialisée. Comment puis-je vous aider pour vos cultures aujourd'hui ?"
        }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleVoiceRecording = () => {
    setIsRecording(prev => !prev);
    if (!isRecording) {
      // Simulate voice capture prompt
      setTimeout(() => {
        setIsRecording(false);
        setInputMessage("Quelle quantité d'eau pour mes tomates aujourd'hui ?");
      }, 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>AquaSmart AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Conseiller agronomique spécialisé au Maroc (INRA / ONCA / FAO-56)
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-xs flex items-center gap-1"
          title="Effacer la conversation"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Effacer</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-6 py-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Suggestions :</span>
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md shadow-emerald-600/10'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200/50 dark:border-slate-700/50'
              }`}
            >
              <div className="whitespace-pre-line prose-xs dark:prose-invert">
                {msg.content}
              </div>
              <span className={`text-[9px] block mt-2 ${msg.role === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Maintenant'}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-3xl rounded-tl-sm bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                AquaSmart AI analyse vos données de sol et météo...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar (Matching Mockup with Mic button) */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-3 rounded-2xl transition ${
              isRecording 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600'
            }`}
            title="Entrée vocale"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Posez votre question agronomique (ex: Quelle quantité d'eau pour mes tomates ?)..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
}

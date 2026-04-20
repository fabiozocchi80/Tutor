/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, PlusCircle, Trash2, ArrowRight, BrainCircuit, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, chatStream } from './services/geminiService';
import MathMarkdown from './components/MathMarkdown';
import { cn } from './lib/utils';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Derived progress
  const progress = Math.min(Math.round((messages.length / 10) * 100), 100);

  const suggestedTopics = [
    { title: "Algebra", prompt: "Iniziamo con le equazioni di primo grado." },
    { title: "Geometria", prompt: "Spiegami il teorema di Pitagora in modo intuitivo." },
    { title: "Analisi", prompt: "Cosa sono le derivate e perché le usiamo?" },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: text.trim() }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      let fullResponse = '';
      const modelMessage: Message = { role: 'model', parts: [{ text: '' }] };
      setMessages(prev => [...prev, modelMessage]);

      const stream = chatStream(newMessages);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'model',
            parts: [{ text: fullResponse }]
          };
          return updated;
        });
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = "Si è verificato un errore nella sessione. Riprova tra un momento.";
      
      if (error?.message?.includes('GEMINI_API_KEY')) {
        errorMessage = "Chiave API mancante. Assicurati di aver configurato GEMINI_API_KEY nei segreti dell'app.";
      } else if (error?.message?.includes('quota')) {
        errorMessage = "Limite di messaggi raggiunto per oggi. Riprova più tardi.";
      }
      
      setMessages(prev => [
        ...prev,
        { role: 'model', parts: [{ text: errorMessage }] }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FDFCF9] font-sans text-[#1A1A1A]">
      {/* Vertical Branding Rail */}
      <aside className="hidden md:flex w-16 flex-col items-center justify-between border-r border-[#1A1A1A]/10 py-8 bg-white/50">
        <div className="rotate-180 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/40" style={{ writingMode: 'vertical-rl' }}>
          SESSIONE ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </div>
        <div className="h-10 w-10 rounded-full border border-[#1A1A1A] flex items-center justify-center font-serif italic text-lg shadow-sm">
          M
        </div>
      </aside>

      {/* Main Learning Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#1A1A1A]/10 px-6 md:px-12 py-8 bg-[#FDFCF9]/95 backdrop-blur-sm z-10 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/50 mb-1">
              {messages.length > 0 ? "Sessione di Apprendimento Attiva" : "Laboratorio di Matematica"}
            </p>
            <h1 className="font-serif text-2xl md:text-3xl italic text-[#1A1A1A]">MathMentor AI</h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-4 items-center">
              <div className="h-1.5 w-24 md:w-48 rounded-full bg-[#1A1A1A]/5 overflow-hidden">
                <motion.div 
                  className="h-full bg-[#1A1A1A]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold whitespace-nowrap tracking-wider">{progress}% COMPLETATO</span>
            </div>
            <button 
              onClick={clearChat}
              className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:opacity-60 transition-opacity"
            >
              Ricomincia sessione
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
          {/* Dialogue Column */}
          <section className="col-span-12 lg:col-span-8 flex flex-col overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-2xl"
                  >
                    <h2 className="font-serif text-4xl italic mb-6 leading-tight">Benvenuto nel tuo spazio di pensiero.</h2>
                    <p className="font-serif text-xl leading-relaxed text-[#1A1A1A]/80 mb-10">
                      Sono qui per guidarti nella bellezza del linguaggio matematico. Cosa desideri esplorare oggi?
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {suggestedTopics.map((topic) => (
                        <button
                          key={topic.title}
                          onClick={() => handleSend(topic.prompt)}
                          className="border border-[#1A1A1A] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all active:scale-95"
                        >
                          {topic.title}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex flex-col gap-2",
                        msg.role === 'user' ? "items-end" : "items-start"
                      )}
                    >
                      {msg.role === 'model' && (
                        <div className="mb-2 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1A1A1A]"></span>
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">MathMentor AI</span>
                        </div>
                      )}
                      <div className={cn(
                        "w-full",
                        msg.role === 'user' ? "max-w-md border border-[#1A1A1A]/20 bg-white p-6 rounded-2xl shadow-sm italic text-sm text-[#1A1A1A]/80" : "max-w-2xl"
                      )}>
                        {msg.role === 'model' ? (
                          <MathMarkdown content={msg.parts[0].text} />
                        ) : (
                          <p>"{msg.parts[0].text}"</p>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              {isLoading && messages[messages.length-1]?.role === 'user' && (
                <div className="flex items-center gap-3 animate-pulse opacity-40">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1A1A1A]"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest italic">Il Mentor sta scrivendo...</span>
                </div>
              )}
            </div>

            {/* Input Box Area */}
            <div className="shrink-0 p-6 md:p-12 border-t border-[#1A1A1A] bg-[#FDFCF9]">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Scrivi la tua riflessione o domanda..."
                  className="flex-1 bg-transparent border-none outline-none font-serif italic text-lg text-[#1A1A1A] placeholder:text-[#1A1A1A]/30"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="border border-[#1A1A1A] px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#1A1A1A] hover:text-white disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all active:scale-95 shrink-0"
                >
                  Invia
                </button>
              </div>
              <p className="text-[9px] uppercase tracking-[0.25em] font-bold mt-6 opacity-30 text-center sm:text-left">
                Ogni grande intuizione inizia con una semplice domanda.
              </p>
            </div>
          </section>

          {/* Right Panel: Scaffolding / Theory */}
          <aside className="hidden lg:flex col-span-4 border-l border-[#1A1A1A]/10 bg-[#F6F4F0] p-10 flex-col overflow-y-auto">
            <div className="mb-12">
              <h3 className="mb-8 font-serif text-xl italic underline underline-offset-8 decoration-[#1A1A1A]/20">Concetti Fondamentali</h3>
              <ul className="space-y-8">
                <li>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 mb-2">01. Ordine delle Operazioni</span>
                  <p className="text-sm leading-relaxed text-[#1A1A1A]/80 font-serif">
                    Ricorda l'acronimo <span className="italic">PEMDAS</span>: Parentesi, Esponenti, Moltiplicazione e Divisione, Addizione e Sottrazione.
                  </p>
                </li>
                <li>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 mb-2">02. Proprietà Invariantiva</span>
                  <p className="text-sm leading-relaxed text-[#1A1A1A]/80 font-serif">
                    L'essenza dell'algebra: ciò che fai a un membro, devi farlo anche all'altro per mantenere l'equilibrio.
                  </p>
                </li>
                <li>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40 mb-2">03. Astrazione</span>
                  <p className="text-sm leading-relaxed text-[#1A1A1A]/80 font-serif">
                    Le lettere sono contenitori di possibilità. Imparare a vederle come numeri ignoti libera il pensiero.
                  </p>
                </li>
              </ul>
            </div>

            <div className="rounded-none border border-[#1A1A1A]/10 bg-white p-6 shadow-sm mt-auto">
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-widest">Lo Stato Mentale</h4>
              <div className="flex items-end justify-center gap-3 h-20 mb-6 px-4">
                 <div className="w-8 bg-[#1A1A1A]/5 border border-[#1A1A1A]/10" style={{ height: '60%' }}></div>
                 <div className="w-8 bg-[#1A1A1A]/10 border border-[#1A1A1A]/10" style={{ height: '85%' }}></div>
                 <div className="w-8 bg-[#1A1A1A]/20 border border-[#1A1A1A]/10" style={{ height: '40%' }}></div>
                 <div className="w-8 bg-[#1A1A1A] border border-[#1A1A1A]/10" style={{ height: '70%' }}></div>
              </div>
              <p className="text-[11px] leading-relaxed opacity-60 text-center uppercase tracking-tight italic font-serif">
                "La matematica non è solo numeri, è una danza di logica e intuizione."
              </p>
            </div>

            <div className="mt-12">
              <button className="w-full flex items-center justify-between border-b border-[#1A1A1A] pb-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">
                Approfondimento Teorico
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

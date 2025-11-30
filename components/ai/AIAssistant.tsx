'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, FileText, BarChart3, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  { icon: FileText, text: 'Générer un rapport mensuel' },
  { icon: BarChart3, text: 'Analyser les retards projets' },
  { icon: AlertCircle, text: 'Résumer les alertes critiques' },
];

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA PEPPI. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual Gemini API call)
    setTimeout(() => {
      const responses: Record<string, string> = {
        'rapport': 'Je peux générer un rapport pour vous. Voici les options disponibles:\n\n📊 **Rapport Financier** - Budget vs Dépenses\n📈 **Rapport Progression** - État des projets\n🏗️ **Rapport Chantier** - Activités terrain\n\nQuel type de rapport souhaitez-vous ?',
        'retard': 'Analyse des retards en cours...\n\n⚠️ **3 projets en retard identifiés:**\n\n1. **Marina Bay** - Retard de 15 jours (livraison matériaux)\n2. **Résidence Okoumé** - Retard de 5 jours (météo)\n3. **Centre Commercial** - Retard de 8 jours (main d\'œuvre)\n\nVoulez-vous des détails sur un projet spécifique ?',
        'alerte': 'Voici le résumé des alertes critiques:\n\n🔴 **2 alertes critiques:**\n- Dépassement budget Projet Marina (+15%)\n- Retard livraison ciment (5 jours)\n\n🟠 **5 alertes moyennes:**\n- Stock bas sur 3 matériaux\n- 2 factures en attente > 30 jours',
        'default': 'Je comprends votre demande. Pour vous aider au mieux, je peux:\n\n• Générer des rapports PDF/Excel\n• Analyser les données des projets\n• Résumer les alertes et KPIs\n• Répondre à vos questions sur les données\n\nQue souhaitez-vous faire ?',
      };

      let responseContent = responses['default'];
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('rapport')) responseContent = responses['rapport'];
      else if (lowerInput.includes('retard') || lowerInput.includes('délai')) responseContent = responses['retard'];
      else if (lowerInput.includes('alerte') || lowerInput.includes('critique')) responseContent = responses['alerte'];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center',
          isOpen && 'scale-0 opacity-0'
        )}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Assistant IA</h3>
              <p className="text-xs text-white/80">Powered by Gemini</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-500 mb-2">Suggestions :</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, index) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                  >
                    <Icon className="w-3 h-3" />
                    {prompt.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Posez votre question..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../api';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Spinner } from '../components/common';

const QUICK_QUESTIONS = [
  '🏋️ What\'s a good beginner workout?',
  '🥗 What foods help build muscle?',
  '💧 How much water should I drink?',
  '😴 How can I improve my sleep?',
  '🔥 How many calories should I eat?',
  '⚖️ What is a healthy BMI range?',
  '🎯 How to lose weight safely?',
  '💪 Best exercises for a flat stomach?',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'assistant',
      content: '👋 Hey! I\'m your **FitFusion AI Assistant**.\n\nI can help you with:\n• 🏋️ Workout advice and plans\n• 🥗 Nutrition and meal guidance\n• 💧 Hydration tips\n• 😴 Sleep optimization\n• 📊 BMI and calorie questions\n• 🎯 Goal-setting strategies\n\nWhat would you like to know today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    const userMessage = { id: Date.now(), role: 'user', content: userMsg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    try {
      const { data } = await aiAPI.chat(userMsg);
      const aiMessage = { id: Date.now() + 1, role: 'assistant', content: data.data.message, timestamp: data.data.timestamp };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: '⚠️ Sorry, I\'m having trouble responding right now. Please try again!', timestamp: new Date().toISOString() }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/•/g, '&bull;');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      <div className="mb-4">
        <h1 className="section-title flex items-center gap-2">
          <Bot className="text-violet-500" size={26} /> AI Assistant
          <span className="badge badge-primary text-xs ml-2">Rule-Based + OpenAI Ready</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Get personalized fitness and nutrition advice</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Quick questions sidebar */}
        <div className="lg:w-56 shrink-0">
          <div className="card p-4 h-full">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Sparkles size={12} /> Quick Questions
            </p>
            <div className="space-y-1.5">
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs text-slate-600 dark:text-slate-400 p-2.5 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-colors leading-relaxed">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col card overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-sm
                  ${msg.role === 'user' ? 'gradient-purple text-white' : 'bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-violet-600 dark:text-violet-400" />}
                </div>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'gradient-purple text-white rounded-tr-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-dark-border rounded-tl-sm'}`}>
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                  <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-violet-200' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Bot size={16} className="text-violet-600" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-dark-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-100 dark:border-dark-border">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask me anything about fitness, nutrition, sleep..."
                className="input-field flex-1"
                disabled={loading}
              />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn-primary px-4 disabled:opacity-40">
                {loading ? <Spinner size="sm" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Rule-based responses • OpenAI integration ready for real-time AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

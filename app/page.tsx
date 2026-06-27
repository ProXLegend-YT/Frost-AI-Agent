'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from '@/components/MessageBubble';
import Sidebar from '@/components/Sidebar';
import {
  type Message, type Conversation,
  getAllConversations, saveConversation, getConversation,
  getActiveId, setActiveId, createConversation, addMessage,
  generateTitle, toAPIMessages,
} from '@/lib/memory';
import { DEFAULT_MODEL, MODELS } from '@/lib/models';

const QUICK_PROMPTS = [
  { icon: '💻', label: 'Write code', prompt: 'Write a ' },
  { icon: '📝', label: 'Summarize', prompt: 'Summarize this: ' },
  { icon: '🔍', label: 'Explain', prompt: 'Explain in simple terms: ' },
  { icon: '🧠', label: 'Brainstorm', prompt: 'Brainstorm ideas for: ' },
  { icon: '🌐', label: 'Translate', prompt: 'Translate to English: ' },
  { icon: '🐛', label: 'Debug', prompt: 'Debug this code:\n```\n\n```' },
];

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load conversations on mount
  useEffect(() => {
    const all = getAllConversations();
    setConversations(all);
    const activeId = getActiveId();
    if (activeId) {
      const convo = getConversation(activeId);
      if (convo) {
        setActiveConvo(convo);
        setSelectedModel(convo.model);
      }
    }
  }, []);

  const refreshConversations = useCallback(() => {
    setConversations(getAllConversations());
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvo?.messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const startNewChat = useCallback(() => {
    setActiveConvo(null);
    setInput('');
    setStreamingContent('');
    setError('');
    setActiveId('');
  }, []);

  const selectConversation = useCallback((id: string) => {
    const convo = getConversation(id);
    if (convo) {
      setActiveConvo(convo);
      setSelectedModel(convo.model);
      setActiveId(id);
      setStreamingContent('');
      setError('');
    }
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput('');
    setError('');
    setStreamingContent('');

    // Create or update conversation
    let convo = activeConvo ?? createConversation(selectedModel);
    const userMsg: Message = { role: 'user', content: text };
    convo = addMessage(convo, userMsg);

    // Set title from first message
    if (convo.messages.filter(m => m.role === 'user').length === 1) {
      convo = { ...convo, title: generateTitle(text) };
    }

    setActiveConvo(convo);
    setActiveId(convo.id);
    saveConversation(convo);
    refreshConversations();

    // Stream response
    setIsStreaming(true);
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: toAPIMessages(convo.messages),
          model: selectedModel,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Request failed');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content ?? '';
                if (delta) {
                  fullContent += delta;
                  setStreamingContent(fullContent);
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      }

      // Save assistant message
      const assistantMsg: Message = { role: 'assistant', content: fullContent || '(no response)' };
      const updatedConvo = addMessage({ ...convo, model: selectedModel }, assistantMsg);
      setActiveConvo(updatedConvo);
      saveConversation(updatedConvo);
      refreshConversations();
      setStreamingContent('');

    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentModel = MODELS.find(m => m.id === selectedModel);
  const messages = activeConvo?.messages ?? [];
  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div className="flex h-screen bg-[#080810] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeConvo?.id ?? null}
        onSelect={selectConversation}
        onNew={startNewChat}
        onRefresh={refreshConversations}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a40] bg-[#0d0d1a] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a40] text-gray-300 transition-colors"
          >
            ☰
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {activeConvo?.title ?? 'My AI Agent'}
              </p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                {currentModel?.name ?? 'Online'}
                {currentModel?.free && <span className="text-violet-400 ml-1">• Free</span>}
              </p>
            </div>
          </div>

          <button
            onClick={startNewChat}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a1a2e] hover:bg-violet-600/20 text-gray-300 hover:text-violet-400 transition-colors text-lg"
            title="New chat"
          >
            +
          </button>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-4">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-8 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-3xl shadow-lg glow-accent">
                🤖
              </div>
              <div className="text-center">
                <h1 className="text-lg font-bold text-white mb-1">My AI Agent</h1>
                <p className="text-sm text-gray-400">Powered by {currentModel?.name} · How can I help?</p>
              </div>
              {/* Quick prompts */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                {QUICK_PROMPTS.map(qp => (
                  <button key={qp.label} onClick={() => { setInput(qp.prompt); textareaRef.current?.focus(); }}
                    className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2a2a40] border border-[#2a2a40] hover:border-violet-600/40 text-left px-3 py-2.5 rounded-xl transition-all text-xs text-gray-300">
                    <span>{qp.icon}</span> {qp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {/* Streaming bubble */}
          {isStreaming && streamingContent && (
            <MessageBubble
              message={{ role: 'assistant', content: streamingContent }}
              isStreaming
            />
          )}

          {/* Loading indicator (before first chunk) */}
          {isStreaming && !streamingContent && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-sm shrink-0">🤖</div>
              <div className="bg-[#1a1a2e] border border-[#2a2a40] px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex justify-center animate-fade-in">
              <div className="bg-red-900/30 border border-red-700/40 text-red-300 text-xs px-4 py-2 rounded-xl">
                ❌ {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-4 pb-4 pt-2 border-t border-[#2a2a40] bg-[#0d0d1a] shrink-0">
          <div className="flex gap-2 items-end max-w-3xl mx-auto">
            <div className="flex-1 bg-[#1a1a2e] border border-[#2a2a40] focus-within:border-violet-600/60 rounded-2xl flex items-end transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
                rows={1}
                disabled={isStreaming}
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 resize-none px-4 py-3 outline-none max-h-[120px] leading-relaxed disabled:opacity-50"
              />
            </div>

            {isStreaming ? (
              <button onClick={stopStreaming}
                className="w-11 h-11 rounded-2xl bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors shrink-0">
                <span className="w-3.5 h-3.5 bg-white rounded-sm" />
              </button>
            ) : (
              <button onClick={sendMessage} disabled={!input.trim()}
                className="w-11 h-11 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">
            AI can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </div>
  );
}

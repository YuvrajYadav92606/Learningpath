import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, RefreshCw, Map, Trash2, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { sendChat, clearChatHistory, generateRoadmap } from '../api/client';
import MessageBubble from '../components/MessageBubble';
import type { ChatAction } from '../types';

const QUICK_ACTIONS = [
  { label: '🎯 Set my goal', message: 'I want to tell you about my learning goal.' },
  { label: '🗺️ Generate my roadmap', message: 'Please generate a personalized learning path for me.' },
  { label: '📊 Analyze my skill gaps', message: 'Can you analyze what skills I\'m missing to reach my goal?' },
  { label: '💡 Suggest next steps', message: 'What should I focus on learning this week?' },
];

export default function ChatPage() {
  const navigate = useNavigate();
  const {
    userId, profile, messages, addMessage, updateMessage, clearMessages,
    setChatLoading, isChatLoading, setProfile, setRoadmap, isGenerating, setGenerating,
  } = useStore();

  const [input, setInput] = useState('');
  const [showWelcome, setShowWelcome] = useState(messages.length === 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0 && profile) {
      addMessage({
        role: 'assistant',
        content: `Hi **${profile.name}**! 👋 I'm LearnAI, your personal learning advisor.\n\n${
          profile.goals.length > 0
            ? `I can see you're working toward: *${profile.goals.join(', ')}*. Let's dive deeper!\n\nTell me more about where you are now, or type **"Generate my roadmap"** to get your personalized learning path.`
            : `I'm here to help you create a personalized learning path tailored to your goals, interests, and skill level.\n\nTo get started, **tell me what you'd like to learn or what career goal you're working toward** — I'll ask a few questions and then build your roadmap!`
        }`,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const handleSend = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || isChatLoading || !userId) return;

    setInput('');
    setShowWelcome(false);

    // Add user message
    addMessage({ role: 'user', content: text, timestamp: new Date().toISOString() });

    // Add loading indicator
    const loadingId = addMessage({ role: 'assistant', content: '', isLoading: true, timestamp: new Date().toISOString() });
    setChatLoading(true);

    try {
      const history = messages
        .filter((m) => !m.isLoading)
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      const { reply, actions, profile: updatedProfile } = await sendChat(userId, text, history);

      // Update loading message with real reply
      updateMessage(loadingId, { content: reply, isLoading: false });

      // Update profile if changed
      if (updatedProfile) setProfile(updatedProfile);

      // Handle actions
      for (const action of actions) {
        await handleAction(action);
      }
    } catch (err: unknown) {
      updateMessage(loadingId, {
        content: '⚠️ Sorry, I had trouble connecting. Please check that the backend server is running.',
        isLoading: false,
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleAction = async (action: ChatAction) => {
    if (action.type === 'GENERATE_ROADMAP' && userId) {
      setGenerating(true);
      const genId = addMessage({
        role: 'assistant',
        content: '',
        isLoading: true,
        timestamp: new Date().toISOString(),
      });
      try {
        const roadmap = await generateRoadmap(userId);
        setRoadmap(roadmap);
        updateMessage(genId, {
          content: `🎉 Your personalized learning roadmap is ready!\n\n**Goal:** ${roadmap.goal}\n**Duration:** ${roadmap.totalDuration} | **${roadmap.phases.length} phases** | **${roadmap.skillsToGain.length} skills to gain**\n\nHead to the [Roadmap](/roadmap) page to explore it, or ask me anything about your plan!`,
          isLoading: false,
        });
      } catch {
        updateMessage(genId, {
          content: '⚠️ Failed to generate roadmap. Please try again.',
          isLoading: false,
        });
      } finally {
        setGenerating(false);
      }
    }
  };

  const handleClear = async () => {
    if (!userId) return;
    clearMessages();
    await clearChatHistory(userId).catch(() => {});
    setShowWelcome(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-slate-800">LearnAI Advisor</h1>
            <p className="text-xs text-slate-400">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {useStore.getState().roadmap && (
            <button
              onClick={() => navigate('/roadmap')}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              <Map className="w-3.5 h-3.5" /> View Roadmap
            </button>
          )}
          <button onClick={handleClear} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Clear chat">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isLoading={msg.isLoading}
            timestamp={msg.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {(showWelcome || messages.length <= 2) && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-400 mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(({ label, message }) => (
              <button
                key={label}
                onClick={() => handleSend(message)}
                disabled={isChatLoading}
                className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-primary-300 hover:text-primary-700 transition-colors disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about courses, describe your goals, or say 'generate my roadmap'…"
            rows={1}
            style={{ resize: 'none' }}
            className="input flex-1 min-h-[40px] max-h-[120px] py-2.5 overflow-y-auto"
            disabled={isChatLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isChatLoading}
            className="btn-primary py-2.5 px-4 self-end"
          >
            {isChatLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

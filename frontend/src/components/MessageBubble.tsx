import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  timestamp?: string;
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center py-1 px-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="typing-dot w-2 h-2 bg-primary-400 rounded-full"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  );
}

export default function MessageBubble({ role, content, isLoading, timestamp }: Props) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isUser ? 'bg-primary-600' : 'bg-white border border-slate-200'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-primary-600" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-primary-600 text-white rounded-tr-sm'
            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
        }`}
      >
        {isLoading ? (
          <TypingIndicator />
        ) : isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-slate-900 prose-a:text-primary-600">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        {timestamp && !isLoading && (
          <p
            className={`text-xs mt-1.5 ${
              isUser ? 'text-primary-200 text-right' : 'text-slate-400'
            }`}
          >
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}

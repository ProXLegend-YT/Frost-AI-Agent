'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '@/lib/memory';

type Props = {
  message: Message;
  isStreaming?: boolean;
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="absolute top-2 right-2 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-md transition-colors">
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CodeBlock({ className, children }: any) {
  const match = /language-(\w+)/.exec(className || '');
  const codeStr = String(children).replace(/\n$/, '');
  if (match) {
    return (
      <div className="relative">
        <CopyButton text={codeStr} />
        <SyntaxHighlighter
          style={oneDark as { [key: string]: React.CSSProperties }}
          language={match[1]}
          PreTag="div"
          customStyle={{ background: '#0d0d1a', border: '1px solid #2a2a40', borderRadius: '10px', fontSize: '0.8rem', marginTop: '0.5rem' }}
        >
          {codeStr}
        </SyntaxHighlighter>
      </div>
    );
  }
  return <code className={className}>{children}</code>;
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2.5 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${isUser ? 'bg-violet-600' : 'bg-gradient-to-br from-violet-600 to-purple-800'} text-white`}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div className={`max-w-[85%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-violet-600 text-white rounded-tr-sm' : 'bg-[#1a1a2e] text-gray-100 rounded-tl-sm border border-[#2a2a40]'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className={`prose-agent${isStreaming ? ' typing-cursor' : ''}`}>
              <ReactMarkdown components={{ code: CodeBlock }}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {message.timestamp && (
          <span className="text-xs text-gray-600 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}

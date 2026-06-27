'use client';
import type { Conversation } from '@/lib/memory';
import { deleteConversation, clearAllConversations } from '@/lib/memory';
import { MODELS } from '@/lib/models';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRefresh: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
};

export default function Sidebar({
  isOpen, onClose, conversations, activeId,
  onSelect, onNew, onRefresh, selectedModel, onModelChange
}: Props) {
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
    onRefresh();
  };

  const handleClearAll = () => {
    if (confirm('Delete all conversations? This cannot be undone.')) {
      clearAllConversations();
      onRefresh();
      onNew();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-[#0d0d1a] border-r border-[#2a2a40]
        z-40 flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a40]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-semibold text-sm text-white">AI Agent</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg p-1">✕</button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-[#2a2a40]">
          <button onClick={() => { onNew(); onClose(); }}
            className="w-full flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <span>+</span> New Chat
          </button>
        </div>

        {/* Model Selector */}
        <div className="p-3 border-b border-[#2a2a40]">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Model</p>
          <select
            value={selectedModel}
            onChange={e => onModelChange(e.target.value)}
            className="w-full bg-[#1a1a2e] border border-[#2a2a40] text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-violet-500"
          >
            <optgroup label="🆓 Free Models">
              {MODELS.filter(m => m.free).map(m => (
                <option key={m.id} value={m.id}>{m.badge} {m.name}</option>
              ))}
            </optgroup>
            <optgroup label="💰 Paid Models">
              {MODELS.filter(m => !m.free).map(m => (
                <option key={m.id} value={m.id}>{m.badge} {m.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          <p className="text-xs text-gray-500 px-2 py-1 font-medium uppercase tracking-wide">History</p>
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-600 px-2 py-3 text-center">No conversations yet</p>
          ) : (
            conversations.map(convo => (
              <div
                key={convo.id}
                onClick={() => { onSelect(convo.id); onClose(); }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer mb-1 transition-colors
                  ${activeId === convo.id
                    ? 'bg-violet-600/20 border border-violet-600/40 text-white'
                    : 'hover:bg-[#1a1a2e] text-gray-300'}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{convo.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {convo.messages.length} messages · {new Date(convo.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={e => handleDelete(e, convo.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 ml-2 transition-all text-xs p-1"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#2a2a40]">
          <button onClick={handleClearAll}
            className="w-full text-xs text-gray-500 hover:text-red-400 py-2 transition-colors">
            🗑 Clear all history
          </button>
        </div>
      </aside>
    </>
  );
}

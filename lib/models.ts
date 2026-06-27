// lib/models.ts
// Free & cheap models available on OpenRouter

export type AIModel = {
  id: string;
  name: string;
  description: string;
  contextWindow: string;
  free: boolean;
  badge?: string;
};

export const MODELS: AIModel[] = [
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B',
    description: 'Meta\'s best open-source model. Great for coding & reasoning.',
    contextWindow: '131K',
    free: true,
    badge: '🔥 Best Free',
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B',
    description: 'Fast, efficient. Perfect for quick tasks.',
    contextWindow: '32K',
    free: true,
    badge: '⚡ Fast',
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Gemma 3 27B',
    description: 'Google\'s open model. Excellent at instruction following.',
    contextWindow: '96K',
    free: true,
    badge: '🌟 Google',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    description: 'Advanced reasoning model. Best for complex problems.',
    contextWindow: '64K',
    free: true,
    badge: '🧠 Reasoning',
  },
  {
    id: 'qwen/qwen3-8b:free',
    name: 'Qwen3 8B',
    description: 'Alibaba\'s model. Great multilingual support.',
    contextWindow: '32K',
    free: true,
    badge: '🌏 Multilingual',
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Anthropic\'s fast model. Excellent quality.',
    contextWindow: '200K',
    free: false,
    badge: '💜 Claude',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'OpenAI\'s efficient model. Great all-rounder.',
    contextWindow: '128K',
    free: false,
    badge: '🟢 OpenAI',
  },
];

export const DEFAULT_MODEL = MODELS[0].id;

export const AGENT_SYSTEM_PROMPT = `You are an advanced AI agent — helpful, smart, and capable.

You can help with:
- 💻 Writing and debugging code (Python, JS, TypeScript, etc.)
- 📝 Writing, editing, summarizing documents
- 🔍 Research and analysis
- 🧮 Math and reasoning problems
- 💡 Brainstorming and creative work
- 🌐 Explaining complex topics simply

Guidelines:
- Be concise but thorough
- Use markdown formatting for code blocks, lists, and structure
- For code, always specify the language in code blocks
- If you're unsure, say so honestly
- Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

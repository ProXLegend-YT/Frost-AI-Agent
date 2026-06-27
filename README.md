# 🤖 My AI Agent

A powerful, free AI agent you can install on your phone like a native app. Built with Next.js, deployed on Vercel, powered by OpenRouter AI.

## ✨ Features

- 🧠 **Multiple AI Models** — Llama 3.3, Mistral, Gemma, DeepSeek, and more (all free!)
- 💬 **Streaming responses** — See the AI think in real-time
- 📱 **PWA** — Install on iPhone or Android like a real app
- 🗂 **Chat history** — All conversations saved locally on your device
- 🎨 **Beautiful dark UI** — Optimized for mobile screens
- 💻 **Code highlighting** — Syntax-highlighted code blocks with copy button
- ⚡ **Edge runtime** — Super fast responses via Vercel Edge

## 🚀 Deploy in 5 Minutes (Free)

### 1. Fork this repo on GitHub
Click the **Fork** button at the top right of this page.

### 2. Get a free OpenRouter API key
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up (free)
3. Go to **Keys** → **Create Key**
4. Copy your key

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"**
3. Import your forked repo
4. Add Environment Variable:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** `your-key-here`
5. Click **Deploy** ✅

Your app is live at `https://your-app.vercel.app` in ~2 minutes!

### 4. Install on your phone

**iPhone (Safari):**
1. Open your Vercel URL in Safari
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Done! 🎉

**Android (Chrome):**
1. Open your Vercel URL in Chrome
2. Tap the **three dots menu**
3. Tap **"Add to Home Screen"** or **"Install App"**
4. Done! 🎉

## 🛠 Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/my-ai-agent.git
cd my-ai-agent

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local and add your OPENROUTER_API_KEY

# Run locally
npm run dev
# Open http://localhost:3000
```

## 📁 Project Structure

```
my-ai-agent/
├── app/
│   ├── api/chat/route.ts    # OpenRouter API handler (streaming)
│   ├── globals.css          # Global styles + markdown styles
│   ├── layout.tsx           # PWA metadata & layout
│   └── page.tsx             # Main chat interface
├── components/
│   ├── MessageBubble.tsx    # Chat message with markdown rendering
│   └── Sidebar.tsx          # Conversation history + model selector
├── lib/
│   ├── memory.ts            # localStorage conversation management
│   └── models.ts            # OpenRouter model list + system prompt
└── public/
    ├── manifest.json        # PWA manifest
    └── icons/               # App icons (add your own!)
```

## 🆓 Free Models Available

| Model | Context | Best For |
|-------|---------|----------|
| Llama 3.3 70B | 131K | General use, coding |
| Mistral 7B | 32K | Fast responses |
| Gemma 3 27B | 96K | Instructions |
| DeepSeek R1 | 64K | Reasoning |
| Qwen3 8B | 32K | Multilingual |

## 🎨 Adding App Icons

Replace the placeholder icons in `/public/icons/`:
- `icon-192.png` — 192×192 pixels
- `icon-512.png` — 512×512 pixels

Use any image editor or [favicon.io](https://favicon.io) to generate them.

## 📄 License
MIT — free to use, modify, and deploy.

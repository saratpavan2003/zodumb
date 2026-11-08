# 🔮 Zodumb — Your Funny Birthday Horoscope

Enter your birthday. Get a funny horoscope. For entertainment only.

Five modes: **Solo Reading** (a birthday horoscope), **Cosmic Beef** (zodiac compatibility for two people), **Call In Sick** (an AI-crafted excuse, at `/sick`), **Why I Can't Lend You Money** (gentle-to-absurd ways to say no to a loan, at `/money`), and **Late to Work Excuse** (an AI-written "running late" message, at `/late`).

---

## 🚀 Deploy to Vercel (Free)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zodumb.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `zodumb` GitHub repo
4. Click **Deploy** — Vercel auto-detects Vite ✅

### Step 3 — Add your API Key (SECRET)
1. In Vercel dashboard → your project → **Settings → Environment Variables**
2. Add:
   - Name: `GEMINI_API_KEY`
   - Value: your [Google AI Studio](https://aistudio.google.com/apikey) Gemini API key
3. Click **Save** then **Redeploy**

### Step 4 — Connect your custom domain
1. In Vercel dashboard → your project → **Settings → Domains**
2. Add your domain (e.g. `zodumb.com`)
3. Go to your domain registrar (Namecheap, etc.) and add these DNS records:
   - Type: `A` | Name: `@` | Value: `76.76.21.21`
   - Type: `CNAME` | Name: `www` | Value: `cname.vercel-dns.com`
4. Wait ~10 min for DNS to propagate ✅

---

## 🛠 Local Development

```bash
npm install
```

Create a `.env.local` file:
```
GEMINI_API_KEY=your-gemini-key-here
```

Run dev server:
```bash
npm run dev
```

> Note: `npm run dev` (Vite) serves the frontend only — the `/api/*` Edge Functions don't run under it. Use `vercel dev` instead (requires the Vercel CLI) to run the frontend and API functions together locally.

---

## 📁 Project Structure

```
zodumb/
├── api/
│   ├── horoscope.js       # Solo Reading — Gemini-backed serverless function
│   ├── compatibility.js   # Cosmic Beef — zodiac compatibility
│   └── sicknote.js        # Call In Sick — excuse generator
├── src/
│   ├── App.jsx             # Main page — Solo Reading + Cosmic Beef
│   ├── SickApp.jsx         # /sick page — Call In Sick generator
│   ├── main.jsx            # Entry point (routes "/" vs "/sick")
│   ├── styles.js           # Shared design tokens for both pages
│   ├── Actions.jsx         # Shared copy / download / reset buttons
│   ├── shareCard.js        # Canvas-based downloadable share cards
│   └── index.css           # Global styles
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

Built with React + Vite + Vercel Edge Functions + Gemini AI

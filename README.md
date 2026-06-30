# 🔮 Zodumb — Your Unhinged Birthday Horoscope

Enter your birthday. Receive your fate. Accuracy not guaranteed. Chaos is.

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
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (your Anthropic API key)
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
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Run dev server:
```bash
npm run dev
```

> Note: Vercel Edge Functions run locally via `vercel dev` if you have the Vercel CLI installed.

---

## 📁 Project Structure

```
zodumb/
├── api/
│   └── horoscope.js      # Serverless function (API key lives here, secret)
├── src/
│   ├── App.jsx            # Main React component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

Built with React + Vite + Vercel Edge Functions + Claude AI

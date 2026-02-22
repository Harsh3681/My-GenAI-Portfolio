# Deployment Guide

## 🛠 Your Tech Stack

| Layer             | Technology                                                    |
| ----------------- | ------------------------------------------------------------- |
| **Frontend**      | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion |
| **Backend**       | Next.js API Routes (Node.js runtime)                          |
| **External APIs** | OpenRouter (LLM + Embeddings), Hugging Face Spaces            |
| **Database**      | None (Stateless) - PDF parsing only                           |
| **UI Libraries**  | Radix UI, Sonner, Lucide Icons, TsParticles                   |
| **Deploy Ready**  | Yes ✅ (Zero database complexity)                             |

---

## 🚀 QUICK START (5 minutes)

### **Option 1: Vercel (RECOMMENDED ⭐)**

**Best for**: Next.js, free tier, instant CI/CD, custom domain

```bash
# 1. Push your code to GitHub
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main

# 2. Go to vercel.com → Import Project → Select your repo
# 3. Configure environment variables (see below)
# 4. Deploy! 🎉
```

**Steps in Vercel Dashboard:**

1. Visit [vercel.com](https://vercel.com)
2. Click "New Project" → Import your GitHub repo
3. Select Next.js framework
4. **Add Environment Variables:**
   ```
   OPENROUTER_API_KEY = your-key-here
   HF_BACKEND_URL = https://Harsh123007-harshal-portfolio-ai.hf.space
   ```
5. Click Deploy
6. Custom domain: **Settings → Domains**

✅ **Pros**: Free, automatic deploys on git push, great performance, Vercel Analytics included  
❌ **Cons**: None for portfolio size

---

### **Option 2: Netlify (Easy Alternative)**

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build your project
npm run build

# 3. Deploy
netlify deploy --prod
```

Or via UI: [netlify.com](https://netlify.com) → Connect Git → Authorize

**Add Env Vars:** Site Settings → Build & Deploy → Environment

---

### **Option 3: Railway (Simple, $5/month)**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Configure env vars in dashboard
# 5. Deploy
railway up
```

---

### **Option 4: Render (Generous Free Tier)**

1. Visit [render.com](https://render.com)
2. New → Web Service → Connect GitHub
3. Select your repo
4. **Runtime**: Node
5. **Build Command**: `npm run build`
6. **Start Command**: `npm run start`
7. Add environment variables
8. Deploy!

---

## 🔐 Environment Variables (CRITICAL)

**You MUST set these before deploying:**

```env
# Required for RAG (Resume AI) - GET FROM: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxx

# Optional (has built-in fallback)
HF_BACKEND_URL=https://Harsh123007-harshal-portfolio-ai.hf.space

# Optional (currently commented in code)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

**Where to get `OPENROUTER_API_KEY`:**

1. Go to https://openrouter.ai/keys
2. Create new API key
3. Copy and paste in deployment platform

---

## 📋 Pre-Deployment Checklist

- [ ] Remove `.next` from git: `git rm -r --cached .next && echo ".next" >> .gitignore`
- [ ] Verify no secrets in code: `git grep -n "sk-" || true`
- [ ] Test build locally: `npm run build && npm run start`
- [ ] Update domain in `next.config.ts` if needed
- [ ] Verify all API routes work: Check `/api/harshal-chat`, `/api/project-screenshots`
- [ ] Test dark mode, animations, responsiveness
- [ ] Add analytics: Already imported `@vercel/analytics`
- [ ] Push to GitHub

---

## 🔍 Verify Deployment Works

After deploying, check:

```bash
# Chat API endpoint
curl https://YOUR_DOMAIN/api/harshal-chat -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Who are you?"}]}'

# Screenshot API
curl "https://YOUR_DOMAIN/api/project-screenshots?slug=planbana"
```

---

## 💰 Cost Breakdown

| Platform          | Price                               | Good For                 |
| ----------------- | ----------------------------------- | ------------------------ |
| **Vercel**        | Free (generous limits)              | Portfolio, side projects |
| **Netlify**       | Free + $19/mo pro                   | Similar to Vercel        |
| **Railway**       | Pay-as-you-go (~$5/mo)              | Startups, production     |
| **Render**        | Free tier (sleeps after 15min idle) | Hobby projects           |
| **AWS/GCP/Azure** | ~$30-100/mo                         | High traffic, enterprise |

---

## 🚨 Common Issues & Fixes

### **Issue: API returns 503 "Space is sleeping"**

- Your Hugging Face Space takes time to wake up
- **Fix**: Go to `https://huggingface.co/spaces/Harsh123007/harshal-portfolio-ai` and upgrade to a paid space OR keep it open

### **Issue: PDFs not found (resumeRag.ts error)**

- Resume PDF missing in `/public/`
- **Fix**: Add `Harshal-Sonawane-Resume.pdf` to `/public/` or update path in `src/lib/rag/resumeRag.ts`

### **Issue: Build fails with "OPENROUTER_API_KEY missing"**

- You forgot to set env var in deployment platform
- **Fix**: Add it to environment variables in your platform's dashboard

### **Issue: Project screenshots not showing**

- Already fixed! ✅ (See screenshot fix in latest commit)
- Add images to `/public/projects/{slug}/screenshot1.png`

---

## 📱 Post-Deployment

### Custom Domain Setup

**Vercel:**

1. Settings → Domains
2. Add your domain
3. Copy DNS records to your registrar (Namecheap, GoDaddy, etc.)
4. Wait 24 hours for DNS propagation

**Netlify:**

1. Site Settings → Domain Management
2. Add custom domain
3. Follow DNS setup

---

## 🎯 Recommended Deployment Path

```
Step 1: Test Locally
  └─ npm run build && npm start

Step 2: Push to GitHub & Verify
  └─ git push origin main

Step 3: Deploy to Vercel
  └─ Auto-deploys on every git push

Step 4: Add Custom Domain
  └─ portfolio.harshals.dev (or your domain)

Step 5: Monitor Performance
  └─ Vercel Analytics dashboard
```

---

## 📞 Support & Next Steps

If deployment fails, check:

1. **Build logs** (Vercel/Netlify shows detailed errors)
2. **Env vars** (Make sure all are set)
3. **Node version** (Should be 18+, auto-detected)
4. **GitHub permissions** (Platform needs access to your repo)

---

## 🎓 Learning Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Docs](https://vercel.com/docs)
- [Environment Variables Guide](https://vercel.com/docs/projects/environment-variables)

---

**Your site will be live in minutes! 🚀**

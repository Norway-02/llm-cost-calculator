# Production Deployment Guide

## 1. Vercel Deployment (Recommended)

### GitHub Deployment Workflow
1. Push repository to GitHub.
2. Import project into Vercel Dashboard.
3. Framework Preset: **Next.js**.
4. Root Directory: `./`.
5. Build Command: `npm run build`.
6. Output Directory: Next.js default (`.next`).

### Custom Domain & DNS Setup
- In Vercel Project Settings → Domains:
  - Add `llmcalc.com` and `www.llmcalc.com`.
- Configure DNS A records:
  - `@` -> `76.76.21.21`
  - `www` -> `cname.vercel-dns.com`

---

## 2. Cloudflare Pages Deployment (Alternative)

1. Connect GitHub repository to Cloudflare Pages.
2. Build Settings:
   - Framework preset: **Next.js (Static Export / Edge)**.
   - Build command: `npx @cloudflare/next-on-pages@1 build`.
   - Build output directory: `.vercel/output/static`.
3. Add `@cloudflare/next-on-pages` package if deploying to Cloudflare Workers runtime.

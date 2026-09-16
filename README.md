# My First Project — Static Web Page + Vercel

Simple static web page for assignment:
> Develop your first simple static web page and deploy it using Vercel.

## Demo
- Live URL (Vercel): _TODO: paste your https://xxx.vercel.app here after deploy_
- Stack: HTML + CSS + JS, no build step.

## Run locally
Just open `index.html`, or:
```powershell
npx serve .
```

## Deploy on Vercel (GitHub method — recommended)
1. Push this folder to GitHub
2. Go to https://vercel.com/new → Import repo → Framework Preset: `Other` → Deploy
3. No build command, output directory: `./`

## Deploy via CLI
```powershell
npm i -g vercel
vercel --prod
```

## Structure
```
index.html
style.css
scripts.js
vercel.json
```

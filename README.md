# New Novel Generator (Netlify Monorepo)

This project is a Netlify monorepo for generating novels using AI (OpenAI). It features:

- **Frontend:** React (Vite) in `/frontend` (currently root)
- **Backend:** Netlify Functions in `/netlify/functions` for all AI/content generation
- **No database required**
- **Features:**
  - Quick novel generation (one click)
  - Guided mode (step-by-step: outline, chapters, etc.)

## How it works
- The React frontend calls Netlify Functions for all AI/novel generation
- Netlify Functions call OpenAI API and return results
- No user data is stored (stateless)

## Setup
1. Add your OpenAI API key to Netlify environment variables as `OPENAI_API_KEY`
2. Run `npm install` in the project root
3. Run `npm run dev` to start the frontend locally
4. Deploy to Netlify for full serverless functionality

## Folder Structure
- `/netlify/functions` — All backend logic (serverless functions)
- `/src` — React frontend code

---

This project is designed for simplicity, reliability, and fast AI-powered novel generation.

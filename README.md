## StudyMate AI – Multilingual Lecture Note Generator

**Turn messy multilingual transcripts into clean, structured study notes — instantly.**  
Built for Southeast Asia students who learn in **Vietnamese + English (and beyond)**, powered by **VALSEA API**.

---

### Demo 🎥

- **Video**: *(add your demo link here)*
- **Try it locally**: paste any transcript → pick output language → generate notes

---

### Problem 🧩

Students in Southeast Asia often learn in **code-switched classrooms**:
- Lecturers mix **Vietnamese + English terms** (“model”, “endpoint”, “database”…)
- Transcripts are **noisy** (fillers, repeats, informal phrasing)
- Notes become **hard to review** before exams

Most note tools assume one “clean” language — they fail when language is mixed.

---

### Solution ✅

StudyMate AI is a simple “Transcript → Clean → Notes” pipeline:
- **Clean** speech patterns (remove fillers, normalize spacing)
- **Detect** input language automatically
- **Generate** structured notes in a **user-selected output language**
- **Keep it Notion-style**: clear sections, bullets, keywords + explanations, quiz questions

---

### Key Features ✨

- **Multilingual input**: Vietnamese, English, Chinese, Japanese, or mixed
- **Language detection**: lightweight heuristic scoring for stable demos
- **Output language selector**: Duolingo-style visual cards (flags)
- **Professional formatting**: consistent Markdown sections:
  - Summary
  - Key Points
  - Simple Explanation
  - Keywords (with explanations)
  - Quiz Questions
- **Demo-first UX**:
  - Dynamic “AI processing steps”
  - Smooth fade-in + auto-scroll to results
  - Random sample transcripts for quick judging

---

### How It Works (in 10 seconds) ⚡

1. Paste a lecture transcript (any language / mixed)
2. App detects the input language
3. Choose output language (🇻🇳 🇺🇸 🇯🇵 🇨🇳 🇫🇷 🇩🇪)
4. Click **Generate Notes**
5. Get:
   - **Cleaned Transcript**
   - **Structured Notes** in the selected language

---

### Tech Stack 🛠️

- **Frontend**: HTML + Tailwind (CDN) + vanilla JS + `marked` (Markdown rendering)
- **Backend**: Node.js + Express
- **AI**: VALSEA API (chat completions)

---

### Architecture 🧱

- **Client (`index.html`, `script.js`)**
  - Cleans transcript locally
  - Detects language (scoring)
  - Sends `{ text, language }` to the server
  - Renders: Cleaned Transcript + AI Markdown Notes
- **Server (`server.js`)**
  - Builds a strict prompt (no greetings, fixed structure)
  - Calls VALSEA API with Bearer auth
  - Returns `{ result }` Markdown

---

### Why This Matters (Southeast Asia) 🌏

SEA classrooms are naturally multilingual:
- Students learn technical subjects using **English terminology** inside local-language explanations
- Study content is often **spoken-first** (recordings → transcripts)

StudyMate AI is designed around this reality — not around “perfect” monolingual text.

---

### Future Improvements 🚀

- Better transcript cleanup (speaker turns, punctuation, sentence segmentation)
- Streaming responses for instant partial notes
- Export to Notion / Google Docs
- Persistent history (save sessions)
- More robust language detection + mixed-output modes (e.g., bilingual glossary)

---

### Installation & Run ▶️

1. Install dependencies:

```bash
npm install
```

2. Set environment variables:
   - Create `.env` in the project root:

```bash
VALSEA_API_KEY=your_key_here
VALSEA_MODEL=valsea-standard
```

3. Run the app:

```bash
npm run dev
```

4. Open:
   - `http://localhost:3000`

---

### Author 👤

- **Your Name** — hackathon project builder


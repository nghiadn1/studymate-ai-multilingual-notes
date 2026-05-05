// Created by Cursor
const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const cors = require('cors');
const express = require('express');

const VALSEA_CHAT_URL = 'https://api.valsea.ai/v1/chat/completions';
const DEFAULT_VALSEA_MODEL = 'valsea-standard';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use(express.static('.'));


function getMockResponse() {
    return `# 📝 Summary
This lecture explains REST API basics.

# 🎯 Key Points
- REST API allows systems to communicate
- Uses HTTP methods

# 🧠 Explanation (Simple)
REST API giống như người giao tiếp giữa các hệ thống.

# 🔑 Keywords
- API: giao tiếp hệ thống
- HTTP: giao thức web

# ❓ Quiz Questions
1. REST API là gì?
2. HTTP method là gì?
3. REST hoạt động như thế nào?`;
}

function buildPrompt(text, language) {
    return `You are an AI Study Assistant for Southeast Asia students.

Transform the lecture transcript into detailed structured study notes.

IMPORTANT:
- Output MUST be in ${language}
- Do NOT mix languages
- Translate if needed
- No greetings or introductions
- Make the content detailed but still easy to read

Use format:

# 📝 Summary
# 🎯 Key Points
# 🧠 Explanation (Simple)
# 🔑 Keywords
# ❓ Quiz Questions

Rules:
- The FIRST line MUST be: # 📝 Summary
- Use bullet points (-) where appropriate
- Do not output multiple choice questions

# 📝 Summary
Write 3–4 sentences summarizing the lecture clearly.

# 🎯 Key Points
- At least 6 bullet points
- Each point must be meaningful (not short phrases)

# 🧠 Explanation (Simple)
Explain like teaching a beginner:
- Use examples
- Use analogies if possible
- At least 5–7 sentences

# 🔑 Keywords
- Each keyword MUST include a short explanation
- At least 6 keywords

# ❓ Quiz Questions
- At least 4 questions
- Mix: definition + reasoning

Lecture:
${text}`;
}

function buildExpansionPrompt(existingMarkdown, language) {
    return `Output MUST be in ${language}. Do NOT mix languages. No greetings.

Expand and improve the notes below while keeping the same section headers and order.
Add more detail, examples, and better keyword explanations.
Return only the final Markdown.

Notes:
${existingMarkdown}`;
}

function getTrimmedValseaApiKey() {
    const raw = process.env.VALSEA_API_KEY;
    return typeof raw === 'string' ? raw.trim() : '';
}

function logValseaEnvStatus() {
    const key = getTrimmedValseaApiKey();
    if (!key) {
        console.warn('[VALSEA] VALSEA_API_KEY is missing or empty (check .env and trim).');
        return;
    }
    const masked =
        key.length <= 10 ? '(too short to mask safely)' : `${key.slice(0, 6)}…${key.slice(-4)}`;
    console.log(`[VALSEA] API key loaded: ${masked}, length=${key.length}`);
}

function payloadForLog(payload) {
    const maxChars = 4000;
    const messages = Array.isArray(payload.messages)
        ? payload.messages.map((m) => {
              const content = m && typeof m.content === 'string' ? m.content : '';
              if (content.length > maxChars) {
                  return {
                      ...m,
                      content: `${content.slice(0, maxChars)}… (+${content.length - maxChars} more chars)`,
                  };
              }
              return m;
          })
        : payload.messages;
    return { ...payload, messages };
}

async function callValsea(prompt) {
    const API_KEY = getTrimmedValseaApiKey();
    if (!API_KEY) {
        throw new Error('Missing VALSEA_API_KEY');
    }

    const model = (process.env.VALSEA_MODEL || DEFAULT_VALSEA_MODEL).trim();
    const payload = {
        model,
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
    };

    try {
        const response = await axios.post(VALSEA_CHAT_URL, payload, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 45000,
        });

        return response?.data?.choices?.[0]?.message?.content;
    } catch (error) {
        const status = error.response?.status;
        const data = error.response?.data;
        console.error('[VALSEA API Error]', {
            message: error.message,
            status,
            responseData: data,
            requestPayload: payloadForLog(payload),
        });
        throw error;
    }
}

app.post('/generate', async (req, res) => {
    try {
        const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const language = typeof req.body?.language === 'string' && req.body.language.trim() ? req.body.language.trim() : 'Vietnamese';
        const prompt = buildPrompt(text, language);

        let content = await callValsea(prompt);
        if (typeof content !== 'string' || !content.trim()) {
            throw new Error('Empty content from VALSEA');
        }

        // Simple min-length guard for demo quality: retry once with an expansion prompt.
        if (content.trim().length < 500) {
            try {
                content = await callValsea(buildExpansionPrompt(content, language));
            } catch (expandError) {
                console.error('[VALSEA Expand Error]:', expandError?.message || expandError);
            }
        }

        return res.json({ result: content });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('[API Error]:', error.message);
            console.error('[API Error] status:', error.response?.status);
            console.error('[API Error] response data:', error.response?.data);
        } else {
            console.error('[API Error]:', error?.message || error);
        }
        return res.json({ result: getMockResponse(), fallback: true });
    }
});

app.listen(PORT, () => {
    logValseaEnvStatus();
    console.log(`StudyMate AI server running at http://localhost:${PORT}`);
});
const lectureTextEl = document.getElementById('lectureInput');
const generateBtn = document.getElementById('generateBtn');
const sampleBtn = document.getElementById('sampleBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const output = document.getElementById('output');
const statusEl = document.getElementById('status');
const langInfoEl = document.getElementById('langInfo');
const fallbackWarningEl = document.getElementById('fallbackWarning');

let lastMarkdown = '';

let selectedLang = 'Vietnamese';

const loadingSteps = [
    '🧠 Analyzing transcript...',
    '🧹 Cleaning speech patterns...',
    '📝 Generating structured notes...',
];

let loadingInterval;

function setStatus(text) {
    statusEl.textContent = text || '';
}

function setLangInfo(text) {
    if (!langInfoEl) return;
    langInfoEl.textContent = text || '';
}

function setFallbackWarning(visible) {
    fallbackWarningEl.classList.toggle('hidden', !visible);
}

function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    generateBtn.textContent = isLoading ? 'Processing...' : 'Generate Notes';
}

function renderMarkdown(markdown) {
    output.innerHTML = marked.parse(markdown);
}

function startLoading() {
    let index = 0;
    setStatus(loadingSteps[index]);

    loadingInterval = setInterval(() => {
        index = (index + 1) % loadingSteps.length;
        setStatus(loadingSteps[index]);
    }, 1200);
}

function stopLoading() {
    clearInterval(loadingInterval);
    loadingInterval = undefined;
}

function detectLanguage(text) {
    const lower = text.toLowerCase();

    const scores = {
        Vietnamese: 0,
        English: 0,
        Japanese: 0,
        Chinese: 0,
        French: 0,
        German: 0,
    };

    // ===== CHARACTER-BASED DETECTION =====
    if (/[\u4e00-\u9fff]/.test(text)) scores.Chinese += 3;
    if (/[\u3040-\u30ff]/.test(text)) scores.Japanese += 3;
    if (/[àáạảãâăđêôơư]/i.test(text)) scores.Vietnamese += 3;

    // ===== KEYWORD DETECTION (word-boundary where it matters) =====
    const keywords = {
        German: [
            'der',
            'die',
            'das',
            'und',
            'ist',
            'nicht',
            'ein',
            'ich',
            'mit',
            'heute',
            'lernen',
            'daten',
            'modell',
        ],
        French: ['le', 'la', 'les', 'et', 'est', 'pas', 'je', 'vous', 'avec', 'pour', 'dans'],
        English: ['the', 'is', 'are', 'and', 'this', 'that', 'we', 'you', 'data', 'model'],
        Vietnamese: ['là', 'của', 'và', 'trong', 'một', 'các', 'được', 'với'],
    };

    for (const lang in keywords) {
        keywords[lang].forEach((word) => {
            if (word.length <= 2) {
                if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) scores[lang] += 1;
                return;
            }
            if (lower.includes(word)) scores[lang] += 1;
        });
    }

    console.log('Language scores:', scores);

    // ===== HANDLE MIXED LANGUAGE (OPTIONAL) =====
    if (scores.Vietnamese > 2 && scores.English > 2) {
        return 'Mixed (VN + EN)';
    }

    // ===== DETERMINE BEST MATCH =====
    let detected = 'English';
    let maxScore = 0;

    for (const lang in scores) {
        if (scores[lang] > maxScore) {
            maxScore = scores[lang];
            detected = lang;
        }
    }

    return detected;
}

const flags = {
    Vietnamese: '🇻🇳',
    English: '🇺🇸',
    Japanese: '🇯🇵',
    Chinese: '🇨🇳',
    French: '🇫🇷',
    German: '🇩🇪',
};

function cleanTranscript(text) {
    const cleaned = text
        .replace(/ờ|à|uh|um/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (!cleaned) return '';
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

const demoTranscripts = [
    'Ờ hôm nay mình học về REST API, basically nó giúp các system communicate với nhau using HTTP methods như GET, POST, PUT, DELETE. Ví dụ client gọi endpoint `/users` rồi server trả JSON về, ok?',
    'Ok hôm nay nói về machine learning nha, nó là một part của AI và nó giúp model learn from data without explicit programming. Uh ví dụ classification: spam vs not spam, mình train model rồi predict.',
    'Ờ database thì mình có normalization, basically để reduce redundancy và improve data consistency. Ví dụ tách bảng Users và Orders, dùng foreign key, tránh duplicate data, rồi query sẽ clean hơn.',
    'Frontend thì mình đang dùng React, basically nó giúp mình build UI components và manage state dễ hơn. Ờ có props, state, và mình render theo data; when state changes thì UI update automatically.',
    'System design thì mình cần nghĩ về scalability, load balancing, caching, và database architecture. Uh traffic tăng thì mình scale horizontally, dùng CDN, queue cho background jobs, và tránh single point of failure.',
    'AI basics: AI là một lĩnh vực lớn, bao gồm machine learning, deep learning và nhiều kỹ thuật khác. Basically ML học từ data, còn deep learning dùng neural networks nhiều layer để learn complex patterns.',
];

async function copyToClipboard(text) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
}

sampleBtn?.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * demoTranscripts.length);
    lectureTextEl.value = demoTranscripts[randomIndex];
    lectureTextEl.focus();
    setStatus('');
    setLangInfo('');
});

document.querySelectorAll('.lang-card').forEach((card) => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.lang-card').forEach((c) => {
            c.classList.remove('active');
            c.classList.remove('bg-blue-600');
            c.classList.remove('text-white');
            c.classList.remove('shadow-md');
            c.classList.add('bg-white');
        });

        card.classList.add('active');
        card.classList.remove('bg-white');
        card.classList.add('bg-blue-600');
        card.classList.add('text-white');
        card.classList.add('shadow-md');

        selectedLang = card.dataset.lang || 'Vietnamese';
    });
});

generateBtn.addEventListener('click', async () => {
    const text = lectureTextEl.value.trim();
    if (!text) {
        setStatus('Please paste a transcript.');
        return;
    }

    let detectedLang = detectLanguage(text);
    if (!detectedLang) detectedLang = 'Unknown';

    if (detectedLang === selectedLang) {
        setLangInfo(`Output Language: ${flags[selectedLang] || ''} ${selectedLang}`);
    } else {
        setLangInfo(
            `Detected: ${flags[detectedLang] || ''} ${detectedLang} → ${flags[selectedLang] || ''} ${selectedLang}`
        );
    }

    const cleaned = cleanTranscript(text);

    setLoading(true);
    startLoading();
    setFallbackWarning(false);
    copyBtn.disabled = true;
    lastMarkdown = '';
    output.innerHTML = '<div class="text-gray-500">Generating notes...</div>';

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language: selectedLang }),
        });

        if (!response.ok) {
            throw new Error(`Request failed (${response.status})`);
        }

        const data = await response.json();
        if (!data || typeof data.result !== 'string') {
            throw new Error('Invalid server response');
        }

        lastMarkdown = `# 🧹 Cleaned Transcript\n\n${cleaned}\n\n${data.result}`;

        const cleanedHtml = `
<div>
  <h2 class="text-xl font-bold text-gray-900 mt-4 mb-2">🧹 Cleaned Transcript</h2>
  <p class="text-xs text-gray-400 mb-1">Cleaned from raw multilingual speech transcript</p>
  <div class="bg-gray-900 text-white p-4 rounded-xl whitespace-pre-wrap break-words mt-4">${cleaned}</div>
</div>
`;

        const notesHtml = marked.parse(data.result);

        output.style.opacity = 0;
        output.innerHTML = cleanedHtml + notesHtml;
        setTimeout(() => {
            output.style.opacity = 1;
        }, 200);

        setFallbackWarning(Boolean(data.fallback));

        copyBtn.disabled = false;
        output.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error(error);
        output.innerHTML = '<div class="text-red-600 font-semibold">Something went wrong</div>';
        setStatus('Try again in a moment.');
        setFallbackWarning(false);
        copyBtn.disabled = true;
        lastMarkdown = '';
    } finally {
        stopLoading();
        setStatus('');
        setLoading(false);
    }
});

copyBtn.addEventListener('click', async () => {
    try {
        await copyToClipboard(lastMarkdown);
        setStatus('Copied to clipboard.');
        setTimeout(() => setStatus(''), 1200);
    } catch (error) {
        console.error(error);
        setStatus('Copy failed. Your browser may block clipboard access.');
    }
});

clearBtn.addEventListener('click', () => {
    lectureTextEl.value = '';
    output.innerHTML = '';
    setStatus('');
    setLangInfo('');
    setFallbackWarning(false);
    copyBtn.disabled = true;
    lastMarkdown = '';
});
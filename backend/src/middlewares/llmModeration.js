const { GoogleGenerativeAI } = require('@google/generative-ai');

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 0 — TEXT NORMALIZATION
// Strips all bypass tricks before any analysis runs
// ═══════════════════════════════════════════════════════════════════════════════
function normalize(text) {
    var s = String(text).toLowerCase();

    // Leet-speak substitutions
    s = s
        .replace(/4/g, 'a')
        .replace(/@/g, 'a')
        .replace(/8/g, 'b')
        .replace(/3/g, 'e')
        .replace(/1/g, 'i')
        .replace(/!/g, 'i')
        .replace(/0/g, 'o')
        .replace(/\$/g, 's')
        .replace(/5/g, 's')
        .replace(/7/g, 't')
        .replace(/\+/g, 't')
        .replace(/ü/g, 'u')
        .replace(/ó/g, 'o');

    // Remove symbols BETWEEN letters (f*ck, f.u.c.k, f-u-c-k etc.)
    s = s.replace(/([a-z])[^a-z0-9\s]{1,3}([a-z])/g, '$1$2');

    // Collapse repeated characters — any 2+ in a row to single char
    // Catches: thaayoli → thayoli, fuuuck → fuck
    s = s.replace(/(.)\1+/g, '$1');

    // Strip all non-alphanumeric non-space chars remaining
    s = s.replace(/[^a-z0-9\s]/g, ' ');

    // Collapse whitespace
    s = s.replace(/\s+/g, ' ').trim();

    return s;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 1 — HARD KEYWORD DICTIONARY
// English + Hindi (romanized) + Malayalam (romanized) common abuses
// ═══════════════════════════════════════════════════════════════════════════════
var BLOCK_WORDS = [
    // ── English profanity ──
    'fuck', 'fuck', 'fuk', 'f u c k', 'fck',
    'shit', 'shyt', 'sht',
    'bitch', 'biatch', 'byatch',
    'asshole', 'ass hole', 'arsehole',
    'bastard', 'bastad',
    'cunt', 'kunt',
    'dick', 'dik',
    'cock', 'cok',
    'pussy', 'puss',
    'whore', 'whor',
    'slut', 'slt',
    'nigger', 'nigga',
    'faggot', 'fag',
    'motherfucker', 'mf',
    'rape', 'rapist',
    'kill yourself', 'kys',
    'go die', 'die bitch',
    'son of a bitch', 'sob',
    'piece of shit', 'pos',
    'idiot', 'moron', 'retard', 'imbecile',
    'stupid bitch', 'dumb fuck',
    'hate you', 'i hate',
    'threat', 'gonna kill', 'will kill', 'im going to kill',

    // ── Hindi (romanized) ──
    'madarchod', 'mc', 'maderchod',
    'bhenchod', 'bc', 'bhen chod', 'benchod',
    'chutiya', 'chutia', 'choot',
    'gandu', 'gaandu',
    'bhosdike', 'bhosdiwale', 'bhosdiwala',
    'harami', 'haram',
    'sala', 'saala',
    'kamina', 'kaminey',
    'randi', 'rande',
    'hijra',
    'bakwaas',
    'lund', 'lauda',
    'gaand', 'gaand mara',
    'teri maa', 'teri behen',
    'kutte', 'kutta',
    'suar',

    // ── Malayalam (romanized) — expanded ──
    'myre', 'myra', 'myree',
    'poda', 'poda patti',
    'thayoli', 'thayole', 'thaayoli', 'thayoly',
    'punda', 'pundachi', 'pundachimone', 'pundaymone',
    'panni', 'panniyude',
    'oomb', 'umbo', 'umba', 'oomba',
    'kundi', 'kunna', 'kunnna',
    'poorr', 'poori', 'pooru',
    'kandam', 'kandathiri',
    'patti', 'pattikku',
    'velakarri',
    'koothichi', 'koothiche',
    'cheriya patti',
    'nayinte mone', 'nayinte mole',
    'avattachi',
    'pallu theri',
    'ninte amme', 'ninte amma',
    'perinthe',
    'thottu poya',
    'kollan', 'porinju',
    'thendi',
    'kazhuthai', 'kazhutha',
    'kandaronam',
    'chakki',
    'mandan', 'mandaakki',
    'pottayi', 'pottan',
    'kaamukan', 'kaampuzhu',

    // ── Personal targeting patterns ──
    'worst principal', 'worst teacher', 'worst professor', 'worst hod',
    'worst director', 'worst warden',
    'useless principal', 'useless teacher', 'useless professor',
    'i hate principal', 'i hate teacher', 'i hate sir', 'i hate madam',
    'principal is', 'teacher is useless', 'hod is',
];

// Words that score as REVIEW (suspicious but not hard-block)
var REVIEW_WORDS = [
    'worst', 'terrible', 'horrible', 'useless', 'pathetic',
    'incompetent', 'disgusting', 'awful', 'trash', 'crap',
    'damn', 'hell', 'bloody', 'freaking', 'crappy',
    'loser', 'liar', 'fraud', 'scammer',
    'shut up', 'shut your',
    'harassment', 'corrupt', 'bribe',
];

function runKeywordFilter(rawText) {
    var norm = normalize(rawText);
    var detected = [];

    // Check BLOCK words
    for (var i = 0; i < BLOCK_WORDS.length; i++) {
        var word = BLOCK_WORDS[i];
        // Build regex that allows optional spaces/symbols between chars for short words
        var pattern = word.split('').join('[\\s\\W]?');
        try {
            var re = new RegExp('\\b' + pattern + '\\b', 'i');
            if (re.test(norm) || norm.includes(word)) {
                detected.push({ word: word, tier: 'block' });
            }
        } catch (e) {
            if (norm.includes(word)) {
                detected.push({ word: word, tier: 'block' });
            }
        }
    }

    // Check REVIEW words (only if not already a block)
    if (detected.length === 0) {
        for (var j = 0; j < REVIEW_WORDS.length; j++) {
            var rw = REVIEW_WORDS[j];
            if (norm.includes(rw)) {
                detected.push({ word: rw, tier: 'review' });
            }
        }
    }

    return detected;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER 2 — GEMINI AI MODERATION
// ═══════════════════════════════════════════════════════════════════════════════
async function runGeminiModeration(title, description, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are a STRICT content moderation AI for a university campus complaint portal in India.
Students submit complaints about infrastructure, academics, hostel, food, and facility issues.

Analyze the complaint title and description below with ZERO tolerance for:
- Profanity in ANY language (English, Hindi, Malayalam, or any other)
- Personal attacks, name-calling, or targeting individuals
- Hate speech or discriminatory language
- Threats or mentions of violence
- Sexual content or explicit language
- Trolling or completely fake/nonsensical content

Complaint Title: "${title}"
Complaint Description: "${description}"

STRICT scoring rules:
- Score 0–30 → BLOCK: Contains clear profanity, abuse, hate speech, threats, or sexual content
- Score 31–60 → REVIEW: Mildly aggressive tone, suspicious urgency, borderline language — legitimate but needs review
- Score 61–100 → ALLOW: Professional, respectful, genuine campus complaint

Return ONLY this exact JSON (no markdown, no extra text):
{
  "trustScore": <number 0-100>,
  "action": "<block|review|allow>",
  "categories": <array from: ["profanity", "abuse", "hate_speech", "threat", "sexual_content", "spam_troll", "mild_tone", "urgent"]>,
  "reasoning": "<one sentence>"
}
`.trim();

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

    const parsed = JSON.parse(jsonStr);

    const trustScore = typeof parsed.trustScore === 'number'
        ? Math.max(0, Math.min(100, Math.round(parsed.trustScore))) : 50;

    const validCategories = ['profanity', 'abuse', 'hate_speech', 'threat', 'sexual_content', 'spam_troll', 'mild_tone', 'urgent'];
    const categories = Array.isArray(parsed.categories)
        ? parsed.categories.filter(function(c) { return validCategories.includes(c); })
        : [];

    const action = ['block', 'review', 'allow'].includes(parsed.action) ? parsed.action : (trustScore <= 40 ? 'block' : trustScore <= 65 ? 'review' : 'allow');

    return { trustScore: trustScore, action: action, categories: categories, reasoning: parsed.reasoning || '', engine: 'gemini-2.0-flash' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED MIDDLEWARE — runs all layers in sequence
// ═══════════════════════════════════════════════════════════════════════════════
async function moderateComplaint(req, res, next) {
    const title = req.body.title || '';
    const description = req.body.description || '';

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required.' });
    }

    // ── LAYER 1: Keyword filter first (fastest, no API needed) ──
    const keywordHits = runKeywordFilter(title + ' ' + description);
    const isKeywordBlock = keywordHits.some(function(h) { return h.tier === 'block'; });

    if (isKeywordBlock) {
        const hitWords = keywordHits.map(function(h) { return h.word; }).join(', ');
        console.warn('[Moderation] BLOCKED by keyword filter — detected:', hitWords);
        return res.status(422).json({
            error: 'Your complaint contains inappropriate language and cannot be submitted. Please keep complaints respectful and factual.',
            flags: ['profanity'],
            blockedBy: 'keyword_filter'
        });
    }

    // ── LAYER 2: Gemini AI (if API key available) ──
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
        try {
            const geminiResult = await runGeminiModeration(title, description, apiKey);

            console.log('[Moderation] Gemini result — score:', geminiResult.trustScore,
                '| action:', geminiResult.action,
                '| categories:', geminiResult.categories,
                '| reason:', geminiResult.reasoning);

            if (geminiResult.action === 'block' || geminiResult.trustScore <= 40) {
                return res.status(422).json({
                    error: 'Your complaint was flagged by our AI moderation system. Please ensure your complaint is respectful and describes a genuine campus issue.',
                    flags: geminiResult.categories,
                    blockedBy: 'gemini_ai'
                });
            }

            // Passed — attach result for controller
            req.moderationResult = {
                trustScore: geminiResult.trustScore,
                flags: geminiResult.categories,
                engine: geminiResult.engine
            };

            // If mild keyword hits exist, also append mild_tone flag
            const hasReviewWords = keywordHits.some(function(h) { return h.tier === 'review'; });
            if (hasReviewWords && !req.moderationResult.flags.includes('mild_tone')) {
                req.moderationResult.flags.push('mild_tone');
                req.moderationResult.trustScore = Math.min(req.moderationResult.trustScore, 60);
            }

            return next();

        } catch (err) {
            // Gemini failed — fall through to keyword-only result
            console.error('[Moderation] Gemini API error, falling back to keyword result:', err.message);
        }
    }

    // ── FALLBACK: No API key / Gemini failed ──
    const hasReviewWords = keywordHits.some(function(h) { return h.tier === 'review'; });

    req.moderationResult = {
        trustScore: hasReviewWords ? 55 : 88,
        flags: hasReviewWords ? ['mild_tone'] : [],
        engine: 'local_keyword'
    };

    console.log('[Moderation] Local fallback — score:', req.moderationResult.trustScore, '| flags:', req.moderationResult.flags);

    return next();
}

module.exports = { moderateComplaint: moderateComplaint };

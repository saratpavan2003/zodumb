export const config = {
  runtime: 'edge',
};

// Who you're asking.
const WHO = {
  boss: { label: 'your boss', tone: 'a direct boss you work with every day.' },
  manager: { label: 'your manager', tone: 'a manager who will need to take this to their own boss.' },
  hr: { label: 'HR', tone: 'HR. Formal, process-minded, wants things in writing.' },
  founder: { label: 'the founder or CEO', tone: 'the founder or CEO of a small company. Busy, big-picture.' },
  client: { label: 'a client', tone: 'a client of a freelancer or contractor. This is a rate increase, not a salary raise.' },
};

// Why you deserve it.
const REASONS = {
  more: 'they have taken on more work and responsibility',
  market: 'their pay is below the market rate for the role',
  tenure: 'they have been in the role a while without a raise',
  results: 'they have delivered strong results',
  offer: 'they have a competing offer elsewhere',
  cost: 'the cost of living has gone up',
};

// Tone. The first three must be genuinely usable.
const TONES = {
  confident: { label: 'Confident', serious: true, tone: 'confident, direct and professional. Clear ask, no apologizing, no hedging.' },
  polite: { label: 'Polite', serious: true, tone: 'warm, polite and professional. Appreciative, but still a clear ask.' },
  data: { label: 'Data-driven', serious: true, tone: 'calm, factual and professional. Leads with contributions and market context.' },
  dramatic: { label: 'Dramatic', serious: false, tone: 'over-the-top and dramatic, like a movie speech, but still a polite request.' },
  absurd: { label: 'Absurd', serious: false, tone: 'silly and absurd. The reasoning gets more ridiculous as it goes.' },
};

const CHANNELS = {
  email: 'an email WITH a subject line and a sign-off',
  slack: 'a short Slack message asking for time to talk about compensation, no greeting/signature',
  script: 'short talking points to say out loud in a meeting, written in first person as natural speech, one idea per line',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { who, reason, tone, channel, hint } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  const w = WHO[who] || WHO.manager;
  const why = REASONS[reason] || REASONS.more;
  const t = TONES[tone] || TONES.confident;
  const chanKey = CHANNELS[channel] ? channel : 'email';
  const chan = CHANNELS[chanKey];
  const details = String(hint || '').trim().slice(0, 160);

  const prompt = `You are Zodumb. Someone wants to ask for a raise and needs you to write the request FOR them.

Who they're asking: ${w.label}. Context: ${w.tone}
Main reason: ${why}.
Tone: ${t.label} — ${t.tone}
Format: write it as ${chan}.
${details ? `Details they gave: "${details}". Use these facts.` : 'They gave no extra details.'}

Return ONLY valid JSON matching this shape:
{
  "title": "<a short name for this approach, max 5 words>",
  "score": <integer 0-100, the odds this gets a yes>,
  "scoreLabel": "<short verdict on those odds, max 6 words>",
  "subject": "<email subject line — ONLY if the format is an email, else empty string>",
  "message": "<the ready-to-send request. Copy-paste ready. No markdown, no asterisks, no square-bracket placeholders like [Name] or [X%]. Under 110 words.>",
  "backup": "<one line to say if they answer 'not right now', max 22 words>"
}

Rules:
${t.serious
  ? `- This must be a genuinely usable, professional request someone could really send. At most one light touch of humor, or none.
- Be specific about the ask (a raise / a rate increase) and propose a conversation.`
  : `- Be FUNNY and commit to the bit, but stay respectful. Never insult the reader or the company.`}
- Never invent facts, numbers, percentages, salaries, dates or achievements that are not in the details they gave. If they gave none, keep it general.
- No placeholders or brackets of any kind.
- Never threaten, lie about a competing offer, or guilt-trip.
- score should feel specific (not a round number).`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 600, responseMimeType: 'application/json' },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return new Response(JSON.stringify({ error: data.error?.message || JSON.stringify(data) }), { status: 500 });
  }

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const result = {
    title: String(parsed.title || 'The Straightforward Ask').slice(0, 60),
    score: clampInt(parsed.score, 0, 100, 57),
    scoreLabel: String(parsed.scoreLabel || '').slice(0, 60) || 'Worth a shot',
    subject: chanKey === 'email' ? String(parsed.subject || '').slice(0, 120) : '',
    message: String(parsed.message || "I'd like to set up some time to talk about my compensation and whether it still reflects my role. When would work for you?"),
    backup: String(parsed.backup || '').slice(0, 180),
    channel: chanKey,
  };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function clampInt(value, min, max, fallback) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

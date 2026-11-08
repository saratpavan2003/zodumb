export const config = {
  runtime: 'edge',
};

// Who you're telling.
const WHO = {
  boss: { label: 'your boss', tone: 'a direct boss you work with every day.' },
  manager: { label: 'your manager', tone: 'a manager who will need to plan for your replacement.' },
  hr: { label: 'HR', tone: 'HR. Formal, process-minded, needs it in writing.' },
  team: { label: 'your team', tone: 'the team you work with. A goodbye announcement, not the formal notice.' },
  client: { label: 'a client', tone: 'a client of a freelancer or contractor who is ending the engagement.' },
};

// Why you're leaving.
const REASONS = {
  newjob: 'they accepted a new job',
  school: 'they are going back to school',
  moving: 'they are moving',
  break: 'they are taking a break for their health and wellbeing',
  ownthing: 'they are starting their own business',
  none: 'they prefer not to give a reason',
};

const NOTICE = {
  two: 'two weeks of notice, last day two weeks from today',
  month: 'one month of notice, last day one month from today',
  today: 'effective immediately, today is the last day',
};

// Tone. The first three must be genuinely usable.
const TONES = {
  professional: { label: 'Professional', serious: true, tone: 'standard, professional and neutral. A clean resignation.' },
  grateful: { label: 'Grateful', serious: true, tone: 'warm and grateful. Thanks them sincerely, leaves on great terms.' },
  brief: { label: 'Brief', serious: true, tone: 'as short as possible while still polite and complete.' },
  dramatic: { label: 'Dramatic', serious: false, tone: 'an over-the-top dramatic farewell speech, but still kind.' },
  absurd: { label: 'Absurd', serious: false, tone: 'silly and absurd. The reason for leaving gets more ridiculous as it goes.' },
};

// Used only if the model's reply can't be parsed. Matches the chosen notice.
const FALLBACK_MESSAGES = {
  two: "Please accept this as my formal resignation. My last day will be two weeks from today. Thank you for the opportunities I've had here, and I'm happy to help with the handover.",
  month: "Please accept this as my formal resignation. My last day will be one month from today. Thank you for the opportunities I've had here, and I'm happy to help with the handover.",
  today: "Please accept this as my formal resignation, effective today. Thank you for the opportunities I've had here.",
};

const CHANNELS = {
  letter: 'a formal resignation letter as an email WITH a subject line and a sign-off',
  slack: 'a short Slack message, no greeting/signature',
  script: 'short talking points to say out loud in a meeting, written in first person as natural speech',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { who, reason, notice, tone, channel, hint } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  const w = WHO[who] || WHO.manager;
  const why = REASONS[reason] || REASONS.newjob;
  const when = NOTICE[notice] || NOTICE.two;
  const t = TONES[tone] || TONES.professional;
  const chanKey = CHANNELS[channel] ? channel : 'letter';
  const chan = CHANNELS[chanKey];
  const details = String(hint || '').trim().slice(0, 160);

  const prompt = `You are Zodumb. Someone is resigning and needs you to write the resignation FOR them.

Who they're telling: ${w.label}. Context: ${w.tone}
Reason: ${why}.
Notice: ${when}.
Tone: ${t.label} — ${t.tone}
Format: write it as ${chan}.
${details ? `Details they gave: "${details}". Use these facts.` : 'They gave no extra details.'}

Return ONLY valid JSON matching this shape:
{
  "title": "<a short name for this exit, max 5 words>",
  "score": <integer 0-100, how intact the bridge stays after this>,
  "scoreLabel": "<short verdict on that number, max 6 words>",
  "subject": "<email subject line — ONLY if the format is a letter/email, else empty string>",
  "message": "<the ready-to-send resignation. Copy-paste ready. No markdown, no asterisks, no square-bracket placeholders like [Name] or [Date]. Under 130 words.>",
  "backup": "<one line to say if they ask why you're leaving or try to change your mind, max 22 words>"
}

Rules:
${t.serious
  ? `- This must be a genuinely usable, professional resignation someone could really send. No humor.
- State clearly that they are resigning and when their last day is (relative to today, never a made-up calendar date). Offer to help with the handover unless the notice is immediate.
- Say nothing negative about the employer, the boss or coworkers.`
  : `- Be FUNNY and commit to the bit, but stay kind. Never insult the employer, the boss or coworkers.
- It must still clearly say they are resigning.`}
- Never invent facts, names, dates, companies or numbers that are not in the details they gave.
- No placeholders or brackets of any kind.
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
    title: String(parsed.title || 'The Clean Exit').slice(0, 60),
    score: clampInt(parsed.score, 0, 100, 57),
    scoreLabel: String(parsed.scoreLabel || '').slice(0, 60) || 'Leaving on good terms',
    subject: chanKey === 'letter' ? String(parsed.subject || '').slice(0, 120) : '',
    message: String(parsed.message || FALLBACK_MESSAGES[notice] || FALLBACK_MESSAGES.two),
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

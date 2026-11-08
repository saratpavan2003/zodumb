export const config = {
  runtime: 'edge',
};

// Who you're messaging — nudges the tone/formality.
const RECIPIENTS = {
  boss: { label: 'your boss', tone: 'a message to a boss. Professional-ish, clearly scrambling.' },
  manager: { label: 'your manager', tone: 'a message to a direct manager who absolutely notices when you clock in.' },
  teacher: { label: 'your teacher', tone: 'a note to a schoolteacher. A student explaining why they will miss first period.' },
  professor: { label: 'your professor', tone: 'an email to a college professor. Big-word energy, zero credibility.' },
  client: { label: 'a client', tone: 'a message to a client you have a meeting with. Smooth, apologetic, "running a few minutes behind".' },
  team: { label: 'the team chat', tone: 'a message to the team/group chat. Casual, chaotic, oversharing.' },
  date: { label: 'your date', tone: 'a message to someone you are meeting for a date. Charming, a little flustered, trying to save the vibe.' },
  friend: { label: 'a friend', tone: 'a message to a friend who is already waiting at the restaurant. Zero filter.' },
};

// How late you are — the excuse has to cover this gap.
const LATENESS = {
  '5': '5 minutes late',
  '15': '15 minutes late',
  '30': '30 minutes late',
  '60': 'about an hour late',
  noon: 'so late it is basically noon',
};

// The believability dial.
const VIBES = {
  believable: { label: 'Believable', tone: 'genuinely plausible and boring. Traffic-level. The kind of excuse nobody questions.' },
  dramatic: { label: 'Dramatic', tone: 'over-the-top and dramatic, with unnecessary detail.' },
  vague: { label: 'Vague', tone: 'suspiciously vague. "Something came up." Zero specifics, maximum mystery.' },
  honest: { label: 'Honest', tone: 'funny and self-aware about the real reason (overslept, hit snooze too many times, could not find a sock).' },
  unhinged: { label: 'Absurd', tone: 'silly and absurd. The reason gets more ridiculous the more you read it.' },
};

const CHANNELS = {
  text: 'a short casual text message',
  slack: 'a Slack message, casual with maybe an emoji, no greeting/signature',
  email: 'a proper email WITH a subject line and a sign-off',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { recipient, lateness, vibe, channel, reason } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  const rec = RECIPIENTS[recipient] || RECIPIENTS.boss;
  const late = LATENESS[lateness] || LATENESS['15'];
  const vib = VIBES[vibe] || VIBES.believable;
  const chanKey = CHANNELS[channel] ? channel : 'text';
  const chan = CHANNELS[chanKey];
  const why = String(reason || '').trim().slice(0, 120);

  const prompt = `You are Zodumb, a shameless excuse-generating machine. Someone is running late and needs you to write the "I'm late" message FOR them.

Recipient: ${rec.label}. Context: ${rec.tone}
How late: ${late}. The excuse must plausibly (or hilariously) cover this much time.
Believability vibe: ${vib.label} — ${vib.tone}
Format: write it as ${chan}.
${why ? `They gave a hint about the excuse to use: "${why}". Build the excuse around this.` : 'No hint given — invent a great excuse.'}

Return ONLY valid JSON matching this shape:
{
  "excuse": "<a short, punchy name for the excuse, max 5 words, e.g. 'The Phantom Traffic Jam'>",
  "believability": <integer 0-100, how likely this is to actually work>,
  "believabilityLabel": "<short verdict on that number, max 6 words>",
  "eta": "<a short, funny promised arrival time or ETA, max 6 words, e.g. 'Arriving 9:14, emotionally 9:40'>",
  "subject": "<email subject line — ONLY if the format is an email, else empty string>",
  "message": "<the ready-to-send message. This is the whole point — make it copy-paste ready. No markdown, no asterisks, no square-bracket placeholders like [Name]. Keep it under 70 words.>",
  "backup": "<one line to say when they ask what happened once you arrive, max 20 words>"
}

Rules:
- Be FUNNY. Commit to the bit. No disclaimers, no "just kidding".
- Never blame a real named person, company, or a serious accident, injury or death. Keep it light.
- The message must be usable as-is — no placeholders, no [brackets].
- Match the believability vibe exactly.
- believability should feel oddly specific (e.g. 73, 12, 91), not a round guess.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 500,
          responseMimeType: 'application/json',
        },
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
    excuse: String(parsed.excuse || 'The Mysterious Delay').slice(0, 60),
    believability: clampInt(parsed.believability, 0, 100, 58),
    believabilityLabel: String(parsed.believabilityLabel || '').slice(0, 60) || 'Results may vary',
    eta: String(parsed.eta || '').slice(0, 60),
    subject: chanKey === 'email' ? String(parsed.subject || '').slice(0, 120) : '',
    message: String(parsed.message || "Running a bit behind this morning, so sorry. On my way and will be there as soon as I can."),
    backup: String(parsed.backup || '').slice(0, 160),
    recipient: rec.label,
    lateness: late,
    vibe: vib.label,
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

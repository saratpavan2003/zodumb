export const config = {
  runtime: 'edge',
};

// Who's asking for money — nudges how close/awkward the refusal should feel.
const ASKERS = {
  friend: { label: 'a friend', tone: 'a regular friend. Warm, a little awkward, wants to keep the friendship.' },
  bestie: { label: 'your best friend', tone: 'a best friend. Deeply loving, brutally familiar, inside-joke energy.' },
  sibling: { label: 'your sibling', tone: 'a brother or sister. Zero filter, decades of receipts, sibling rivalry.' },
  parent: { label: 'your parent', tone: 'a parent asking their adult kid. Respectful but firm, a little role-reversal guilt.' },
  cousin: { label: 'your cousin', tone: 'a cousin. Family-adjacent, will absolutely mention this at the next reunion.' },
  relative: { label: 'an aunt or uncle', tone: 'an aunt or uncle. Polite, slightly formal, "love you but no".' },
  ex: { label: 'your ex', tone: 'an ex. Firm boundaries, a little petty, no reopening anything.' },
  coworker: { label: 'a coworker', tone: 'a coworker. Professional distance, HR-safe, friendly but no.' },
  roommate: { label: 'your roommate', tone: 'a roommate. You share a fridge and they still owe you for utilities.' },
};

// The gentle-to-absurd dial.
const VIBES = {
  gentle: { label: 'Gentle', tone: 'kind, warm and soft. Lets them down easy and keeps the relationship intact.' },
  honest: { label: 'Honest', tone: 'straightforward and real. A clear, respectful no with no fake excuse.' },
  vague: { label: 'Vague', tone: 'suspiciously vague. "Money is tight right now." Zero specifics, maximum mystery.' },
  dramatic: { label: 'Dramatic', tone: 'wildly over-the-top financial tragedy, soap-opera stakes, unnecessary detail.' },
  absurd: { label: 'Absurd', tone: 'completely absurd. The reason is ridiculous and escalates the more you read it.' },
};

const CHANNELS = {
  text: 'a short casual text message',
  email: 'an email WITH a subject line and a sign-off',
  inperson: 'a short script to say out loud in person or on a call, written in first person as natural speech',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { asker, vibe, channel, amount, reason } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  const who = ASKERS[asker] || ASKERS.friend;
  const vib = VIBES[vibe] || VIBES.gentle;
  const chanKey = CHANNELS[channel] ? channel : 'text';
  const chan = CHANNELS[chanKey];
  const amt = String(amount || '').trim().slice(0, 40);
  const why = String(reason || '').trim().slice(0, 120);

  const prompt = `You are Zodumb, a shameless excuse-generating machine. Someone has been asked to lend money and needs you to write the "no" FOR them.

Who's asking: ${who.label}. Context: ${who.tone}
Vibe: ${vib.label} — ${vib.tone}
Format: write it as ${chan}.
${amt ? `They asked to borrow: "${amt}".` : 'The amount was not specified.'}
${why ? `What they said it's for: "${why}". You can reference this.` : ''}

Return ONLY valid JSON matching this shape:
{
  "excuse": "<a short, punchy name for the excuse, max 5 words, e.g. 'The Budget Lockdown'>",
  "survival": <integer 0-100, how likely the relationship survives this message>,
  "survivalLabel": "<short verdict on that number, max 6 words>",
  "subject": "<email subject line — ONLY if the format is an email, else empty string>",
  "message": "<the ready-to-send refusal. This is the whole point — make it copy-paste ready. No markdown, no asterisks, no square-bracket placeholders like [Name]. Keep it under 80 words.>",
  "backup": "<one line to say if they push back or ask again, max 20 words>"
}

Rules:
- Be FUNNY. Commit to the bit. No disclaimers, no "just kidding".
- It must clearly be a NO. Never offer to lend the money, never promise "next time".
- Don't be cruel about their situation. Roast the excuse, not the person asking.
- The message must be usable as-is — no placeholders, no [brackets].
- Match the vibe exactly.
- survival should feel oddly specific (e.g. 73, 12, 91), not a round guess.`;

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
    excuse: String(parsed.excuse || 'The Wallet Lockdown').slice(0, 60),
    survival: clampInt(parsed.survival, 0, 100, 64),
    survivalLabel: String(parsed.survivalLabel || '').slice(0, 60) || 'You will probably be fine',
    subject: chanKey === 'email' ? String(parsed.subject || '').slice(0, 120) : '',
    message: String(parsed.message || "I really wish I could help, but I can't lend money right now. Hope you understand."),
    backup: String(parsed.backup || '').slice(0, 160),
    asker: who.label,
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

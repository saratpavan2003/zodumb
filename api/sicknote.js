export const config = {
  runtime: 'edge',
};

// Who you're sending this to — nudges the tone/formality.
const RECIPIENTS = {
  boss: { label: 'your boss', tone: 'a workplace message to a boss. Professional-ish but clearly avoiding work.' },
  manager: { label: 'your manager', tone: 'a message to a direct manager who definitely tracks your PTO.' },
  hr: { label: 'HR', tone: 'a message to HR. Slightly too formal, suspiciously by-the-book.' },
  teacher: { label: 'your teacher', tone: 'a note to a schoolteacher. A student wriggling out of class.' },
  professor: { label: 'your professor', tone: 'an email to a college professor. Big-word energy, zero credibility.' },
  coach: { label: 'your coach', tone: 'a message to a sports coach who will 100% make you run laps later.' },
  client: { label: 'a client', tone: 'a message to a client. Smooth, deflecting, "circling back Monday".' },
  team: { label: 'the group chat', tone: 'a message to the team/group chat. Casual, chaotic, oversharing.' },
};

// The believability dial — how hard the AI leans into realism vs silliness.
const VIBES = {
  believable: { label: 'Believable', tone: 'genuinely plausible and boring. The kind of excuse nobody questions.' },
  dramatic: { label: 'Dramatic', tone: 'over-the-top and dramatic, with unnecessary detail.' },
  vague: { label: 'Vague', tone: 'suspiciously vague. "Not feeling well." Zero specifics, maximum mystery.' },
  unhinged: { label: 'Absurd', tone: 'silly and oversharing, honest to a fault in a funny way.' },
  emergency: { label: 'Emergency', tone: 'a fake "emergency" that escalates absurdly the more you read it.' },
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

  const { recipient, vibe, channel, symptom } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  const rec = RECIPIENTS[recipient] || RECIPIENTS.boss;
  const vib = VIBES[vibe] || VIBES.believable;
  const chan = CHANNELS[channel] || CHANNELS.text;
  const hint = String(symptom || '').trim().slice(0, 120);

  const prompt = `You are Zodumb, a shameless excuse-generating machine. Someone wants to call in sick and needs you to write the message FOR them.

Recipient: ${rec.label}. Context: ${rec.tone}
Believability vibe: ${vib.label} — ${vib.tone}
Format: write it as ${chan}.
${hint ? `They gave a hint about the excuse to use: "${hint}". Build the excuse around this.` : 'No hint given — invent a great excuse.'}

Return ONLY valid JSON matching this shape:
{
  "ailment": "<a short, punchy name for the excuse/ailment, max 5 words, e.g. 'Aggressive Food Poisoning'>",
  "believability": <integer 0-100, how likely this is to actually work>,
  "believabilityLabel": "<short verdict on that number, max 6 words>",
  "subject": "<email subject line — ONLY if the format is an email, else empty string>",
  "message": "<the ready-to-send message. This is the whole point — make it copy-paste ready. No markdown, no asterisks, no square-bracket placeholders like [Name]. Keep it under 80 words.>",
  "backup": "<one backup line to say if they ask a follow-up question, max 20 words>"
}

Rules:
- Be FUNNY. Commit to the bit. No disclaimers, no "just kidding".
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
    parsed = {
      ailment: 'Mysterious Ailment',
      believability: 42,
      believabilityLabel: 'Nobody will buy this',
      subject: '',
      message: "Hey, not feeling great today — going to have to take the day. Will catch up tomorrow.",
      backup: 'It came on suddenly, honestly.',
    };
  }

  const result = {
    ailment: String(parsed.ailment || 'Mysterious Ailment').slice(0, 60),
    believability: clampInt(parsed.believability, 0, 100, 50),
    believabilityLabel: String(parsed.believabilityLabel || '').slice(0, 60) || 'Results may vary',
    subject: String(parsed.subject || '').slice(0, 120),
    message: String(parsed.message || 'Not feeling well today, taking the day off.'),
    backup: String(parsed.backup || '').slice(0, 160),
    recipient: rec.label,
    vibe: vib.label,
    channel,
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

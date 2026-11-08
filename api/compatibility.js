export const config = {
  runtime: 'edge',
};

// Relationship flavors — each nudges the tone in a different direction.
const RELATIONSHIPS = {
  crushing: {
    label: 'a hopeless crush',
    tone: 'giddy, delusional, "should I text them?" energy. Roast the pining.',
  },
  dating: {
    label: 'dating',
    tone: 'a chaotic couples reading. Roast their dynamic like a nosy aunt.',
  },
  friends: {
    label: 'friends',
    tone: 'best friends. Roast the codependency and shared bad decisions.',
  },
  siblings: {
    label: 'siblings',
    tone: 'sibling rivalry. Roast the lifelong competition, shared trauma, and who Mom loves more.',
  },
  roommates: {
    label: 'roommates',
    tone: 'roommate warfare. Roast the unwashed dishes, unpaid rent, and passive-aggressive fridge notes.',
  },
  coworkers: {
    label: 'coworkers',
    tone: 'office dynamic. Roast the forced proximity, Slack energy, and suspicious "quick syncs".',
  },
  exes: {
    label: 'exes',
    tone: 'post-breakup tension. Roast the history, the lingering drama, and the 2am "u up?" risk.',
  },
  enemies: {
    label: 'sworn enemies',
    tone: 'a long-running rivalry. Roast the beef with lots of drama.',
  },
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { birthday1, birthday2, relationship } = await req.json();

  if (!birthday1 || !birthday2) {
    return new Response(JSON.stringify({ error: 'Two birthdays are required' }), { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  const rel = RELATIONSHIPS[relationship] || RELATIONSHIPS.dating;

  const d1 = new Date(birthday1);
  const d2 = new Date(birthday2);
  const sign1 = getZodiacSign(d1.getMonth() + 1, d1.getDate());
  const sign2 = getZodiacSign(d2.getMonth() + 1, d2.getDate());

  const prompt = `You are Zodumb, a sharp, sarcastic friend who roasts people using their zodiac signs as an excuse. Two people are here for a COMPATIBILITY reading.

Person A: born ${d1.toLocaleString('default', { month: 'long' })} ${d1.getDate()}, sign ${sign1}.
Person B: born ${d2.toLocaleString('default', { month: 'long' })} ${d2.getDate()}, sign ${sign2}.
Their relationship: ${rel.label}.
Vibe for this reading: ${rel.tone}

Return ONLY valid JSON matching this shape:
{
  "score": <integer 0-100, an absurdly specific compatibility percentage>,
  "scoreLabel": "<a short punchy verdict on that number, max 6 words>",
  "reading": "<the funny roast of this pairing, 2-3 sentences, under 65 words, no markdown/asterisks>",
  "redFlags": <integer 0-5>,
  "greenFlags": <integer 0-5>,
  "verdict": "<one ridiculous final ruling, max 10 words>"
}

Rules:
- Be FUNNY, not informative. Commit to the bit. No disclaimers.
- Reference both zodiac signs in creative, absurd ways.
- Make absurd connections between their signs and mundane modern life — group chats, delivery apps, shared Netflix logins, texting habits, that kind of thing.
- Write like a blunt friend giving the tea, not a mystic. Use words like "cosmos," "universe," "stars," "energy," or "align" at most once in the whole reading — lean on the roast, not the astrology-speak.
- The score should feel oddly precise (e.g. 73, 12, 91), not a round guess.`;

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
    // Fallback if the model refuses to return clean JSON.
    parsed = {
      score: 50,
      scoreLabel: 'Buffering, try again',
      reading: 'Something short-circuited trying to read you two. Try again.',
      redFlags: 2,
      greenFlags: 2,
      verdict: 'Inconclusive. Try that again.',
    };
  }

  const result = {
    sign1,
    sign2,
    relationship: rel.label,
    score: clampInt(parsed.score, 0, 100, 50),
    scoreLabel: String(parsed.scoreLabel || '').slice(0, 60) || 'Results inconclusive',
    reading: String(parsed.reading || 'Speechless. Try again.'),
    redFlags: clampInt(parsed.redFlags, 0, 5, 0),
    greenFlags: clampInt(parsed.greenFlags, 0, 5, 0),
    verdict: String(parsed.verdict || '').slice(0, 120) || 'Proceed at your own risk.',
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

function getZodiacSign(month, day) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries ♈';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus ♉';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini ♊';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer ♋';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo ♌';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo ♍';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra ♎';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio ♏';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius ♐';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn ♑';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius ♒';
  return 'Pisces ♓';
}

export const config = {
  runtime: 'edge',
};

const VIBES = [
  "savage roast",
  "absurd and chaotic",
  "sarcastic but sweet",
  "full unhinged chaos",
  "passive aggressive fortune cookie",
  "conspiracy theorist astrologer",
  "overly dramatic soap opera",
  "disappointed parent energy"
];

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { birthday } = await req.json();

  if (!birthday) {
    return new Response(JSON.stringify({ error: 'Birthday is required' }), { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 });
  }

  const date = new Date(birthday);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });
  const age = new Date().getFullYear() - year;

  const zodiacSign = getZodiacSign(date.getMonth() + 1, day);
  const randomVibe = VIBES[Math.floor(Math.random() * VIBES.length)];

  const prompt = `You are Zodumb, the world's most unhinged astrologer. Generate a hilariously funny birthday horoscope for someone born on ${dayOfWeek}, ${month} ${day}, ${year} (they are ${age} years old). Their zodiac sign is ${zodiacSign}.

Vibe for this reading: ${randomVibe}

Rules:
- Be FUNNY. Not informative. Not serious. Funny.
- Reference their specific birth date, day of week, and age in creative ways
- Make absurd "cosmic" connections to random things
- Include a fake "lucky" something (number, food, enemy, color, etc.)
- End with a ridiculous "prophecy" for their future
- Keep it under 200 words
- No disclaimers, no "remember this is just for fun" — just commit to the bit
- Use dramatic cosmic language mixed with mundane modern life observations`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 400 },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return new Response(JSON.stringify({ error: data.error?.message || JSON.stringify(data) }), { status: 500 });
  }

  const horoscope = data.candidates?.[0]?.content?.parts?.[0]?.text || 'The stars are currently buffering. Try again.';

  return new Response(JSON.stringify({ horoscope, vibe: randomVibe, sign: zodiacSign }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
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

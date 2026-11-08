// Cross-links shown under each generator page. Pages filter out their own route.
export const GENERATOR_LINKS = [
  { href: '/sick', text: '🤒 Call In Sick Generator →' },
  { href: '/late', text: '⏰ Late to Work Excuse Generator →' },
  { href: '/money', text: "💸 Why I Can't Lend You Money →" },
  { href: '/raise', text: '📈 Ask for a Raise Generator →' },
  { href: '/resign', text: '👋 Resignation Letter Generator →' },
  { href: '/', text: '✦ Funny Birthday Horoscope →' },
]

export const linksExcept = href => GENERATOR_LINKS.filter(l => l.href !== href)

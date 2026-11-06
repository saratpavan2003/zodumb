import { useState } from 'react'
import { shareOrDownloadCard } from './shareCard'
import { baseStyles } from './styles'
import Actions from './Actions'

const ASKERS = [
  { id: 'friend', emoji: '🙂', label: 'Friend' },
  { id: 'bestie', emoji: '👯', label: 'Best friend' },
  { id: 'sibling', emoji: '🧒', label: 'Sibling' },
  { id: 'parent', emoji: '🧓', label: 'Parent' },
  { id: 'cousin', emoji: '👪', label: 'Cousin' },
  { id: 'relative', emoji: '🎂', label: 'Aunt / Uncle' },
  { id: 'ex', emoji: '💔', label: 'Ex' },
  { id: 'coworker', emoji: '💼', label: 'Coworker' },
  { id: 'roommate', emoji: '🛋️', label: 'Roommate' },
]

const MONEY_VIBES = [
  { id: 'gentle', emoji: '🕊️', label: 'Gentle' },
  { id: 'honest', emoji: '🤝', label: 'Honest' },
  { id: 'vague', emoji: '🌫️', label: 'Vague' },
  { id: 'dramatic', emoji: '🎭', label: 'Dramatic' },
  { id: 'absurd', emoji: '🤪', label: 'Absurd' },
]

const CHANNELS = [
  { id: 'text', label: '💬 Text' },
  { id: 'email', label: '✉ Email' },
  { id: 'inperson', label: '🗣 Say it' },
]

const AMOUNTS = ['$20', '$100', '$500', '$1,000+', 'Rent money']

export default function MoneyApp() {
  const [asker, setAsker] = useState('friend')
  const [vibe, setVibe] = useState('gentle')
  const [channel, setChannel] = useState('text')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [money, setMoney] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [imgBusy, setImgBusy] = useState(false)

  async function getRefusal() {
    setLoading(true)
    setError(null)
    setMoney(null)

    try {
      const res = await fetch('/api/nomoney', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asker, vibe, channel, amount, reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setMoney(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    if (!money) return
    const text = money.channel === 'email' && money.subject
      ? `Subject: ${money.subject}\n\n${money.message}`
      : money.message
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function downloadCard() {
    if (imgBusy) return
    setImgBusy(true)
    setError(null)
    try {
      await shareOrDownloadCard({ mode: 'money', money })
    } catch {
      setError('Could not generate the image. Try again.')
    } finally {
      setImgBusy(false)
    }
  }

  function reset() {
    setMoney(null)
    setReason('')
    setError(null)
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.eyebrow}>THE COSMOS SAY YOUR WALLET IS CLOSED</div>
          <h1 style={styles.title}>ZODUMB</h1>
          <p style={styles.subtitle}>Someone wants a loan. You want to say no.<br />From gentle to absurd. Friendship not guaranteed.</p>
        </header>

        {/* Main card */}
        <main style={styles.card}>

          {/* ---------- INPUT ---------- */}
          {!money && !loading && (
            <div style={styles.inputSection}>
              <div>
                <label style={styles.label}>
                  <span style={styles.labelStar}>✦</span> Who's asking?
                </label>
                <div style={{ ...styles.relRow, marginTop: '0.75rem' }}>
                  {ASKERS.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setAsker(a.id)}
                      style={{ ...styles.relBtn, ...(asker === a.id ? styles.relBtnActive : {}) }}
                    >
                      <span style={styles.relEmoji}>{a.emoji}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.label}>
                  <span style={styles.labelStar}>✦</span> How do you want to say no?
                </label>
                <div style={{ ...styles.vibeRow, marginTop: '0.75rem' }}>
                  {MONEY_VIBES.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setVibe(v.id)}
                      style={{ ...styles.chip, ...(vibe === v.id ? styles.chipActive : {}) }}
                    >
                      {v.emoji} {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.label}>
                  <span style={styles.labelStar}>✦</span> How much? <span style={styles.optional}>(optional)</span>
                </label>
                <div style={{ ...styles.vibeRow, marginTop: '0.75rem' }}>
                  {AMOUNTS.map(a => (
                    <button
                      key={a}
                      onClick={() => setAmount(amount === a ? '' : a)}
                      style={{ ...styles.chip, ...(amount === a ? styles.chipActive : {}) }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.label}>
                  <span style={styles.labelStar}>✦</span> Send it as
                </label>
                <div style={{ ...styles.channelRow, marginTop: '0.75rem' }}>
                  {CHANNELS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setChannel(c.id)}
                      style={{ ...styles.channelBtn, ...(channel === c.id ? styles.channelBtnActive : {}) }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.label} htmlFor="reason">
                  <span style={styles.labelStar}>✦</span> What's it for? <span style={styles.optional}>(optional)</span>
                </label>
                <input
                  id="reason"
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. concert tickets, a 'sure thing' crypto coin…"
                  maxLength={120}
                  style={{ ...styles.input, cursor: 'text', marginTop: '0.75rem' }}
                />
              </div>

              <button onClick={getRefusal} style={styles.button}>
                Say No For Me →
              </button>
              {error && <p style={styles.error}>⚠ {error}</p>}
            </div>
          )}

          {/* ---------- LOADING ---------- */}
          {loading && (
            <div style={styles.loading}>
              <div style={styles.orb} />
              <p style={styles.loadingText}>The cosmos are checking your balance…</p>
              <p style={styles.loadingSubtext}>Insufficient funds. Drafting your no.</p>
            </div>
          )}

          {/* ---------- RESULT ---------- */}
          {money && (
            <div style={styles.result}>
              <div style={styles.resultMeta}>
                <span style={styles.sign}>{money.excuse}</span>
                <span style={styles.vibeBadge}>{money.survival}% friendship survival</span>
              </div>

              <div style={styles.scoreBar}>
                <div style={{ ...styles.scoreFill, width: `${money.survival}%` }} />
              </div>
              <div style={styles.scoreLabelSm}>{money.survivalLabel}</div>

              <div style={styles.divider} />

              {money.channel === 'email' && money.subject && (
                <div style={styles.subjectLine}>
                  <span style={styles.subjectTag}>SUBJECT</span> {money.subject}
                </div>
              )}
              <div style={styles.messageBox}>{money.message}</div>

              {money.backup && (
                <div style={styles.backup}>
                  <span style={styles.backupTag}>IF THEY ASK AGAIN</span> “{money.backup}”
                </div>
              )}

              <div style={styles.divider} />
              <Actions copied={copied} onCopy={copyToClipboard} onReset={reset} onImage={downloadCard} imgBusy={imgBusy} label="refusal" />
            </div>
          )}
        </main>

        {/* Links */}
        <a href="/sick" style={styles.ctaLink}>
          🤒 Need a day off? Try the Call In Sick Generator →
        </a>
        <a href="/" style={styles.ctaLink}>
          ✦ Back to Zodumb Horoscopes
        </a>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>Made with questionable cosmic energy · No wallets were opened</p>
        </footer>

      </div>
    </div>
  )
}

const styles = {
  ...baseStyles,
  vibeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  chip: {
    background: '#12121a',
    border: '1px solid #2a2a3e',
    borderRadius: '20px',
    padding: '0.5rem 0.85rem',
    color: '#7a7890',
    fontSize: '0.8rem',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  chipActive: {
    borderColor: '#7c3aed',
    background: 'rgba(124,58,237,0.15)',
    color: '#e8e6f0',
  },
  channelRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  channelBtn: {
    flex: 1,
    background: '#12121a',
    border: '1px solid #2a2a3e',
    borderRadius: '10px',
    padding: '0.7rem 0.5rem',
    color: '#7a7890',
    fontSize: '0.85rem',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  channelBtnActive: {
    borderColor: '#7c3aed',
    background: 'rgba(124,58,237,0.15)',
    color: '#e8e6f0',
  },
  optional: {
    color: '#3a3a52',
    textTransform: 'none',
    letterSpacing: 'normal',
    fontWeight: 400,
  },
  scoreLabelSm: {
    fontFamily: 'Cormorant Garamond, serif',
    fontStyle: 'italic',
    fontSize: '1rem',
    color: '#9d5ff5',
    textAlign: 'center',
  },
  subjectLine: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: '0.9rem',
    color: '#e8e6f0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    flexWrap: 'wrap',
  },
  subjectTag: {
    fontSize: '0.62rem',
    letterSpacing: '0.12em',
    color: '#f0b429',
    border: '1px solid rgba(240,180,41,0.35)',
    borderRadius: '6px',
    padding: '0.15rem 0.45rem',
  },
  messageBox: {
    background: '#12121a',
    border: '1px solid #2a2a3e',
    borderRadius: '12px',
    padding: '1.25rem 1.4rem',
    color: '#e8e6f0',
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: '1rem',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
  },
  backup: {
    fontFamily: 'Cormorant Garamond, serif',
    fontStyle: 'italic',
    fontSize: '1rem',
    color: '#7a7890',
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.6rem',
    flexWrap: 'wrap',
  },
  backupTag: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontStyle: 'normal',
    fontSize: '0.62rem',
    letterSpacing: '0.12em',
    color: '#7c3aed',
    border: '1px solid rgba(124,58,237,0.4)',
    borderRadius: '6px',
    padding: '0.15rem 0.45rem',
  },
  ctaLink: {
    display: 'block',
    textAlign: 'center',
    textDecoration: 'none',
    background: 'rgba(124,58,237,0.1)',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    color: '#9d5ff5',
    fontSize: '0.9rem',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 500,
    letterSpacing: '0.02em',
    transition: 'all 0.15s',
  },
}

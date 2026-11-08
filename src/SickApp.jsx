import { useState } from 'react'
import { shareOrDownloadCard } from './shareCard'
import { baseStyles } from './styles'
import Actions from './Actions'

const RECIPIENTS = [
  { id: 'boss', emoji: '💼', label: 'Boss' },
  { id: 'manager', emoji: '🧑‍💼', label: 'Manager' },
  { id: 'hr', emoji: '📋', label: 'HR' },
  { id: 'teacher', emoji: '🍎', label: 'Teacher' },
  { id: 'professor', emoji: '🎓', label: 'Professor' },
  { id: 'coach', emoji: '🏃', label: 'Coach' },
  { id: 'client', emoji: '🤝', label: 'Client' },
  { id: 'team', emoji: '👥', label: 'Group chat' },
]

const SICK_VIBES = [
  { id: 'believable', emoji: '✅', label: 'Believable' },
  { id: 'dramatic', emoji: '🎭', label: 'Dramatic' },
  { id: 'vague', emoji: '🌫️', label: 'Vague' },
  { id: 'unhinged', emoji: '🤪', label: 'Absurd' },
  { id: 'emergency', emoji: '🚨', label: 'Emergency' },
]

const CHANNELS = [
  { id: 'text', label: '💬 Text' },
  { id: 'slack', label: '# Slack' },
  { id: 'email', label: '✉ Email' },
]

export default function SickApp() {
  const [recipient, setRecipient] = useState('boss')
  const [vibe, setVibe] = useState('believable')
  const [channel, setChannel] = useState('text')
  const [symptom, setSymptom] = useState('')
  const [sick, setSick] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [imgBusy, setImgBusy] = useState(false)

  async function getSickNote() {
    setLoading(true)
    setError(null)
    setSick(null)

    try {
      const res = await fetch('/api/sicknote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, vibe, channel, symptom }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setSick(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    if (!sick) return
    const text = sick.channel === 'email' && sick.subject
      ? `Subject: ${sick.subject}\n\n${sick.message}`
      : sick.message
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function downloadCard() {
    if (imgBusy) return
    setImgBusy(true)
    setError(null)
    try {
      await shareOrDownloadCard({ mode: 'sick', sick })
    } catch {
      setError('Could not generate the image. Try again.')
    } finally {
      setImgBusy(false)
    }
  }

  function reset() {
    setSick(null)
    setSymptom('')
    setError(null)
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.eyebrow}>FOR WHEN YOU NEED A DAY OFF</div>
          <div style={styles.title}>ZODUMB</div>
          <h1 style={styles.pageH1}>Call In Sick Excuse Generator</h1>
          <p style={styles.subtitle}>Pick your excuse. Send with confidence.<br />Pick a tone, copy it, send it.</p>
        </header>

        {/* Main card */}
        <main style={styles.card}>

          {/* ---------- SICK INPUT ---------- */}
          {!sick && !loading && (
            <div style={styles.inputSection}>
              <div>
                <label style={styles.label}>
                  <span style={styles.labelStar}>✦</span> Who are you dodging?
                </label>
                <div style={{ ...styles.relRow, marginTop: '0.75rem' }}>
                  {RECIPIENTS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRecipient(r.id)}
                      style={{ ...styles.relBtn, ...(recipient === r.id ? styles.relBtnActive : {}) }}
                    >
                      <span style={styles.relEmoji}>{r.emoji}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.label}>
                  <span style={styles.labelStar}>✦</span> Believability
                </label>
                <div style={{ ...styles.vibeRow, marginTop: '0.75rem' }}>
                  {SICK_VIBES.map(v => (
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
                <label style={styles.label} htmlFor="symptom">
                  <span style={styles.labelStar}>✦</span> Excuse hint <span style={styles.optional}>(optional)</span>
                </label>
                <input
                  id="symptom"
                  type="text"
                  value={symptom}
                  onChange={e => setSymptom(e.target.value)}
                  placeholder="e.g. food poisoning, the dog, migraine…"
                  maxLength={120}
                  style={{ ...styles.input, cursor: 'text', marginTop: '0.75rem' }}
                />
              </div>

              <button onClick={getSickNote} style={styles.button}>
                Craft My Excuse →
              </button>
              {error && <p style={styles.error}>⚠ {error}</p>}
            </div>
          )}

          {/* ---------- LOADING ---------- */}
          {loading && (
            <div style={styles.loading}>
              <div style={styles.orb} />
              <p style={styles.loadingText}>Writing your excuse…</p>
              <p style={styles.loadingSubtext}>Finding a reason that works.</p>
            </div>
          )}

          {/* ---------- SICK RESULT ---------- */}
          {sick && (
            <div style={styles.result}>
              <div style={styles.resultMeta}>
                <span style={styles.sign}>{sick.ailment}</span>
                <span style={styles.vibeBadge}>{sick.believability}% believable</span>
              </div>

              <div style={styles.scoreBar}>
                <div style={{ ...styles.scoreFill, width: `${sick.believability}%` }} />
              </div>
              <div style={styles.scoreLabelSm}>{sick.believabilityLabel}</div>

              <div style={styles.divider} />

              {sick.channel === 'email' && sick.subject && (
                <div style={styles.subjectLine}>
                  <span style={styles.subjectTag}>SUBJECT</span> {sick.subject}
                </div>
              )}
              <div style={styles.messageBox}>{sick.message}</div>

              {sick.backup && (
                <div style={styles.backup}>
                  <span style={styles.backupTag}>IF THEY PRY</span> “{sick.backup}”
                </div>
              )}

              <div style={styles.divider} />
              <Actions copied={copied} onCopy={copyToClipboard} onReset={reset} onImage={downloadCard} imgBusy={imgBusy} label="excuse" />
            </div>
          )}
        </main>

        {/* Links */}
        <a href="/late" style={styles.ctaLink}>
          ⏰ Just running late? Try the Late to Work Excuse Generator →
        </a>
        <a href="/money" style={styles.ctaLink}>
          💸 Someone wants a loan? Try Why I Can't Lend You Money →
        </a>
        <a href="/raise" style={styles.ctaLink}>
          📈 Time for more pay? Try the Ask for a Raise Generator →
        </a>
        <a href="/resign" style={styles.ctaLink}>
          👋 Moving on? Try the Resignation Letter Generator →
        </a>
        <a href="/" style={styles.ctaLink}>
          ✦ Back to Zodumb Horoscopes
        </a>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>Made by Zodumb · For entertainment only</p>
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

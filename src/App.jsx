import { useState } from 'react'

const STAR_EMOJIS = ['✦', '✧', '★', '☆', '⋆', '·', '∗']

function randomStar() {
  return STAR_EMOJIS[Math.floor(Math.random() * STAR_EMOJIS.length)]
}

export default function App() {
  const [birthday, setBirthday] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  async function getHoroscope() {
    if (!birthday) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/horoscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthday }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    if (!result) return
    const text = `✦ ZODUMB HOROSCOPE ✦\n\n${result.sign} | ${result.vibe}\n\n${result.horoscope}\n\n— Get yours at zodumb.com`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function reset() {
    setResult(null)
    setBirthday('')
    setError(null)
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.eyebrow}>THE COSMOS ARE JUDGING YOU</div>
          <h1 style={styles.title}>ZODUMB</h1>
          <p style={styles.subtitle}>Enter your birthday. Receive your fate.<br />Accuracy not guaranteed. Chaos is.</p>
        </header>

        {/* Main card */}
        <main style={styles.card}>
          {!result && !loading && (
            <div style={styles.inputSection}>
              <label style={styles.label} htmlFor="birthday">
                <span style={styles.labelStar}>✦</span>
                Your date of birth
              </label>
              <input
                id="birthday"
                type="date"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                style={styles.input}
                max={new Date().toISOString().split('T')[0]}
              />
              <button
                onClick={getHoroscope}
                disabled={!birthday}
                style={{
                  ...styles.button,
                  ...(!birthday ? styles.buttonDisabled : {})
                }}
              >
                Consult the Stars →
              </button>
              {error && <p style={styles.error}>⚠ {error}</p>}
            </div>
          )}

          {loading && (
            <div style={styles.loading}>
              <div style={styles.orb} />
              <p style={styles.loadingText}>The cosmos are deliberating…</p>
              <p style={styles.loadingSubtext}>This may involve arguing with Mercury.</p>
            </div>
          )}

          {result && (
            <div style={styles.result}>
              <div style={styles.resultMeta}>
                <span style={styles.sign}>{result.sign}</span>
                <span style={styles.vibeBadge}>{result.vibe}</span>
              </div>
              <div style={styles.divider} />
              <p style={styles.horoscope}>{result.horoscope}</p>
              <div style={styles.divider} />
              <div style={styles.actions}>
                <button onClick={copyToClipboard} style={styles.copyBtn}>
                  {copied ? '✓ Copied!' : '↗ Share this reading'}
                </button>
                <button onClick={reset} style={styles.resetBtn}>
                  Try another birthday
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>Made with questionable cosmic energy · No stars were harmed</p>
        </footer>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    position: 'relative',
    zIndex: 1,
  },
  container: {
    width: '100%',
    maxWidth: '560px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    textAlign: 'center',
  },
  eyebrow: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: '0.65rem',
    fontWeight: 500,
    letterSpacing: '0.25em',
    color: '#7c3aed',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  },
  title: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: 'clamp(3.5rem, 12vw, 6rem)',
    fontWeight: 900,
    fontStyle: 'italic',
    lineHeight: 1,
    background: 'linear-gradient(135deg, #f0b429 0%, #9d5ff5 50%, #f0b429 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: '0.95rem',
    fontWeight: 300,
    color: '#7a7890',
    lineHeight: 1.7,
  },
  card: {
    background: 'rgba(26, 26, 38, 0.8)',
    border: '1px solid #2a2a3e',
    borderRadius: '16px',
    padding: '2.5rem',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 0 60px rgba(124, 58, 237, 0.08)',
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  label: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: '0.8rem',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#7a7890',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  labelStar: {
    color: '#f0b429',
  },
  input: {
    width: '100%',
    background: '#12121a',
    border: '1px solid #2a2a3e',
    borderRadius: '10px',
    padding: '1rem 1.25rem',
    color: '#e8e6f0',
    fontSize: '1.1rem',
    fontFamily: 'Space Grotesk, sans-serif',
    outline: 'none',
    cursor: 'pointer',
    colorScheme: 'dark',
  },
  button: {
    width: '100%',
    background: 'linear-gradient(135deg, #7c3aed, #9d5ff5)',
    border: 'none',
    borderRadius: '10px',
    padding: '1rem 1.5rem',
    color: '#fff',
    fontSize: '1rem',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s, transform 0.1s',
  },
  buttonDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  error: {
    color: '#ff4d6d',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 0',
  },
  orb: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #9d5ff5, #7c3aed, transparent)',
    boxShadow: '0 0 30px rgba(124,58,237,0.6)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  loadingText: {
    fontFamily: 'Cormorant Garamond, serif',
    fontStyle: 'italic',
    fontSize: '1.1rem',
    color: '#e8e6f0',
  },
  loadingSubtext: {
    fontSize: '0.8rem',
    color: '#7a7890',
  },
  result: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  resultMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  sign: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#f0b429',
  },
  vibeBadge: {
    background: 'rgba(124,58,237,0.2)',
    border: '1px solid rgba(124,58,237,0.4)',
    borderRadius: '20px',
    padding: '0.3rem 0.85rem',
    fontSize: '0.72rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#9d5ff5',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #2a2a3e, transparent)',
  },
  horoscope: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '1.05rem',
    fontStyle: 'italic',
    lineHeight: 1.85,
    color: '#e8e6f0',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  copyBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #7c3aed, #9d5ff5)',
    border: 'none',
    borderRadius: '10px',
    padding: '0.85rem',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  resetBtn: {
    width: '100%',
    background: 'transparent',
    border: '1px solid #2a2a3e',
    borderRadius: '10px',
    padding: '0.85rem',
    color: '#7a7890',
    fontSize: '0.9rem',
    fontFamily: 'Space Grotesk, sans-serif',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    fontSize: '0.72rem',
    color: '#3a3a52',
    letterSpacing: '0.05em',
  },
}

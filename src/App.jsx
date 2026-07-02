import { useState } from 'react'
import { shareOrDownloadCard } from './shareCard'

const RELATIONSHIPS = [
  { id: 'crushing', emoji: '💘', label: 'Crushing' },
  { id: 'dating', emoji: '💕', label: 'Dating' },
  { id: 'friends', emoji: '🧑‍🤝‍🧑', label: 'Friends' },
  { id: 'siblings', emoji: '👯', label: 'Siblings' },
  { id: 'roommates', emoji: '🏠', label: 'Roommates' },
  { id: 'coworkers', emoji: '💼', label: 'Coworkers' },
  { id: 'exes', emoji: '💔', label: 'Exes' },
  { id: 'enemies', emoji: '😤', label: 'Enemies' },
]

export default function App() {
  const [mode, setMode] = useState('solo') // 'solo' | 'beef'

  // Solo horoscope state
  const [birthday, setBirthday] = useState('')
  const [result, setResult] = useState(null)

  // Cosmic Beef state
  const [birthday1, setBirthday1] = useState('')
  const [birthday2, setBirthday2] = useState('')
  const [relationship, setRelationship] = useState('dating')
  const [beef, setBeef] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [imgBusy, setImgBusy] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  function switchMode(next) {
    if (next === mode) return
    setMode(next)
    setError(null)
    setCopied(false)
  }

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

  async function getCompatibility() {
    if (!birthday1 || !birthday2) return
    setLoading(true)
    setError(null)
    setBeef(null)

    try {
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthday1, birthday2, relationship }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setBeef(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    let text
    if (mode === 'solo' && result) {
      text = `✦ ZODUMB HOROSCOPE ✦\n\n${result.sign} | ${result.vibe}\n\n${result.horoscope}\n\n— Get yours at zodumb.com`
    } else if (mode === 'beef' && beef) {
      text = `✦ ZODUMB COSMIC BEEF ✦\n\n${beef.sign1} × ${beef.sign2} — ${beef.relationship}\n\n${beef.score}% · ${beef.scoreLabel}\n🚩 ${beef.redFlags}  🟢 ${beef.greenFlags}\n\n${beef.reading}\n\nVerdict: ${beef.verdict}\n\n— Check yours at zodumb.com`
    } else {
      return
    }
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function downloadCard() {
    if (imgBusy) return
    setImgBusy(true)
    setError(null)
    try {
      await shareOrDownloadCard({ mode, result, beef })
    } catch {
      setError('Could not generate the image. Try again.')
    } finally {
      setImgBusy(false)
    }
  }

  function reset() {
    setResult(null)
    setBeef(null)
    setBirthday('')
    setBirthday1('')
    setBirthday2('')
    setError(null)
  }

  const hasResult = mode === 'solo' ? !!result : !!beef

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.eyebrow}>THE COSMOS ARE JUDGING YOU</div>
          <h1 style={styles.title}>ZODUMB</h1>
          <p style={styles.subtitle}>Enter your birthday. Receive your fate.<br />Accuracy not guaranteed. Chaos is.</p>
        </header>

        {/* Mode toggle */}
        <div style={styles.tabs}>
          <button
            onClick={() => switchMode('solo')}
            style={{ ...styles.tab, ...(mode === 'solo' ? styles.tabActive : {}) }}
          >
            ✦ Solo Reading
          </button>
          <button
            onClick={() => switchMode('beef')}
            style={{ ...styles.tab, ...(mode === 'beef' ? styles.tabActive : {}) }}
          >
            💘 Cosmic Beef
          </button>
        </div>

        {/* Main card */}
        <main style={styles.card}>

          {/* ---------- SOLO INPUT ---------- */}
          {mode === 'solo' && !result && !loading && (
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
                max={today}
              />
              <button
                onClick={getHoroscope}
                disabled={!birthday}
                style={{ ...styles.button, ...(!birthday ? styles.buttonDisabled : {}) }}
              >
                Consult the Stars →
              </button>
              {error && <p style={styles.error}>⚠ {error}</p>}
            </div>
          )}

          {/* ---------- BEEF INPUT ---------- */}
          {mode === 'beef' && !beef && !loading && (
            <div style={styles.inputSection}>
              <div style={styles.dateRow}>
                <div style={styles.dateCol}>
                  <label style={styles.label} htmlFor="b1">
                    <span style={styles.labelStar}>✦</span> You
                  </label>
                  <input
                    id="b1"
                    type="date"
                    value={birthday1}
                    onChange={e => setBirthday1(e.target.value)}
                    style={styles.input}
                    max={today}
                  />
                </div>
                <div style={styles.dateCol}>
                  <label style={styles.label} htmlFor="b2">
                    <span style={styles.labelStar}>✦</span> Them
                  </label>
                  <input
                    id="b2"
                    type="date"
                    value={birthday2}
                    onChange={e => setBirthday2(e.target.value)}
                    style={styles.input}
                    max={today}
                  />
                </div>
              </div>

              <div style={styles.relRow}>
                {RELATIONSHIPS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRelationship(r.id)}
                    style={{ ...styles.relBtn, ...(relationship === r.id ? styles.relBtnActive : {}) }}
                  >
                    <span style={styles.relEmoji}>{r.emoji}</span>
                    {r.label}
                  </button>
                ))}
              </div>

              <button
                onClick={getCompatibility}
                disabled={!birthday1 || !birthday2}
                style={{ ...styles.button, ...(!birthday1 || !birthday2 ? styles.buttonDisabled : {}) }}
              >
                Read the Cosmic Beef →
              </button>
              {error && <p style={styles.error}>⚠ {error}</p>}
            </div>
          )}

          {/* ---------- LOADING ---------- */}
          {loading && (
            <div style={styles.loading}>
              <div style={styles.orb} />
              <p style={styles.loadingText}>The cosmos are deliberating…</p>
              <p style={styles.loadingSubtext}>
                {mode === 'beef' ? 'Cross-referencing your incompatibilities.' : 'This may involve arguing with Mercury.'}
              </p>
            </div>
          )}

          {/* ---------- SOLO RESULT ---------- */}
          {mode === 'solo' && result && (
            <div style={styles.result}>
              <div style={styles.resultMeta}>
                <span style={styles.sign}>{result.sign}</span>
                <span style={styles.vibeBadge}>{result.vibe}</span>
              </div>
              <div style={styles.divider} />
              <p style={styles.horoscope}>{result.horoscope}</p>
              <div style={styles.divider} />
              <Actions copied={copied} onCopy={copyToClipboard} onReset={reset} onImage={downloadCard} imgBusy={imgBusy} label="reading" />
            </div>
          )}

          {/* ---------- BEEF RESULT ---------- */}
          {mode === 'beef' && beef && (
            <div style={styles.result}>
              <div style={styles.beefSigns}>
                <span style={styles.sign}>{beef.sign1}</span>
                <span style={styles.beefX}>×</span>
                <span style={styles.sign}>{beef.sign2}</span>
              </div>

              <div style={styles.scoreWrap}>
                <div style={styles.scoreNum}>{beef.score}%</div>
                <div style={styles.scoreLabel}>{beef.scoreLabel}</div>
                <div style={styles.scoreBar}>
                  <div style={{ ...styles.scoreFill, width: `${beef.score}%` }} />
                </div>
              </div>

              <div style={styles.flags}>
                <span style={styles.flag}>🚩 {beef.redFlags} red</span>
                <span style={styles.flag}>🟢 {beef.greenFlags} green</span>
              </div>

              <div style={styles.divider} />
              <p style={styles.horoscope}>{beef.reading}</p>
              <div style={styles.verdict}>“{beef.verdict}”</div>
              <div style={styles.divider} />
              <Actions copied={copied} onCopy={copyToClipboard} onReset={reset} onImage={downloadCard} imgBusy={imgBusy} label="verdict" />
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

function Actions({ copied, onCopy, onReset, onImage, imgBusy, label }) {
  return (
    <div style={styles.actions}>
      <button onClick={onImage} disabled={imgBusy} style={{ ...styles.copyBtn, ...(imgBusy ? styles.buttonDisabled : {}) }}>
        {imgBusy ? '✦ Summoning image…' : '🖼 Download share card'}
      </button>
      <button onClick={onCopy} style={styles.copyBtnGhost}>
        {copied ? '✓ Copied!' : `↗ Copy this ${label} as text`}
      </button>
      <button onClick={onReset} style={styles.resetBtn}>
        Start over
      </button>
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
    gap: '1.5rem',
  },
  header: {
    textAlign: 'center',
  },
  eyebrow: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: '0.78rem',
    fontWeight: 500,
    letterSpacing: '0.22em',
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
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    background: 'rgba(18, 18, 26, 0.6)',
    border: '1px solid #2a2a3e',
    borderRadius: '12px',
    padding: '0.35rem',
  },
  tab: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    borderRadius: '9px',
    padding: '0.65rem 0.5rem',
    color: '#7a7890',
    fontSize: '0.85rem',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #7c3aed, #9d5ff5)',
    color: '#fff',
    boxShadow: '0 0 20px rgba(124,58,237,0.25)',
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
  dateRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  dateCol: {
    flex: '1 1 180px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
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
  relRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
  },
  relBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.3rem',
    background: '#12121a',
    border: '1px solid #2a2a3e',
    borderRadius: '10px',
    padding: '0.7rem 0.25rem',
    color: '#7a7890',
    fontSize: '0.78rem',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  relBtnActive: {
    borderColor: '#7c3aed',
    background: 'rgba(124,58,237,0.15)',
    color: '#e8e6f0',
  },
  relEmoji: {
    fontSize: '1.2rem',
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
    fontSize: '0.78rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#9d5ff5',
  },
  beefSigns: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
  beefX: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '1.4rem',
    color: '#7a7890',
  },
  scoreWrap: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  scoreNum: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: 'clamp(3rem, 14vw, 4.5rem)',
    fontWeight: 900,
    fontStyle: 'italic',
    lineHeight: 1,
    background: 'linear-gradient(135deg, #f0b429 0%, #9d5ff5 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  scoreLabel: {
    fontFamily: 'Cormorant Garamond, serif',
    fontStyle: 'italic',
    fontSize: '1.05rem',
    color: '#e8e6f0',
  },
  scoreBar: {
    height: '8px',
    borderRadius: '20px',
    background: '#12121a',
    border: '1px solid #2a2a3e',
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: '20px',
    background: 'linear-gradient(90deg, #7c3aed, #9d5ff5, #f0b429)',
    transition: 'width 0.8s ease-out',
  },
  flags: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  flag: {
    fontSize: '0.8rem',
    color: '#7a7890',
    fontFamily: 'Space Grotesk, sans-serif',
    letterSpacing: '0.03em',
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
  verdict: {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: '1.15rem',
    fontStyle: 'italic',
    fontWeight: 700,
    textAlign: 'center',
    color: '#f0b429',
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
  copyBtnGhost: {
    width: '100%',
    background: 'rgba(124,58,237,0.12)',
    border: '1px solid rgba(124,58,237,0.35)',
    borderRadius: '10px',
    padding: '0.85rem',
    color: '#9d5ff5',
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
    fontSize: '0.78rem',
    color: '#3a3a52',
    letterSpacing: '0.05em',
  },
}

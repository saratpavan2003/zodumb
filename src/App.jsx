import { useState } from 'react'
import { shareOrDownloadCard } from './shareCard'
import { baseStyles } from './styles'
import Actions from './Actions'

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

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.eyebrow}>YOUR BIRTHDAY, ROASTED</div>
          <div style={styles.title}>ZODUMB</div>
          <h1 style={styles.pageH1}>Funny Birthday Horoscope &amp; Zodiac Compatibility Generator</h1>
          <p style={styles.subtitle}>Enter your birthday. Get a funny horoscope.<br />For entertainment only.</p>
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
                Get My Horoscope →
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
                Check Our Compatibility →
              </button>
              {error && <p style={styles.error}>⚠ {error}</p>}
            </div>
          )}

          {/* ---------- LOADING ---------- */}
          {loading && (
            <div style={styles.loading}>
              <div style={styles.orb} />
              <p style={styles.loadingText}>Reading your signs…</p>
              <p style={styles.loadingSubtext}>
                {mode === 'beef' ? 'Cross-referencing your incompatibilities.' : 'Looking up your sign.'}
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

        {/* Cross-promo CTA */}
        <a href="/sick" style={styles.ctaLink}>
          🤒 Try our Call In Sick Generator →
        </a>
        <a href="/late" style={styles.ctaLink}>
          ⏰ Running late? Try the Late to Work Excuse Generator →
        </a>
        <a href="/money" style={styles.ctaLink}>
          💸 Someone wants a loan? Say no with style →
        </a>

        <a href="/raise" style={styles.ctaLink}>
          📈 Time for more pay? Try the Ask for a Raise Generator →
        </a>
        <a href="/resign" style={styles.ctaLink}>
          👋 Moving on? Try the Resignation Letter Generator →
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

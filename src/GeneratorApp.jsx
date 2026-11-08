import { useState } from 'react'
import { shareOrDownloadCard } from './shareCard'
import { baseStyles } from './styles'
import Actions from './Actions'

// Config-driven page for the "pick options, get a ready-to-send message"
// generators. Each page passes a config describing its option groups, copy
// and API endpoint. The API returns:
//   { title, score, scoreLabel, subject, message, backup, channel }
export default function GeneratorApp({ config }) {
  const initial = Object.fromEntries(config.groups.map(g => [g.key, g.default]))
  const [choices, setChoices] = useState(initial)
  const [hint, setHint] = useState('')
  const [data, setData] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [imgBusy, setImgBusy] = useState(false)

  function choose(key, value) {
    setChoices(c => ({ ...c, [key]: value }))
  }

  async function generate() {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const res = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...choices, hint }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Something went wrong')
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    if (!data) return
    const text = data.subject ? `Subject: ${data.subject}\n\n${data.message}` : data.message
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function downloadCard() {
    if (imgBusy) return
    setImgBusy(true)
    setError(null)
    try {
      await shareOrDownloadCard({
        mode: 'generic',
        generic: { ...data, scoreName: config.scoreName },
        filename: config.shareFilename,
        shareText: config.shareText,
      })
    } catch {
      setError('Could not generate the image. Try again.')
    } finally {
      setImgBusy(false)
    }
  }

  function reset() {
    setData(null)
    setHint('')
    setError(null)
  }

  function renderGroup(g) {
    if (g.style === 'tiles') {
      return (
        <div style={{ ...styles.relRow, marginTop: '0.75rem' }}>
          {g.options.map(o => (
            <button
              key={o.id}
              onClick={() => choose(g.key, o.id)}
              style={{ ...styles.relBtn, ...(choices[g.key] === o.id ? styles.relBtnActive : {}) }}
            >
              <span style={styles.relEmoji}>{o.emoji}</span>
              {o.label}
            </button>
          ))}
        </div>
      )
    }
    if (g.style === 'channel') {
      return (
        <div style={{ ...styles.channelRow, marginTop: '0.75rem' }}>
          {g.options.map(o => (
            <button
              key={o.id}
              onClick={() => choose(g.key, o.id)}
              style={{ ...styles.channelBtn, ...(choices[g.key] === o.id ? styles.channelBtnActive : {}) }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )
    }
    return (
      <div style={{ ...styles.vibeRow, marginTop: '0.75rem' }}>
        {g.options.map(o => (
          <button
            key={o.id}
            onClick={() => choose(g.key, o.id)}
            style={{ ...styles.chip, ...(choices[g.key] === o.id ? styles.chipActive : {}) }}
          >
            {o.emoji ? `${o.emoji} ${o.label}` : o.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.eyebrow}>{config.eyebrow}</div>
          <div style={styles.title}>ZODUMB</div>
          <h1 style={styles.pageH1}>{config.h1}</h1>
          <p style={styles.subtitle}>{config.subtitle[0]}<br />{config.subtitle[1]}</p>
        </header>

        {/* Main card */}
        <main style={styles.card}>

          {/* ---------- INPUT ---------- */}
          {!data && !loading && (
            <div style={styles.inputSection}>
              {config.groups.map(g => (
                <div key={g.key}>
                  <label style={styles.label}>
                    <span style={styles.labelStar}>✦</span> {g.label}
                  </label>
                  {renderGroup(g)}
                </div>
              ))}

              <div>
                <label style={styles.label} htmlFor="hint">
                  <span style={styles.labelStar}>✦</span> {config.hint.label} <span style={styles.optional}>(optional)</span>
                </label>
                <input
                  id="hint"
                  type="text"
                  value={hint}
                  onChange={e => setHint(e.target.value)}
                  placeholder={config.hint.placeholder}
                  maxLength={160}
                  style={{ ...styles.input, cursor: 'text', marginTop: '0.75rem' }}
                />
              </div>

              <button onClick={generate} style={styles.button}>
                {config.button}
              </button>
              {error && <p style={styles.error}>⚠ {error}</p>}
            </div>
          )}

          {/* ---------- LOADING ---------- */}
          {loading && (
            <div style={styles.loading}>
              <div style={styles.orb} />
              <p style={styles.loadingText}>{config.loading[0]}</p>
              <p style={styles.loadingSubtext}>{config.loading[1]}</p>
            </div>
          )}

          {/* ---------- RESULT ---------- */}
          {data && (
            <div style={styles.result}>
              <div style={styles.resultMeta}>
                <span style={styles.sign}>{data.title}</span>
                <span style={styles.vibeBadge}>{data.score}% {config.scoreName}</span>
              </div>

              <div style={styles.scoreBar}>
                <div style={{ ...styles.scoreFill, width: `${data.score}%` }} />
              </div>
              <div style={styles.scoreLabelSm}>{data.scoreLabel}</div>

              <div style={styles.divider} />

              {data.subject && (
                <div style={styles.subjectLine}>
                  <span style={styles.subjectTag}>SUBJECT</span> {data.subject}
                </div>
              )}
              <div style={styles.messageBox}>{data.message}</div>

              {data.backup && (
                <div style={styles.backup}>
                  <span style={styles.backupTag}>{config.backupTag}</span> “{data.backup}”
                </div>
              )}

              <div style={styles.divider} />
              <Actions copied={copied} onCopy={copyToClipboard} onReset={reset} onImage={downloadCard} imgBusy={imgBusy} label={config.copyLabel} />
            </div>
          )}
        </main>

        {/* Links to the other generators */}
        {config.links.map(l => (
          <a key={l.href} href={l.href} style={styles.ctaLink}>{l.text}</a>
        ))}

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

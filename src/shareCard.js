// Generates a shareable PNG card (1080×1350, IG-friendly) from a reading,
// then either invokes the native share sheet (mobile) or downloads it.

const W = 1080
const H = 1920
const PAD = 90

const SERIF = '"Cormorant Garamond", Georgia, serif'
const SANS = '"Space Grotesk", system-ui, sans-serif'

const COLORS = {
  bg: '#0a0a0f',
  text: '#e8e6f0',
  muted: '#7a7890',
  gold: '#f0b429',
  purple: '#7c3aed',
  purpleGlow: '#9d5ff5',
  border: '#2a2a3e',
  deep: '#12121a',
}

// Make sure the custom fonts are actually rasterizable before we draw.
async function ensureFonts() {
  if (!document.fonts) return
  try {
    await Promise.all([
      document.fonts.load('900 italic 130px "Cormorant Garamond"'),
      document.fonts.load('700 italic 48px "Cormorant Garamond"'),
      document.fonts.load('500 28px "Space Grotesk"'),
    ])
    await document.fonts.ready
  } catch {
    // If font loading hiccups, we still draw with fallbacks.
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Wrap text to a max width, returning an array of lines.
function wrapLines(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawWrapped(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = wrapLines(ctx, text, maxWidth)
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight))
  return y + lines.length * lineHeight
}

function drawBackground(ctx) {
  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, W, H)

  // Cosmic glows
  const g1 = ctx.createRadialGradient(W * 0.2, H * 0.15, 0, W * 0.2, H * 0.15, 700)
  g1.addColorStop(0, 'rgba(124,58,237,0.22)')
  g1.addColorStop(1, 'rgba(124,58,237,0)')
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, W, H)

  const g2 = ctx.createRadialGradient(W * 0.85, H * 0.9, 0, W * 0.85, H * 0.9, 700)
  g2.addColorStop(0, 'rgba(240,180,41,0.14)')
  g2.addColorStop(1, 'rgba(240,180,41,0)')
  ctx.fillStyle = g2
  ctx.fillRect(0, 0, W, H)

  // Scattered stars (deterministic-ish, just decorative)
  for (let i = 0; i < 70; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1
    const y = (Math.sin(i * 78.233) * 12543.987) % 1
    const px = Math.abs(x) * W
    const py = Math.abs(y) * H
    const r = Math.abs(Math.sin(i)) * 1.6 + 0.4
    ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.abs(Math.cos(i)) * 0.35})`
    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Border frame
  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 2
  roundRect(ctx, 24, 24, W - 48, H - 48, 28)
  ctx.stroke()
}

function drawHeader(ctx) {
  ctx.textAlign = 'center'

  ctx.fillStyle = COLORS.purple
  ctx.font = `500 26px ${SANS}`
  ctx.fillText('T H E   C O S M O S   A R E   J U D G I N G   Y O U', W / 2, 240)

  const grad = ctx.createLinearGradient(W * 0.25, 0, W * 0.75, 0)
  grad.addColorStop(0, COLORS.gold)
  grad.addColorStop(0.5, COLORS.purpleGlow)
  grad.addColorStop(1, COLORS.gold)
  ctx.fillStyle = grad
  ctx.font = `900 italic 160px ${SERIF}`
  ctx.fillText('ZODUMB', W / 2, 400)
}

function drawFooter(ctx) {
  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.gold
  ctx.font = `500 32px ${SANS}`
  ctx.fillText('zodumb.com', W / 2, H - 110)
}

function drawDivider(ctx, y) {
  const grad = ctx.createLinearGradient(PAD, 0, W - PAD, 0)
  grad.addColorStop(0, 'rgba(42,42,62,0)')
  grad.addColorStop(0.5, 'rgba(42,42,62,1)')
  grad.addColorStop(1, 'rgba(42,42,62,0)')
  ctx.strokeStyle = grad
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(W - PAD, y)
  ctx.stroke()
}

function renderSolo(ctx, result) {
  ctx.textAlign = 'center'

  ctx.fillStyle = COLORS.gold
  ctx.font = `700 italic 62px ${SERIF}`
  ctx.fillText(result.sign, W / 2, 620)

  ctx.fillStyle = COLORS.purpleGlow
  ctx.font = `500 30px ${SANS}`
  ctx.fillText(String(result.vibe || '').toUpperCase(), W / 2, 690)

  drawDivider(ctx, 780)

  ctx.fillStyle = COLORS.text
  ctx.font = `700 italic 52px ${SERIF}`
  drawWrapped(ctx, result.horoscope, W / 2, 920, W - PAD * 2, 78)
}

function renderBeef(ctx, beef) {
  ctx.textAlign = 'center'

  // Signs
  ctx.fillStyle = COLORS.gold
  ctx.font = `700 italic 52px ${SERIF}`
  ctx.fillText(`${beef.sign1}   ×   ${beef.sign2}`, W / 2, 600)

  // Big score
  const grad = ctx.createLinearGradient(W * 0.3, 0, W * 0.7, 0)
  grad.addColorStop(0, COLORS.gold)
  grad.addColorStop(1, COLORS.purpleGlow)
  ctx.fillStyle = grad
  ctx.font = `900 italic 220px ${SERIF}`
  ctx.fillText(`${beef.score}%`, W / 2, 850)

  // Score label
  ctx.fillStyle = COLORS.text
  ctx.font = `700 italic 44px ${SERIF}`
  ctx.fillText(beef.scoreLabel, W / 2, 930)

  // Score bar
  const barW = W - PAD * 2
  const barX = PAD
  const barY = 985
  ctx.fillStyle = COLORS.deep
  roundRect(ctx, barX, barY, barW, 18, 9)
  ctx.fill()
  const fillW = Math.max(18, (barW * beef.score) / 100)
  const bg = ctx.createLinearGradient(barX, 0, barX + barW, 0)
  bg.addColorStop(0, COLORS.purple)
  bg.addColorStop(0.6, COLORS.purpleGlow)
  bg.addColorStop(1, COLORS.gold)
  ctx.fillStyle = bg
  roundRect(ctx, barX, barY, fillW, 18, 9)
  ctx.fill()

  // Flags
  ctx.fillStyle = COLORS.muted
  ctx.font = `500 34px ${SANS}`
  ctx.fillText(`🚩 ${beef.redFlags} red      🟢 ${beef.greenFlags} green`, W / 2, 1090)

  drawDivider(ctx, 1150)

  // Reading
  ctx.fillStyle = COLORS.text
  ctx.font = `700 italic 48px ${SERIF}`
  const afterReading = drawWrapped(ctx, beef.reading, W / 2, 1270, W - PAD * 2, 70)

  // Verdict
  ctx.fillStyle = COLORS.gold
  ctx.font = `700 italic 50px ${SERIF}`
  drawWrapped(ctx, `“${beef.verdict}”`, W / 2, afterReading + 60, W - PAD * 2, 64)
}

export async function generateShareImage({ mode, result, beef }) {
  await ensureFonts()

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'alphabetic'

  drawBackground(ctx)
  drawHeader(ctx)

  if (mode === 'beef' && beef) renderBeef(ctx, beef)
  else if (mode === 'solo' && result) renderSolo(ctx, result)

  drawFooter(ctx)
  return canvas
}

// Share the card via the native share sheet where possible, else download it.
export async function shareOrDownloadCard({ mode, result, beef }) {
  const canvas = await generateShareImage({ mode, result, beef })
  const blob = await new Promise(res => canvas.toBlob(res, 'image/png'))
  if (!blob) throw new Error('Could not render image')

  const filename = mode === 'beef' ? 'zodumb-cosmic-beef.png' : 'zodumb-horoscope.png'
  const file = new File([blob], filename, { type: 'image/png' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Zodumb',
        text: mode === 'beef' ? 'Our cosmic compatibility 💘' : 'My unhinged horoscope ✦',
      })
      return 'shared'
    } catch (err) {
      // User cancelled the share sheet — don't fall back to a download.
      if (err && err.name === 'AbortError') return 'cancelled'
      // Otherwise fall through to download.
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return 'downloaded'
}

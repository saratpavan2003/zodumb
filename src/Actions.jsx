import { baseStyles } from './styles'

// Shared result-card action row (download share card / copy as text / start over),
// used by both the main app (Solo/Beef) and standalone pages like SickApp.
export default function Actions({ copied, onCopy, onReset, onImage, imgBusy, label }) {
  return (
    <div style={baseStyles.actions}>
      <button onClick={onImage} disabled={imgBusy} style={{ ...baseStyles.copyBtn, ...(imgBusy ? baseStyles.buttonDisabled : {}) }}>
        {imgBusy ? '✦ Summoning image…' : '🖼 Download share card'}
      </button>
      <button onClick={onCopy} style={baseStyles.copyBtnGhost}>
        {copied ? '✓ Copied!' : `↗ Copy this ${label} as text`}
      </button>
      <button onClick={onReset} style={baseStyles.resetBtn}>
        Start over
      </button>
    </div>
  )
}

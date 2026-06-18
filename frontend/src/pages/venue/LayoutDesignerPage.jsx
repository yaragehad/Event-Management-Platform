import { useState, useRef, useCallback, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { saveLayout, getLayout, getAllVenues } from '../../services/venueService'
import { getOrganizerStaff } from '../../services/organizerService'
import { AuthContext } from '../../context/AuthContext'

const COLORS = {
  accent: '#C4622D',
  accentLight: '#F5EDE8',
  cream: '#FBF7F4',
  border: '#EDE0D9',
  text: '#2C1810',
  textMuted: '#8B6555',
  white: '#FFFFFF',
  green: '#2D7A4F',
  greenBg: '#E8F5EE',
  red: '#C0392B',
  redBg: '#FDECEA',
}

const ELEMENT_DEFS = [
  { type: 'Round Table', color: '#8B5E3C', category: 'Tables' },
  { type: 'Rect Table',  color: '#6B4226', category: 'Tables' },
  { type: 'Chair',       color: '#C4622D', category: 'Seating' },
  { type: 'Stage',       color: '#5B4DB5', category: 'Zones' },
  { type: 'Dance Floor', color: '#B5384D', category: 'Zones' },
  { type: 'Bar',         color: '#2D7A4F', category: 'Zones' },
  { type: 'Exit',        color: '#C0392B', category: 'Markers' },
  { type: 'Restroom',    color: '#2D5F7A', category: 'Markers' },
]

const CATEGORIES = ['Tables', 'Seating', 'Zones', 'Markers']

function getElementSize(type) {
  const sizes = {
    'Round Table': { w: 80, h: 80 },
    'Rect Table':  { w: 110, h: 70 },
    'Chair':       { w: 50, h: 50 },
    'Stage':       { w: 140, h: 70 },
    'Dance Floor': { w: 110, h: 110 },
    'Bar':         { w: 110, h: 55 },
    'Exit':        { w: 55, h: 55 },
    'Restroom':    { w: 55, h: 55 },
  }
  return sizes[type] || { w: 60, h: 60 }
}

// Draws the element shape on a canvas context
function drawElement(ctx, type, color, w, h, rotation) {
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-w / 2, -h / 2)

  ctx.fillStyle = color
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 2

  if (type === 'Round Table') {
    // Main circle
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    // Chairs around it
    const chairPositions = [0, 45, 90, 135, 180, 225, 270, 315]
    chairPositions.forEach(angle => {
      const rad = (angle * Math.PI) / 180
      const cx = w / 2 + (w / 2 - 2) * Math.cos(rad)
      const cy = h / 2 + (h / 2 - 2) * Math.sin(rad)
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fill()
    })
  } else if (type === 'Rect Table') {
    // Table surface
    ctx.beginPath()
    ctx.roundRect(8, 8, w - 16, h - 16, 4)
    ctx.fill()
    ctx.stroke()
    // Chairs top and bottom
    ;[12, w - 24].forEach(x => {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.beginPath()
      ctx.roundRect(x, 0, 16, 7, 2)
      ctx.fill()
      ctx.beginPath()
      ctx.roundRect(x, h - 7, 16, 7, 2)
      ctx.fill()
    })
    // Chairs left and right
    ;[8, h - 20].forEach(y => {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.beginPath()
      ctx.roundRect(0, y, 7, 14, 2)
      ctx.fill()
      ctx.beginPath()
      ctx.roundRect(w - 7, y, 7, 14, 2)
      ctx.fill()
    })
  } else if (type === 'Chair') {
    // Back
    ctx.beginPath()
    ctx.roundRect(4, 2, w - 8, h * 0.45, 3)
    ctx.fill()
    ctx.stroke()
    // Seat
    ctx.fillStyle = color
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.roundRect(2, h * 0.5, w - 4, h * 0.3, 3)
    ctx.fill()
    ctx.globalAlpha = 1
    // Legs
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.beginPath()
    ctx.roundRect(4, h * 0.82, 6, h * 0.16, 2)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(w - 10, h * 0.82, 6, h * 0.16, 2)
    ctx.fill()
  } else if (type === 'Stage') {
    ctx.beginPath()
    ctx.roundRect(2, 6, w - 4, h - 8, 4)
    ctx.fill()
    ctx.stroke()
    // Steps
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.beginPath()
    ctx.roundRect(2, h - 8, w - 4, 5, 2)
    ctx.fill()
    // Spotlights
    ;[w * 0.2, w * 0.5, w * 0.8].forEach(x => {
      ctx.fillStyle = 'rgba(255,255,0,0.4)'
      ctx.beginPath()
      ctx.arc(x, h * 0.4, 5, 0, Math.PI * 2)
      ctx.fill()
    })
    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = 'bold 11px Segoe UI'
    ctx.textAlign = 'center'
    ctx.fillText('STAGE', w / 2, h * 0.65)
  } else if (type === 'Dance Floor') {
    ctx.beginPath()
    ctx.roundRect(2, 2, w - 4, h - 4, 4)
    ctx.fill()
    // Checkerboard
    const cols = 4, rows = 4
    const tw = (w - 4) / cols, th = (h - 4) / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.25)'
          ctx.fillRect(2 + c * tw, 2 + r * th, tw, th)
        }
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = 'bold 10px Segoe UI'
    ctx.textAlign = 'center'
    ctx.fillText('DANCE FLOOR', w / 2, h / 2 + 4)
  } else if (type === 'Bar') {
    ctx.beginPath()
    ctx.roundRect(2, 6, w - 4, h - 8, 4)
    ctx.fill()
    ctx.stroke()
    // Counter top
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.beginPath()
    ctx.roundRect(2, 6, w - 4, 8, 4)
    ctx.fill()
    // Glasses
    ;[w * 0.25, w * 0.5, w * 0.75].forEach(x => {
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.beginPath()
      ctx.arc(x, h * 0.62, 4, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = 'bold 10px Segoe UI'
    ctx.textAlign = 'center'
    ctx.fillText('BAR', w / 2, h * 0.88)
  } else if (type === 'Exit') {
    ctx.beginPath()
    ctx.roundRect(2, 2, w - 4, h - 4, 4)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = 'bold 12px Segoe UI'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('EXIT', w / 2, h / 2)
  } else if (type === 'Restroom') {
    ctx.beginPath()
    ctx.roundRect(2, 2, w - 4, h - 4, 4)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = '20px Segoe UI'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🚻', w / 2, h / 2)
  } else {
    ctx.beginPath()
    ctx.roundRect(2, 2, w - 4, h - 4, 4)
    ctx.fill()
  }

  ctx.restore()
}

// Canvas-based element renderer
function ElementCanvas({ type, color, rotation = 0, width, height, isActive, isDragging }) {
  const canvasRef = useRef(null)
  const dpr = window.devicePixelRatio || 1


  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, width, height)
    ctx.clearRect(0, 0, width, height)
    drawElement(ctx, type, color, width, height, rotation)

    // Active glow border
    if (isActive) {
      ctx.strokeStyle = '#C4622D'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(1, 1, width - 2, height - 2, 6)
      ctx.stroke()
    }
  }, [type, color, rotation, width, height, isActive])

  return (
    <canvas
      ref={canvasRef}
      width={width * dpr}
      height={height * dpr}
      style={{
        width: width,
        height: height,
        display: 'block',
        filter: isDragging
          ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.35))'
          : isActive
          ? 'drop-shadow(0 0 6px #C4622D)'
          : 'none',
        transition: isDragging ? 'none' : 'filter 0.15s'
      }}
    />
  )
}

export default function LayoutDesignerPage() {
  const navigate = useNavigate()
  const { venueId: venueIdParam } = useParams()
  const currentVenueId = venueIdParam ? parseInt(venueIdParam) : 1
  const { user } = useContext(AuthContext)
  const canvasAreaRef = useRef(null)
  const [placed, setPlaced] = useState([])
  const [selected, setSelected] = useState('Round Table')
  const [draggingId, setDraggingId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [activeEl, setActiveEl] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Tables')
  const [showGrid, setShowGrid] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [staffList, setStaffList] = useState([])
  const [selectedStaff, setSelectedStaff] = useState([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [shareConfirmed, setShareConfirmed] = useState(null)
  const [sharing, setSharing] = useState(false)
  const [showSaveDropdown, setShowSaveDropdown] = useState(false)
  const [venues, setVenues] = useState([])
  const [venuesLoading, setVenuesLoading] = useState(false)
  const saveDropdownRef = useRef(null)

  // Load existing layout when venueId is present in the URL
  useEffect(() => {
    if (!venueIdParam) return
    getLayout(parseInt(venueIdParam))
      .then(res => {
        if (res.data?.elements?.length) {
          setPlaced(res.data.elements)
          setSaved(true)
        }
      })
      .catch(() => {})
  }, [venueIdParam])

  // Close dropdown on outside click
  useEffect(() => {
    if (!showSaveDropdown) return
    const handler = (e) => {
      if (saveDropdownRef.current && !saveDropdownRef.current.contains(e.target)) {
        setShowSaveDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSaveDropdown])

  const colorOf = (type) => ELEMENT_DEFS.find(e => e.type === type)?.color || '#888'

  // Toggle selected element — click same to deselect
  const handleSelectElement = (type) => {
    setSelected(prev => prev === type ? null : type)
  }

  const handleCanvasClick = (e) => {
  if (draggingId || !selected) return
  const rect = canvasAreaRef.current.getBoundingClientRect()
  const { w, h } = getElementSize(selected)
  const x = Math.round(e.clientX - rect.left - w / 2)
  const y = Math.round(e.clientY - rect.top - h / 2)
  if (x < 0 || y < 0 || x + w > rect.width || y + h > rect.height) return
  const newId = Date.now()
  setPlaced(prev => [...prev, { type: selected, x, y, id: newId, rotation: 0 }])
  setActiveEl(newId)
  setSaved(false)
}

  const handleElementMouseDown = (e, id) => {
    e.stopPropagation()
    const el = placed.find(p => p.id === id)
    if (!el) return
    const rect = canvasAreaRef.current.getBoundingClientRect()
    setDraggingId(id)
    setActiveEl(id)
    setDragOffset({
      x: e.clientX - rect.left - el.x,
      y: e.clientY - rect.top - el.y
    })
  }

  const handleMouseMove = useCallback((e) => {
    if (!draggingId) return
    const rect = canvasAreaRef.current.getBoundingClientRect()
    const el = placed.find(p => p.id === draggingId)
    if (!el) return
    const { w, h } = getElementSize(el.type)
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - w))
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - h))
    setPlaced(prev => prev.map(el => el.id === draggingId ? { ...el, x, y } : el))
  }, [draggingId, dragOffset, placed])

  const handleMouseUp = useCallback(() => {
    if (draggingId) { setDraggingId(null); setSaved(false) }
  }, [draggingId])

  // Rotate active element by 45 degrees
  const handleRotate = () => {
    if (!activeEl) return
    setPlaced(prev => prev.map(el =>
      el.id === activeEl ? { ...el, rotation: ((el.rotation || 0) + 45) % 360 } : el
    ))
    setSaved(false)
  }

  const handleRemoveActive = () => {
    if (!activeEl) return
    setPlaced(prev => prev.filter(el => el.id !== activeEl))
    setActiveEl(null)
    setSaved(false)
  }

  const handleClear = () => {
    if (!placed.length) return
    if (window.confirm('Clear the entire layout?')) {
      setPlaced([])
      setActiveEl(null)
      setSaved(false)
    }
  }

  const handleOpenSaveDropdown = async () => {
    if (!placed.length) { alert('Add some elements first.'); return }
    setShowSaveDropdown(true)
    if (!venues.length) {
      setVenuesLoading(true)
      try {
        const res = await getAllVenues()
        setVenues(Array.isArray(res.data) ? res.data : [])
      } catch {
        setVenues([])
      } finally {
        setVenuesLoading(false)
      }
    }
  }

  const handleSaveToVenue = async (venueId) => {
    setShowSaveDropdown(false)
    setSaving(true)
    try {
      await saveLayout({ venueId, elements: placed })
      setSaved(true)
    } catch {
      alert('Failed to save layout. Make sure the backend is running.')
    } finally {
      setSaving(false)
    }
  }

  // Export as PNG
  const handleExportImage = () => {
    const scale = 2
    const W = canvasAreaRef.current.offsetWidth * scale
    const H = canvasAreaRef.current.offsetHeight * scale
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#FBF7F4'
    ctx.fillRect(0, 0, W, H)

    // Grid
    if (showGrid) {
      ctx.strokeStyle = '#EDE0D9'
      ctx.lineWidth = 1
      const gridSize = 40 * scale
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
    }

    // Border
    ctx.strokeStyle = '#C4622D'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, W - 4, H - 4)

    // Elements
    placed.forEach(el => {
      const { w, h } = getElementSize(el.type)
      const color = colorOf(el.type)
      const cx = el.x * scale
      const cy = el.y * scale
      const cw = w * scale
      const ch = h * scale

      ctx.save()
      ctx.translate(cx + cw / 2, cy + ch / 2)
      ctx.rotate(((el.rotation || 0) * Math.PI) / 180)
      ctx.translate(-cw / 2, -ch / 2)
      drawElement(ctx, el.type, color, cw, ch, 0)
      ctx.restore()

      // Label beneath element in dark color
      ctx.fillStyle = '#2C1810'
      ctx.font = `bold ${12 * scale}px Segoe UI`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(el.type, cx + cw / 2, cy + ch + 4 * scale)
    })

    const link = document.createElement('a')
    link.download = 'venue-layout.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // Export as PDF using jsPDF-style blob (pure browser, no print dialog)
  const handleExportPDF = () => {
    const W = canvasAreaRef.current.offsetWidth
    const H = canvasAreaRef.current.offsetHeight

    // Build SVG string
    const svgParts = placed.map(el => {
      const { w, h } = getElementSize(el.type)
      const color = colorOf(el.type)
      const cx = el.x + w / 2
      const cy = el.y + h / 2
      const rot = el.rotation || 0

      return `
        <g transform="translate(${cx},${cy}) rotate(${rot}) translate(${-w/2},${-h/2})">
          <rect width="${w}" height="${h}" rx="6" fill="${color}" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
          <text x="${w/2}" y="${h + 14}" text-anchor="middle"
            fill="#2C1810" font-size="11" font-family="Segoe UI" font-weight="bold">${el.type}</text>
        </g>
      `
    }).join('')

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
        <defs>
          <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0L0 0 0 40" fill="none" stroke="#EDE0D9" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#FBF7F4"/>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <rect x="1" y="1" width="${W-2}" height="${H-2}" fill="none" stroke="#C4622D" stroke-width="2" rx="8"/>
        ${svgParts}
      </svg>
    `

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Venue Layout</title>
<style>
  body { margin: 0; font-family: 'Segoe UI', sans-serif; background: white; }
  .header { padding: 24px 32px 12px; }
  h1 { color: #2C1810; margin: 0 0 4px; font-size: 22px; }
  p { color: #8B6555; margin: 0; font-size: 13px; }
  .canvas { padding: 0 32px 32px; }
</style>
</head>
<body>
<div class="header">
  <h1>🏛 Venue Layout Plan</h1>
  <p>Elements: ${placed.length} &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString()}</p>
</div>
<div class="canvas">${svg}</div>
</body>
</html>`

    const blob = new Blob([html], { type: 'application/pdf' })
    // Use data URI approach for actual download
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'venue-layout.svg'
    a.click()
    URL.revokeObjectURL(url)

    // Also trigger print for actual PDF
    const win = window.open('', '_blank', 'width=900,height=700')
    win.document.write(html)
    win.document.close()
    win.onload = () => {
      setTimeout(() => {
        win.print()
        win.close()
      }, 500)
    }
  }

  const filteredElements = ELEMENT_DEFS.filter(e => e.category === activeCategory)
  const activeElObj = placed.find(e => e.id === activeEl)

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, fontFamily: "'Segoe UI', system-ui, sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`,
        padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            style={{
              padding: '0.45rem 0.9rem', background: COLORS.cream,
              border: `1px solid ${COLORS.border}`, borderRadius: '7px',
              cursor: 'pointer', fontSize: '13px', color: COLORS.text, fontWeight: '600'
            }}
          >← Dashboard</button>
          <div style={{ width: '1px', height: '20px', background: COLORS.border }} />
          <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: COLORS.text }}>🏛 Layout Designer</h1>
          <span style={{ padding: '0.2rem 0.65rem', background: COLORS.accentLight, borderRadius: '20px', fontSize: '12px', color: COLORS.accent, fontWeight: '600' }}>
            {placed.length} element{placed.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '12px', color: COLORS.textMuted, cursor: 'pointer', marginRight: '0.25rem' }}>
            <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} /> Grid
          </label>

          <button onClick={handleRotate} disabled={!activeEl} style={btnStyle(!!activeEl, '#EEF2FF', '#4F46E5', '#818CF8')}>
            🔄 Rotate
          </button>
          <button onClick={handleRemoveActive} disabled={!activeEl} style={btnStyle(!!activeEl, COLORS.redBg, COLORS.red, COLORS.red)}>
            🗑 Remove
          </button>
          <button onClick={handleClear} disabled={!placed.length} style={btnStyle(!!placed.length, COLORS.cream, COLORS.text, COLORS.border)}>
            ✕ Clear All
          </button>
          <div style={{ width: '1px', height: '20px', background: COLORS.border }} />
          <button onClick={handleExportImage} disabled={!placed.length} style={btnStyle(!!placed.length, '#EEF2FF', '#4F46E5', '#818CF8')}>
            🖼 Export Image
          </button>
          <button onClick={handleExportPDF} disabled={!placed.length} style={btnStyle(!!placed.length, '#FEF3C7', '#92400E', '#F59E0B')}>
            📄 Export PDF
          </button>
          <div ref={saveDropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={handleOpenSaveDropdown}
              disabled={saving || !placed.length}
              style={{
                padding: '0.45rem 1rem',
                background: saved ? COLORS.green : placed.length ? COLORS.accent : '#eee',
                border: 'none', borderRadius: '7px',
                cursor: placed.length ? 'pointer' : 'not-allowed',
                fontSize: '12px', color: placed.length ? COLORS.white : '#aaa', fontWeight: '700',
                display: 'flex', alignItems: 'center', gap: '0.35rem'
              }}
            >
              {saving ? '...' : saved ? '✓ Saved' : '💾 Save'} {!saving && <span style={{ fontSize: '10px', opacity: 0.85 }}>▼</span>}
            </button>
            {showSaveDropdown && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                background: COLORS.white, border: `1px solid ${COLORS.border}`,
                borderRadius: '10px', boxShadow: '0 6px 20px rgba(44,24,16,0.12)',
                zIndex: 200, minWidth: '210px', maxHeight: '260px', overflowY: 'auto'
              }}>
                <div style={{ padding: '8px 12px 6px', fontSize: '11px', fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${COLORS.border}` }}>
                  Save layout to venue
                </div>
                {venuesLoading ? (
                  <div style={{ padding: '12px 14px', color: COLORS.textMuted, fontSize: '13px' }}>Loading venues…</div>
                ) : venues.length === 0 ? (
                  <div style={{ padding: '12px 14px', color: COLORS.textMuted, fontSize: '13px' }}>No venues found</div>
                ) : (
                  venues.map(v => (
                    <button
                      key={v.id}
                      onClick={() => handleSaveToVenue(v.id)}
                      style={{
                        display: 'block', width: '100%', padding: '9px 14px',
                        background: 'none', border: 'none', textAlign: 'left',
                        cursor: 'pointer', fontSize: '13px', color: COLORS.text,
                        fontWeight: '500', borderBottom: `1px solid ${COLORS.border}`,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = COLORS.accentLight}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      🏛 {v.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setShowShareModal(true)
              setShareConfirmed(null)
              setSelectedStaff([])
              if (user?.id) {
                setStaffLoading(true)
                getOrganizerStaff(user.id)
                  .then(res => {
                    const seen = new Set()
                    const unique = res.data.filter(s => {
                      if (seen.has(s.user.id)) return false
                      seen.add(s.user.id)
                      return true
                    })
                    setStaffList(unique)
                  })
                  .catch(() => setStaffList([]))
                  .finally(() => setStaffLoading(false))
              }
            }}
            disabled={!placed.length}
            style={{
              padding: '0.45rem 1rem',
              background: placed.length ? COLORS.accentLight : '#f5f5f5',
              border: `1px solid ${placed.length ? COLORS.accent : '#e5e5e5'}`,
              borderRadius: '7px', cursor: placed.length ? 'pointer' : 'not-allowed',
              fontSize: '12px', color: placed.length ? COLORS.accent : '#aaa', fontWeight: '700'
            }}
          >
            🔗 Share with Staff
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left panel */}
        <div style={{ width: '185px', background: COLORS.white, borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '0.75rem', borderBottom: `1px solid ${COLORS.border}` }}>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Elements</p>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', padding: '0.5rem' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: '0.25rem 0.5rem', borderRadius: '5px', border: 'none',
                background: activeCategory === cat ? COLORS.accentLight : 'transparent',
                color: activeCategory === cat ? COLORS.accent : COLORS.textMuted,
                cursor: 'pointer', fontSize: '11px', fontWeight: activeCategory === cat ? '700' : '400'
              }}>{cat}</button>
            ))}
          </div>

          <div style={{ padding: '0.4rem', flex: 1, overflowY: 'auto' }}>
            {filteredElements.map(el => {
              const isSelected = selected === el.type
              return (
                <div
                  key={el.type}
                  onClick={() => handleSelectElement(el.type)}
                  style={{
                    padding: '0.55rem 0.65rem', borderRadius: '7px', cursor: 'pointer',
                    marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '0.55rem',
                    background: isSelected ? COLORS.accentLight : 'transparent',
                    border: `1px solid ${isSelected ? COLORS.accent : 'transparent'}`,
                    transition: 'all 0.12s'
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = COLORS.cream }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '5px', background: el.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: '13px' }}>
                      {el.type === 'Chair' ? '🪑' : el.type.includes('Table') ? '🍽' : el.type === 'Stage' ? '🎭' : el.type === 'Bar' ? '🍸' : el.type === 'Exit' ? '🚪' : el.type === 'Dance Floor' ? '💃' : '🚻'}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: isSelected ? COLORS.accent : COLORS.text, fontWeight: isSelected ? '700' : '400' }}>
                    {el.type}
                  </span>
                  {isSelected && <span style={{ marginLeft: 'auto', fontSize: '10px', color: COLORS.accent }}>✓</span>}
                </div>
              )
            })}
          </div>

          {/* Hint when nothing selected */}
          {!selected && (
            <div style={{ padding: '0.75rem', background: '#FEF9C3', borderTop: `1px solid ${COLORS.border}` }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#92400E' }}>Click an element above to select it, then click the canvas.</p>
            </div>
          )}

          <div style={{ padding: '0.65rem', borderTop: `1px solid ${COLORS.border}`, background: COLORS.cream }}>
            <p style={{ margin: 0, fontSize: '10px', color: COLORS.textMuted, lineHeight: '1.7' }}>
              <strong>Click</strong> element to select/deselect<br/>
              <strong>Click</strong> canvas to place<br/>
              <strong>Drag</strong> to reposition<br/>
              <strong>Click placed</strong> → Rotate/Remove
            </p>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.25rem', background: '#EDE0D4' }}>
          <div
            ref={canvasAreaRef}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              width: '100%', minWidth: '750px', height: '620px',
              background: COLORS.cream, borderRadius: '10px',
              border: `2px solid ${COLORS.border}`,
              position: 'relative',
              cursor: selected ? 'crosshair' : 'default',
              boxShadow: '0 4px 20px rgba(107,45,14,0.1)',
              backgroundImage: showGrid
                ? `linear-gradient(${COLORS.border} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border} 1px, transparent 1px)`
                : 'none',
              backgroundSize: showGrid ? '40px 40px' : 'auto',
              userSelect: 'none'
            }}
          >
            {placed.length === 0 && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '44px', opacity: 0.25, marginBottom: '0.5rem' }}>🏛</div>
                <p style={{ color: COLORS.textMuted, fontSize: '14px', margin: 0 }}>
                  {selected ? `Click to place a ${selected}` : 'Select an element from the left panel'}
                </p>
              </div>
            )}

            {placed.map(el => {
              const { w, h } = getElementSize(el.type)
              const color = colorOf(el.type)
              const isActive = activeEl === el.id
              const isDragging = draggingId === el.id

              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                  onClick={(e) => { e.stopPropagation(); setActiveEl(el.id) }}
                  style={{
                    position: 'absolute', left: el.x, top: el.y,
                    width: w, height: h,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    zIndex: isDragging ? 100 : isActive ? 10 : 1,
                    transform: `rotate(${el.rotation || 0}deg)`,
                    transformOrigin: 'center center'
                  }}
                >
                  <ElementCanvas
                    type={el.type} color={color}
                    rotation={0} width={w} height={h}
                    isActive={isActive} isDragging={isDragging}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel — info */}
        <div style={{ width: '160px', background: COLORS.white, borderLeft: `1px solid ${COLORS.border}`, padding: '0.75rem', flexShrink: 0 }}>
          <p style={{ margin: '0 0 0.6rem', fontSize: '10px', fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {activeElObj ? 'Selected' : 'Placing'}
          </p>

          {activeElObj ? (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ padding: '0.65rem', background: COLORS.accentLight, borderRadius: '7px', textAlign: 'center', marginBottom: '0.5rem' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '12px', fontWeight: '700', color: COLORS.accent }}>{activeElObj.type}</p>
                <p style={{ margin: 0, fontSize: '11px', color: COLORS.textMuted }}>↻ {activeElObj.rotation || 0}°</p>
              </div>
              <button onClick={handleRotate} style={{ width: '100%', padding: '0.4rem', background: '#EEF2FF', border: '1px solid #818CF8', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#4F46E5', fontWeight: '600', marginBottom: '4px' }}>
                🔄 Rotate 45°
              </button>
              <button onClick={handleRemoveActive} style={{ width: '100%', padding: '0.4rem', background: COLORS.redBg, border: `1px solid ${COLORS.red}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: COLORS.red, fontWeight: '600' }}>
                🗑 Remove
              </button>
            </div>
          ) : selected ? (
            <div style={{ padding: '0.65rem', background: COLORS.accentLight, borderRadius: '7px', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', background: colorOf(selected), borderRadius: '6px', margin: '0 auto 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '16px' }}>
                  {selected === 'Chair' ? '🪑' : selected.includes('Table') ? '🍽' : selected === 'Stage' ? '🎭' : selected === 'Bar' ? '🍸' : '🚪'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: COLORS.text }}>{selected}</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '10px', color: COLORS.textMuted }}>Click canvas to place</p>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: COLORS.textMuted }}>No element selected</p>
          )}

          <p style={{ margin: '0 0 0.5rem', fontSize: '10px', fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</p>
          {ELEMENT_DEFS.map(el => {
            const count = placed.filter(p => p.type === el.type).length
            if (!count) return null
            return (
              <div key={el.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', borderBottom: `1px solid ${COLORS.border}`, fontSize: '11px' }}>
                <span style={{ color: COLORS.text }}>{el.type}</span>
                <span style={{ background: el.color, color: '#fff', borderRadius: '10px', padding: '1px 7px', fontWeight: '700', fontSize: '10px' }}>{count}</span>
              </div>
            )
          })}
          {placed.length === 0 && <p style={{ fontSize: '11px', color: COLORS.textMuted }}>No elements yet.</p>}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowShareModal(false)}>
          <div style={{
            background: COLORS.white, borderRadius: '14px', width: '420px', maxHeight: '80vh',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.text }}>Share Floor Plan</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>Select staff members to share with</div>
              </div>
              <button onClick={() => setShowShareModal(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: COLORS.textMuted }}>✕</button>
            </div>

            {/* Staff list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
              {staffLoading && <p style={{ textAlign: 'center', color: COLORS.textMuted, fontSize: 13, padding: '20px 0' }}>Loading staff...</p>}
              {!staffLoading && staffList.length === 0 && (
                <p style={{ textAlign: 'center', color: COLORS.textMuted, fontSize: 13, padding: '20px 0' }}>No staff members found.</p>
              )}
              {!staffLoading && staffList.map(s => {
                const checked = selectedStaff.includes(s.user.id)
                return (
                  <div
                    key={s.user.id}
                    onClick={() => setSelectedStaff(prev => checked ? prev.filter(id => id !== s.user.id) : [...prev, s.user.id])}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 10px',
                      borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                      background: checked ? COLORS.accentLight : 'transparent',
                      border: `1px solid ${checked ? COLORS.accent : 'transparent'}`,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, border: `2px solid ${checked ? COLORS.accent : COLORS.border}`,
                      background: checked ? COLORS.accent : COLORS.white, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {checked && <span style={{ color: COLORS.white, fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', background: COLORS.accent,
                      color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, flexShrink: 0
                    }}>
                      {s.user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.text }}>{s.user.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.user.email}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Confirmation message */}
            {shareConfirmed && (
              <div style={{ margin: '0 12px', padding: '10px 14px', background: COLORS.greenBg, borderRadius: 8, fontSize: 12, color: COLORS.green, fontWeight: 600 }}>
                ✓ Layout saved and now visible to: {shareConfirmed}
              </div>
            )}

            {/* Footer */}
            <div style={{ padding: '14px 16px', borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: COLORS.textMuted, flex: 1 }}>
                {selectedStaff.length === 0 ? 'Select recipients above' : `${selectedStaff.length} selected`}
              </span>
              <button
                disabled={selectedStaff.length === 0 || sharing}
                onClick={async () => {
                  setSharing(true)
                  try {
                    await saveLayout({ venueId: currentVenueId, elements: placed })
                    const names = staffList.filter(s => selectedStaff.includes(s.user.id)).map(s => s.user.name).join(', ')
                    setShareConfirmed(names)
                  } catch {
                    alert('Failed to share layout. Make sure the backend is running.')
                  } finally {
                    setSharing(false)
                  }
                }}
                style={{ padding: '8px 18px', background: selectedStaff.length ? COLORS.accent : '#f5f5f5', border: 'none', borderRadius: 7, cursor: selectedStaff.length ? 'pointer' : 'not-allowed', fontSize: 12, color: selectedStaff.length ? COLORS.white : '#aaa', fontWeight: 700 }}
              >
                {sharing ? 'Sharing...' : '🔗 Share Layout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function btnStyle(enabled, bg, color, border) {
  return {
    padding: '0.45rem 0.85rem',
    background: enabled ? bg : '#f5f5f5',
    border: `1px solid ${enabled ? border : '#e5e5e5'}`,
    borderRadius: '7px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontSize: '12px',
    color: enabled ? color : '#aaa',
    fontWeight: '600'
  }
}
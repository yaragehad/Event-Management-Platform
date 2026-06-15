import { useState } from 'react'
import { saveLayout } from '../../services/venueService'

const ELEMENTS = ['Table', 'Stage', 'Chair', 'Bar', 'Exit', 'Dance Floor']

const COLORS = {
  'Table': '#3b82f6',
  'Stage': '#8b5cf6',
  'Chair': '#f59e0b',
  'Bar': '#ec4899',
  'Exit': '#10b981',
  'Dance Floor': '#f97316'
}

export default function LayoutDesignerPage() {
  const [placed, setPlaced] = useState([])
  const [selected, setSelected] = useState('Table')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    setPlaced(prev => [...prev, { type: selected, x, y, id: Date.now() }])
    setSaved(false)
  }

  const handleRemove = (id) => {
    setPlaced(prev => prev.filter(el => el.id !== id))
    setSaved(false)
  }

  const handleClear = () => {
    if (window.confirm('Clear the entire layout?')) {
      setPlaced([])
      setSaved(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveLayout({ venueId: 1, eventId: 1, elements: placed })
      setSaved(true)
      alert('Layout saved successfully!')
    } catch {
      alert('Failed to save layout')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Venue Layout Designer</h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        Select an element then click on the canvas to place it. Right-click an element to remove it.
      </p>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {ELEMENTS.map(el => (
          <button
            key={el}
            onClick={() => setSelected(el)}
            style={{
              padding: '0.5rem 1rem',
              background: selected === el ? COLORS[el] : '#f3f4f6',
              color: selected === el ? 'white' : '#374151',
              border: `2px solid ${selected === el ? COLORS[el] : '#e5e7eb'}`,
              borderRadius: '6px', cursor: 'pointer', fontWeight: selected === el ? '600' : '400'
            }}
          >
            {el}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleClear}
            style={{ padding: '0.5rem 1rem', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer' }}
          >
            Clear All
          </button>
          <button
            onClick={handleSave}
            disabled={saving || placed.length === 0}
            style={{
              padding: '0.5rem 1.2rem', background: '#2563eb',
              color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
              opacity: placed.length === 0 ? 0.5 : 1
            }}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Layout'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        onClick={handleCanvasClick}
        style={{
          width: '100%', maxWidth: '900px', height: '550px',
          border: '2px dashed #9ca3af', borderRadius: '10px',
          position: 'relative', background: '#f9fafb', cursor: 'crosshair'
        }}
      >
        {placed.length === 0 && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#9ca3af', fontSize: '16px', pointerEvents: 'none'
          }}>
            Click anywhere to place a {selected}
          </div>
        )}

        {placed.map(el => (
          <div
            key={el.id}
            onContextMenu={(e) => { e.preventDefault(); handleRemove(el.id) }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute', left: el.x, top: el.y,
              background: COLORS[el.type] || '#6b7280',
              color: 'white', padding: '4px 10px',
              borderRadius: '6px', fontSize: '12px', fontWeight: '600',
              transform: 'translate(-50%, -50%)',
              cursor: 'context-menu', userSelect: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            {el.type}
          </div>
        ))}
      </div>

      <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '0.5rem' }}>
        Right-click any element to remove it. Placed elements: {placed.length}
      </p>
    </div>
  )
}
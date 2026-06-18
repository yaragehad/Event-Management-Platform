import React, { useState, useEffect, useRef } from 'react';
import { getLayout } from '../../services/venueService';

const colors = {
  sidebar: '#1b0f06',
  accent: '#ff5a2c',
  accentLight: '#ffe7dc',
  cream: '#fdf4e9',
  border: '#f0e3d2',
  text: '#241407',
  textMuted: '#8a7a68',
  white: '#ffffff',
  green: '#0f7a44',
};

const ELEMENT_DEFS = [
  { type: 'Round Table', color: '#8B5E3C' },
  { type: 'Rect Table',  color: '#6B4226' },
  { type: 'Chair',       color: '#C4622D' },
  { type: 'Stage',       color: '#5B4DB5' },
  { type: 'Dance Floor', color: '#B5384D' },
  { type: 'Bar',         color: '#2D7A4F' },
  { type: 'Exit',        color: '#C0392B' },
  { type: 'Restroom',    color: '#2D5F7A' },
];

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
  };
  return sizes[type] || { w: 60, h: 60 };
}

function drawElement(ctx, type, color, w, h, rotation) {
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;

  if (type === 'Round Table') {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    [0, 45, 90, 135, 180, 225, 270, 315].forEach(angle => {
      const rad = (angle * Math.PI) / 180;
      const cx = w / 2 + (w / 2 - 2) * Math.cos(rad);
      const cy = h / 2 + (h / 2 - 2) * Math.sin(rad);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    });
  } else if (type === 'Rect Table') {
    ctx.beginPath(); ctx.roundRect(8, 8, w - 16, h - 16, 4); ctx.fill(); ctx.stroke();
    [12, w - 24].forEach(x => {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.roundRect(x, 0, 16, 7, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(x, h - 7, 16, 7, 2); ctx.fill();
    });
    [8, h - 20].forEach(y => {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.roundRect(0, y, 7, 14, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(w - 7, y, 7, 14, 2); ctx.fill();
    });
  } else if (type === 'Chair') {
    ctx.beginPath(); ctx.roundRect(4, 2, w - 8, h * 0.45, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.roundRect(2, h * 0.5, w - 4, h * 0.3, 3); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.roundRect(4, h * 0.82, 6, h * 0.16, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(w - 10, h * 0.82, 6, h * 0.16, 2); ctx.fill();
  } else if (type === 'Stage') {
    ctx.beginPath(); ctx.roundRect(2, 6, w - 4, h - 8, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.roundRect(2, h - 8, w - 4, 5, 2); ctx.fill();
    [w * 0.2, w * 0.5, w * 0.8].forEach(x => {
      ctx.fillStyle = 'rgba(255,255,0,0.4)';
      ctx.beginPath(); ctx.arc(x, h * 0.4, 5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 11px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText('STAGE', w / 2, h * 0.65);
  } else if (type === 'Dance Floor') {
    ctx.beginPath(); ctx.roundRect(2, 2, w - 4, h - 4, 4); ctx.fill();
    const cols = 4, rows = 4, tw = (w - 4) / cols, th = (h - 4) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(2 + c * tw, 2 + r * th, tw, th);
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText('DANCE FLOOR', w / 2, h / 2 + 4);
  } else if (type === 'Bar') {
    ctx.beginPath(); ctx.roundRect(2, 6, w - 4, h - 8, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.roundRect(2, 6, w - 4, 8, 4); ctx.fill();
    [w * 0.25, w * 0.5, w * 0.75].forEach(x => {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(x, h * 0.62, 4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 10px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText('BAR', w / 2, h * 0.88);
  } else if (type === 'Exit') {
    ctx.beginPath(); ctx.roundRect(2, 2, w - 4, h - 4, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 12px Segoe UI'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', w / 2, h / 2);
  } else if (type === 'Restroom') {
    ctx.beginPath(); ctx.roundRect(2, 2, w - 4, h - 4, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '20px Segoe UI'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🚻', w / 2, h / 2);
  } else {
    ctx.beginPath(); ctx.roundRect(2, 2, w - 4, h - 4, 4); ctx.fill();
  }
  ctx.restore();
}

function ElementCanvas({ type, color, rotation = 0, width, height }) {
  const canvasRef = useRef(null);
  const dpr = window.devicePixelRatio || 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    drawElement(ctx, type, color, width, height, rotation);
  }, [type, color, rotation, width, height]);

  const currentPath = window.location.pathname;
  return (
    <canvas
      ref={canvasRef}
      width={width * dpr}
      height={height * dpr}
      style={{ width, height, display: 'block' }}
    />
  );
}

const StaffFloorPlan = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await getLayout(1);
        setElements(response.data.elements || []);
      } catch (err) {
        setError('Layout not yet available. Waiting for organizer to share.');
        setElements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLayout();
  }, []);

  const typeCounts = ELEMENT_DEFS.map(def => ({
    ...def,
    count: elements.filter(e => e.type === def.type).length
  })).filter(d => d.count > 0);

  const currentPath = window.location.pathname;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.cream, fontFamily: "'Hanken Grotesk', system-ui, sans-serif", padding: '12px', gap: '12px', boxSizing: 'border-box' }}>

      {/* Sidebar */}
      {sidebarOpen && (
        <div style={{ width: '220px', height: 'calc(100vh - 24px)', backgroundColor: colors.sidebar, borderRadius: '20px', color: colors.white, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: 0, alignSelf: 'flex-start', overflowY: 'auto', boxSizing: 'border-box', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,90,44,0.25)', marginBottom: '16px', flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, background: colors.accent, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: colors.sidebar, flexShrink: 0 }}>S</div>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '17px', fontFamily: "'Bricolage Grotesque', system-ui, sans-serif" }}>StaffHub</span>
          </div>
          <div style={{ color: '#6b574a', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', flexShrink: 0 }}>Menu</div>
          <a href="/staff/dashboard" style={{ color: currentPath === '/staff/dashboard' ? colors.white : '#c9b9a8', background: currentPath === '/staff/dashboard' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/dashboard' ? 600 : 400 }}>🏠 Dashboard</a>
          <a href="/staff/tasks" style={{ color: currentPath === '/staff/tasks' ? colors.white : '#c9b9a8', background: currentPath === '/staff/tasks' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/tasks' ? 600 : 400 }}>✅ My Tasks</a>
          <a href="/staff/floorplan" style={{ color: currentPath === '/staff/floorplan' ? colors.white : '#c9b9a8', background: currentPath === '/staff/floorplan' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/floorplan' ? 600 : 400 }}>🗺️ Venue Layout</a>
          <a href="/staff/checkin" style={{ color: currentPath === '/staff/checkin' ? colors.white : '#c9b9a8', background: currentPath === '/staff/checkin' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/checkin' ? 600 : 400 }}>👥 Guest Check-In</a>
          <a href="/staff/vendors" style={{ color: currentPath === '/staff/vendors' ? colors.white : '#c9b9a8', background: currentPath === '/staff/vendors' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/vendors' ? 600 : 400 }}>🚚 Vendor Arrival</a>
          <a href="/staff/dayof" style={{ color: currentPath === '/staff/dayof' ? colors.white : '#c9b9a8', background: currentPath === '/staff/dayof' ? colors.accent : 'transparent', textDecoration: 'none', padding: '10px 12px', borderRadius: '11px', fontSize: '14px', display: 'block', fontWeight: currentPath === '/staff/dayof' ? 600 : 400 }}>📊 Day-Of Dashboard</a>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1 }}>

        {/* Topbar */}
        <div style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: colors.text }}>☰</button>
          <span style={{ fontWeight: 'bold', color: colors.text, fontSize: '18px' }}>Venue Layout</span>
          <span style={{ backgroundColor: colors.accentLight, color: colors.accent, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            READ ONLY
          </span>
          {!loading && !error && elements.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '13px', color: colors.textMuted }}>
              {elements.length} element{elements.length !== 1 ? 's' : ''} • Shared by Organizer
            </span>
          )}
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}`, borderRadius: '8px', overflow: 'hidden' }}>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>Loading layout...</div>
            ) : error ? (
              <div style={{ margin: '24px', padding: '16px', backgroundColor: colors.accentLight, border: `1px solid ${colors.accent}`, borderRadius: '8px', color: colors.accent }}>
                {error}
              </div>
            ) : elements.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
                <div style={{ fontSize: '40px', opacity: 0.3, marginBottom: '12px' }}>🏛</div>
                No layout has been shared yet.
              </div>
            ) : (
              <>
                {/* Canvas */}
                <div style={{ padding: '24px' }}>
                  <div style={{
                    width: '100%', height: '580px',
                    border: `2px solid ${colors.border}`, borderRadius: '8px',
                    backgroundColor: colors.cream, position: 'relative',
                    backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    overflow: 'hidden'
                  }}>
                    {elements.map(el => {
                      const color = ELEMENT_DEFS.find(d => d.type === el.type)?.color || colors.accent;
                      const { w, h } = getElementSize(el.type);
                      return (
                        <div
                          key={el.id}
                          style={{
                            position: 'absolute', left: el.x, top: el.y,
                            width: w, height: h,
                            transform: `rotate(${el.rotation || 0}deg)`,
                            transformOrigin: 'center center',
                            userSelect: 'none',
                            pointerEvents: 'none',
                          }}
                        >
                          <ElementCanvas type={el.type} color={color} rotation={0} width={w} height={h} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div style={{ padding: '14px 24px', borderTop: `1px solid ${colors.border}`, display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '4px' }}>Legend</span>
                  {typeCounts.map(({ type, color, count }) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '14px', height: '14px', backgroundColor: color, borderRadius: '3px' }} />
                      <span style={{ color: colors.textMuted, fontSize: '13px' }}>{type}</span>
                      <span style={{ background: color, color: '#fff', borderRadius: '10px', padding: '1px 6px', fontWeight: '700', fontSize: '11px' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffFloorPlan;

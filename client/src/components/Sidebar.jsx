import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Briefcase, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'

const EXPANDED_W = '220px'
const COLLAPSED_W = '64px'

function NavItem({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: collapsed ? '0' : '10px',
        padding: collapsed ? '9px 0' : '9px 12px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        textDecoration: 'none',
        color: '#e8edf5',
        background: isActive ? '#2d4a7a' : 'transparent',
        transition: 'background 0.12s ease',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      })}
      onMouseEnter={(e) => {
        const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
      }}
      onMouseLeave={(e) => {
        const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
        if (!isActive) e.currentTarget.style.background = 'transparent'
      }}
    >
      <Icon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ opacity: 1, transition: 'opacity 0.15s ease' }}>{label}</span>}
    </NavLink>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebar-collapsed') === 'true' } catch { return false }
  })

  function toggle() {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem('sidebar-collapsed', String(next)) } catch {}
      return next
    })
  }

  return (
    <aside style={{
      width: collapsed ? COLLAPSED_W : EXPANDED_W,
      minWidth: collapsed ? COLLAPSED_W : EXPANDED_W,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#1b2a4a',
      borderRight: '1px solid rgba(255,255,255,0.07)',
      overflow: 'hidden',
      transition: 'width 0.22s ease, min-width 0.22s ease',
      flexShrink: 0,
    }}>
      {/* Brand + Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '18px 0 16px' : '18px 12px 16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        minHeight: '61px',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <Briefcase size={20} strokeWidth={2.5} color="#e8edf5" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#e8edf5', letterSpacing: '0', whiteSpace: 'nowrap' }}>
              ApplyWise
            </span>
          </div>
        )}
        <button
          onClick={toggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px', flexShrink: 0,
            background: 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: '6px',
            cursor: 'pointer', color: '#e8edf5',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          {collapsed
            ? <ChevronRight size={14} strokeWidth={2.5} />
            : <ChevronLeft size={14} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: collapsed ? '12px 8px' : '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        <NavItem to="/feed" icon={Briefcase} label="Job Feed" collapsed={collapsed} />
        <NavItem to="/tracker" icon={ClipboardList} label="Tracker" collapsed={collapsed} />
      </nav>

      {/* Footer */}
      <div style={{
        padding: collapsed ? '14px 0' : '14px 20px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        fontSize: '12px',
        color: 'rgba(232,237,245,0.35)',
        fontWeight: '400',
        textAlign: collapsed ? 'center' : 'left',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}>
        {collapsed ? 'v1' : 'v1.0 - Personal'}
      </div>
    </aside>
  )
}

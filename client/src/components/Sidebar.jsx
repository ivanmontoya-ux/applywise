import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Mail,
  MessageSquareText,
  Settings,
  UserRound,
  UserPlus,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import BrandLogo from './BrandLogo'

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
        fontWeight: isActive ? '700' : '500',
        textDecoration: 'none',
        color: isActive ? 'var(--color-applied-teal)' : 'var(--color-text-secondary)',
        background: isActive ? '#edf7f7' : 'transparent',
        border: isActive ? '1px solid #cfe7e8' : '1px solid transparent',
        transition: 'background 0.12s ease, color 0.12s ease, border-color 0.12s ease',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      })}
      onMouseEnter={(e) => {
        const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
        if (!isActive) {
          e.currentTarget.style.background = 'var(--color-bg-hover)'
          e.currentTarget.style.color = 'var(--color-text-primary)'
        }
      }}
      onMouseLeave={(e) => {
        const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--color-text-secondary)'
        }
      }}
    >
      <Icon size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ opacity: 1, transition: 'opacity 0.15s ease' }}>{label}</span>}
    </NavLink>
  )
}

export default function Sidebar() {
  const auth = useAuth()
  const navigate = useNavigate()
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

  async function handleLogout() {
    await auth.logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside style={{
      width: collapsed ? COLLAPSED_W : EXPANDED_W,
      minWidth: collapsed ? COLLAPSED_W : EXPANDED_W,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg-sidebar)',
      borderRight: '1px solid var(--color-border)',
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
        borderBottom: '1px solid var(--color-border)',
        minHeight: '61px',
      }}>
        {!collapsed && (
          <BrandLogo width={150} style={{ minWidth: 0 }} />
        )}
        <button
          onClick={toggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px', flexShrink: 0,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)', borderRadius: '6px',
            cursor: 'pointer', color: 'var(--color-text-secondary)',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
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
        <NavItem to="/home" icon={Home} label="Home" collapsed={collapsed} />
        <NavItem to="/jobs" icon={Briefcase} label="Jobs" collapsed={collapsed} />
        <NavItem to="/tracker" icon={ClipboardList} label="Tracker" collapsed={collapsed} />
        <NavItem to="/documents" icon={FileText} label="Documents" collapsed={collapsed} />
        <NavItem to="/personal-information" icon={UserRound} label="Personal Information" collapsed={collapsed} />
        <NavItem to="/coach" icon={MessageSquareText} label="Coach" collapsed={collapsed} />
        <NavItem to="/reminders" icon={Bell} label="Reminders" collapsed={collapsed} />
        <NavItem to="/email" icon={Mail} label="Email" collapsed={collapsed} />
        <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
        <NavItem to="/waitlist" icon={UserPlus} label="Waitlist" collapsed={collapsed} />
      </nav>

      {/* Footer */}
      <div style={{
        padding: collapsed ? '12px 8px' : '14px 12px',
        borderTop: '1px solid var(--color-border)',
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        fontWeight: '400',
        textAlign: collapsed ? 'center' : 'left',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}>
        {auth.session ? (
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            style={{
              width: '100%',
              minHeight: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? 0 : '8px',
              padding: collapsed ? 0 : '0 8px',
              border: '1px solid transparent',
              borderRadius: '8px',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '700',
            }}
          >
            <LogOut size={15} strokeWidth={2.2} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Log out</span>}
          </button>
        ) : (
          collapsed ? 'v1' : 'Private beta'
        )}
      </div>
    </aside>
  )
}

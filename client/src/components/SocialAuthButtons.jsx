import React, { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const providers = [
  {
    key: 'facebook',
    provider: 'facebook',
    label: 'Facebook',
    color: '#1877f2',
    available: true,
    Icon: FacebookIcon,
  },
  {
    key: 'linkedin',
    provider: 'linkedin_oidc',
    label: 'LinkedIn',
    color: '#0a66c2',
    available: true,
    Icon: LinkedInIcon,
  },
  {
    key: 'instagram',
    provider: null,
    label: 'Instagram',
    color: '#c13584',
    available: false,
    Icon: InstagramIcon,
    unavailableReason: 'Instagram needs a custom OAuth setup before it can be enabled.',
  },
]

const buttonStyle = {
  minHeight: 42,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  padding: '0 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '13px',
  fontWeight: '800',
  boxShadow: 'var(--shadow-sm)',
}

const iconShellStyle = {
  width: 22,
  height: 22,
  borderRadius: '999px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  flexShrink: 0,
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path fill="currentColor" d="M14.2 8.1h2.1V4.7c-.4-.1-1.6-.2-3-.2-3 0-5.1 1.8-5.1 5v2.8H4.9v3.8h3.3v7.4h4.1v-7.4h3.2l.5-3.8h-3.7V9.9c0-1.1.3-1.8 1.9-1.8Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path fill="currentColor" d="M6.4 8.9H2.8v11.5h3.6V8.9Zm-1.8-5.7a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2Zm15.8 10.6c0-3.1-1.7-5.2-4.5-5.2-2 0-3 .9-3.5 1.8V8.9H8.9v11.5h3.6v-5.7c0-1.5.3-2.9 2.1-2.9 1.8 0 1.8 1.7 1.8 3v5.6H20v-6.6Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path fill="currentColor" d="M7.2 2.5h9.6A4.7 4.7 0 0 1 21.5 7.2v9.6a4.7 4.7 0 0 1-4.7 4.7H7.2a4.7 4.7 0 0 1-4.7-4.7V7.2a4.7 4.7 0 0 1 4.7-4.7Zm0 3A1.7 1.7 0 0 0 5.5 7.2v9.6a1.7 1.7 0 0 0 1.7 1.7h9.6a1.7 1.7 0 0 0 1.7-1.7V7.2a1.7 1.7 0 0 0-1.7-1.7H7.2Zm4.8 3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm0 2.3a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm4-3.3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
    </svg>
  )
}

export default function SocialAuthButtons({ mode = 'login', redirectTo = '/dashboard' }) {
  const auth = useAuth()
  const [message, setMessage] = useState('')

  function handleProvider(provider) {
    setMessage('')

    if (!auth.configured) {
      setMessage('Supabase is not configured. Add the public Supabase URL and publishable key first.')
      return
    }

    if (!provider.available) {
      setMessage(provider.unavailableReason || `${provider.label} login is not available yet.`)
      return
    }

    auth.socialLogin({ provider: provider.provider, redirectTo })
  }

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))', gap: '10px' }}>
        {providers.map(provider => {
          const Icon = provider.Icon
          return (
            <button
              key={provider.key}
              type="button"
              onClick={() => handleProvider(provider)}
              disabled={!auth.configured}
              className="secondary-action pressable"
              title={provider.available ? `${mode === 'signup' ? 'Sign up' : 'Log in'} with ${provider.label}` : provider.unavailableReason}
              style={{
                ...buttonStyle,
                opacity: auth.configured ? (provider.available ? 1 : 0.68) : 0.58,
                cursor: auth.configured ? 'pointer' : 'default',
              }}
            >
              <span style={{ ...iconShellStyle, background: provider.color }}>
                <Icon />
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider.label}</span>
            </button>
          )
        })}
      </div>

      {message && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 11px', borderRadius: 'var(--radius-md)', background: '#fff7ed', color: 'var(--color-warning)', fontSize: '12px', lineHeight: '1.45' }}>
          <AlertCircle size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
          {message}
        </div>
      )}
    </div>
  )
}

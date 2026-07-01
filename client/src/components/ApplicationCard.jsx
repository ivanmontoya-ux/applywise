import React, { useState } from 'react'
import { ExternalLink, Trash2, Pencil, MapPin, Calendar, RefreshCcw } from 'lucide-react'
import { updateApplication, deleteApplication } from '../lib/api'

const ALL_STATUSES = ['Saved', 'Applied', 'Phone Screen', 'Interview', 'Final Round', 'Offer', 'Rejected']

const STATUS_COLORS = {
  Saved:          { bg: '#f1f5f9', color: '#475569', accent: '#94a3b8', border: '#cbd5e1' },
  Applied:        { bg: '#dbeafe', color: '#1d4ed8', accent: '#3b82f6', border: '#93c5fd' },
  'Phone Screen': { bg: '#ede9fe', color: '#6d28d9', accent: '#7c3aed', border: '#c4b5fd' },
  Interview:      { bg: '#ffedd5', color: '#c2410c', accent: '#ea580c', border: '#fdba74' },
  'Final Round':  { bg: '#fef3c7', color: '#92400e', accent: '#d97706', border: '#fcd34d' },
  Offer:          { bg: '#dcfce7', color: '#15803d', accent: '#16a34a', border: '#86efac' },
  Rejected:       { bg: '#fee2e2', color: '#dc2626', accent: '#ef4444', border: '#fca5a5' },
}

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return null }
}

export default function ApplicationCard({ application, onUpdate, onDelete }) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(application.notes || '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [hovered, setHovered] = useState(false)

  const currentStatusColor = STATUS_COLORS[application.status] || STATUS_COLORS.Saved

  async function handleStatusChange(status) {
    if (status === application.status || updatingStatus) return
    setUpdatingStatus(status)
    try {
      await updateApplication(application.id, { status })
      onUpdate?.()
    } finally {
      setUpdatingStatus(null)
    }
  }

  async function handleNotesSave() {
    setEditingNotes(false)
    if (notes !== application.notes) {
      await updateApplication(application.id, { notes })
      onUpdate?.()
    }
  }

  async function handleDelete() {
    await deleteApplication(application.id)
    onDelete?.(application.id)
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        border: '1px solid var(--color-border)',
        borderLeft: `4px solid ${currentStatusColor.accent}`,
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {/* Top row: title + company + actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '15px', fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '5px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {application.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              {application.company}
            </span>
            {application.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                <MapPin size={11} strokeWidth={2} />{application.location}
              </span>
            )}
            {application.sector && (
              <span style={{
                fontSize: '11px', fontWeight: '600',
                padding: '2px 8px', borderRadius: '999px',
                background: '#f1f5f9', color: '#475569',
              }}>
                {application.sector}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {application.url && (
            <a
              href={application.url} target="_blank" rel="noopener noreferrer"
              title="Open listing"
              style={{
                padding: '6px', color: 'var(--color-text-muted)',
                display: 'flex', borderRadius: 'var(--radius-sm)',
                transition: 'color 0.15s, background 0.15s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-navy)'; e.currentTarget.style.background = '#f0f4ff' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent' }}
            >
              <ExternalLink size={14} strokeWidth={2} />
            </a>
          )}
          {!confirmDelete ? (
            <button
              title="Delete"
              onClick={() => setConfirmDelete(true)}
              style={{
                padding: '6px', color: 'var(--color-text-muted)',
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', borderRadius: 'var(--radius-sm)',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = '#fff1f1' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'none' }}
            >
              <Trash2 size={14} strokeWidth={2} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: '500' }}>Delete?</span>
              <button
                onClick={handleDelete}
                style={{ padding: '4px 10px', background: 'var(--color-danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ padding: '4px 10px', background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px' }}
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status pipeline */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {ALL_STATUSES.map(status => {
          const isActive = application.status === status
          const c = STATUS_COLORS[status]
          return (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={!!updatingStatus}
              style={{
                padding: '5px 13px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: isActive ? '700' : '500',
                cursor: updatingStatus ? 'default' : 'pointer',
                border: isActive ? `1.5px solid ${c.border}` : '1.5px solid var(--color-border)',
                background: isActive ? c.bg : 'transparent',
                color: isActive ? c.color : 'var(--color-text-muted)',
                transition: 'all 0.15s ease',
                opacity: updatingStatus && !isActive ? 0.4 : 1,
              }}
              onMouseEnter={e => {
                if (!isActive && !updatingStatus) {
                  e.currentTarget.style.background = c.bg
                  e.currentTarget.style.color = c.color
                  e.currentTarget.style.borderColor = c.border
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-muted)'
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }
              }}
            >
              {status}
            </button>
          )
        })}
      </div>

      {/* Dates + Deadline */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--color-text-muted)', alignItems: 'center' }}>
        {application.date_saved && <span>Saved: <strong style={{ color: 'var(--color-text-secondary)', fontWeight: '500' }}>{formatDate(application.date_saved)}</strong></span>}
        {application.date_applied && <span>Applied: <strong style={{ color: 'var(--color-text-secondary)', fontWeight: '500' }}>{formatDate(application.date_applied)}</strong></span>}
        {application.deadline_type === 'rolling' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0891b2', fontWeight: '500' }}>
            <RefreshCcw size={11} strokeWidth={2.5} />
            Rolling Applications
          </span>
        )}
        {application.deadline_type === 'date' && application.deadline_date && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#c2410c', fontWeight: '500' }}>
            <Calendar size={11} strokeWidth={2.5} />
            Apply by {formatDate(application.deadline_date)}
          </span>
        )}
      </div>

      {/* Notes */}
      <div>
        {editingNotes ? (
          <textarea
            autoFocus
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleNotesSave}
            placeholder="Add notes..."
            style={{
              width: '100%', minHeight: '76px', resize: 'vertical',
              padding: '10px 12px', fontSize: '13px',
              border: '1.5px solid var(--color-navy-light)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'inherit', color: 'var(--color-text-primary)',
              background: '#fff',
              outline: 'none', boxSizing: 'border-box',
              lineHeight: '1.5',
            }}
          />
        ) : (
          <button
            onClick={() => setEditingNotes(true)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '7px', width: '100%',
              background: notes ? 'var(--color-bg-secondary)' : 'transparent',
              border: `1px ${notes ? 'solid' : 'dashed'} var(--color-border)`,
              borderRadius: 'var(--radius-md)', padding: '8px 12px',
              cursor: 'pointer', textAlign: 'left',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-border-strong)'
              e.currentTarget.style.background = '#f8fafc'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.background = notes ? 'var(--color-bg-secondary)' : 'transparent'
            }}
          >
            <Pencil size={12} strokeWidth={2} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 2 }} />
            <span style={{
              fontSize: '13px',
              color: notes ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
              lineHeight: '1.5', whiteSpace: 'pre-wrap',
            }}>
              {notes || 'Add notes…'}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Calendar, Download, ExternalLink, FileText, MapPin, Pencil, RefreshCcw, Trash2 } from 'lucide-react'
import { updateApplication, deleteApplication } from '../lib/api'
import { downloadCoverLetterDoc } from '../lib/documentExport'
import {
  APPLICATION_STATUSES,
  formatApplicationDate,
  getDocumentReadiness,
  getNextAction,
  getStatusStyle,
} from '../lib/application'

export default function ApplicationCard({ application, onUpdate, onDelete }) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(application.notes || '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [hovered, setHovered] = useState(false)

  const currentStatusColor = getStatusStyle(application.status)
  const documentReadiness = getDocumentReadiness(application)
  const nextAction = getNextAction(application)
  const hasCvReview = Boolean(application.cv_review)
  const hasCoverLetter = Boolean(application.cover_letter)

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
      className="interactive-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        border: '1px solid var(--color-border)',
        borderTop: `3px solid ${currentStatusColor.accent}`,
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {/* Top row: title + company + actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            to={`/tracker/${application.id}`}
            style={{
              display: 'inline-block',
            fontSize: '15px', fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '5px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textDecoration: 'none',
              maxWidth: '100%',
            }}
          >
            {application.title}
          </Link>
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
                padding: '3px 8px', borderRadius: '6px',
                background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)',
              }}>
                {application.sector}
              </span>
            )}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 24,
              padding: '0 8px',
              borderRadius: '6px',
              border: `1px solid ${currentStatusColor.border}`,
              background: currentStatusColor.bg,
              color: currentStatusColor.color,
              fontSize: '12px',
              fontWeight: '800',
            }}>
              {application.status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {application.url && (
            <a
              href={application.url} target="_blank" rel="noopener noreferrer"
              title="Open listing"
              className="secondary-action pressable"
              style={{
                padding: '6px', color: 'var(--color-text-muted)',
                display: 'flex', borderRadius: 'var(--radius-sm)',
                transition: 'color 0.15s, background 0.15s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-applied-teal)'; e.currentTarget.style.background = 'var(--color-applied-teal-soft)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent' }}
            >
              <ExternalLink size={14} strokeWidth={2} />
            </a>
          )}
          {!confirmDelete ? (
            <button
              title="Delete"
              onClick={() => setConfirmDelete(true)}
              className="pressable"
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
                className="pressable"
                style={{ padding: '4px 10px', background: 'var(--color-danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="secondary-action pressable"
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
        {APPLICATION_STATUSES.map(status => {
          const isActive = application.status === status
          const c = getStatusStyle(status)
          return (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={!!updatingStatus}
              className="status-choice pressable"
              style={{
                minHeight: 32,
                padding: '0 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: isActive ? '800' : '600',
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

      {/* Next action + readiness */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fbfdff' }}>
          <Bell size={14} strokeWidth={2.4} style={{ color: 'var(--color-applied-teal)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0', marginBottom: '2px' }}>Next action</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>{nextAction}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: '#fbfdff' }}>
          <FileText size={14} strokeWidth={2.4} style={{ color: documentReadiness === 'Complete' ? 'var(--color-success)' : 'var(--color-warning)', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', minWidth: 0 }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Documents: <strong style={{ color: 'var(--color-text-primary)', fontWeight: '800' }}>{documentReadiness}</strong>
            </span>
            {(hasCvReview || hasCoverLetter) && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {hasCvReview && (
                  <span style={{ minHeight: 24, display: 'inline-flex', alignItems: 'center', padding: '0 8px', borderRadius: '6px', background: 'var(--color-applied-teal-soft)', color: 'var(--color-applied-teal)', fontSize: '11px', fontWeight: '800' }}>
                    CV review saved
                  </span>
                )}
                {hasCoverLetter && (
                  <button
                    type="button"
                    onClick={() => downloadCoverLetterDoc(application.cover_letter, application)}
                    className="secondary-action pressable"
                    style={{ minHeight: 24, display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '0 8px', borderRadius: '6px', border: '1px solid #bddbf5', background: '#ffffff', color: 'var(--color-applied-teal)', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    <Download size={11} strokeWidth={2.5} />
                    Cover letter doc
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dates + Deadline */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--color-text-muted)', alignItems: 'center' }}>
        {application.date_saved && <span>Saved: <strong style={{ color: 'var(--color-text-secondary)', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{formatApplicationDate(application.date_saved)}</strong></span>}
        {application.date_applied && <span>Applied: <strong style={{ color: 'var(--color-text-secondary)', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>{formatApplicationDate(application.date_applied)}</strong></span>}
        {application.deadline_type === 'rolling' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-info)', fontWeight: '700' }}>
            <RefreshCcw size={11} strokeWidth={2.5} />
            Rolling Applications
          </span>
        )}
        {application.deadline_type === 'date' && application.deadline_date && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-warning)', fontWeight: '700' }}>
            <Calendar size={11} strokeWidth={2.5} />
            Apply by {formatApplicationDate(application.deadline_date)}
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
            placeholder="Add notes, follow-up details, or document context..."
            style={{
              width: '100%', minHeight: '76px', resize: 'vertical',
              padding: '10px 12px', fontSize: '13px',
              border: '1.5px solid var(--color-applied-teal)',
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
            className="secondary-action pressable"
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
              {notes || 'Add notes or missing context...'}
            </span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link to={`/tracker/${application.id}`} className="secondary-action pressable" style={{
          minHeight: 34,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          padding: '0 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          background: '#ffffff',
          color: 'var(--color-text-primary)',
          fontSize: '12px',
          fontWeight: '800',
          textDecoration: 'none',
          boxShadow: 'var(--shadow-sm)',
        }}>
          Open details
          <ExternalLink size={13} strokeWidth={2.4} />
        </Link>
      </div>
    </div>
  )
}

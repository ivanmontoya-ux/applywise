import React, { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { fetchTracker } from '../lib/api'
import ApplicationCard from '../components/ApplicationCard'
import AddApplicationModal from '../components/AddApplicationModal'

const ALL_STATUSES = ['All', 'Saved', 'Applied', 'Phone Screen', 'Interview', 'Final Round', 'Offer', 'Rejected']

const STATUS_COLORS = {
  Saved:          { bg: '#f1f5f9', color: '#475569' },
  Applied:        { bg: '#dbeafe', color: '#1d4ed8' },
  'Phone Screen': { bg: '#ede9fe', color: '#6d28d9' },
  Interview:      { bg: '#ffedd5', color: '#c2410c' },
  'Final Round':  { bg: '#fef3c7', color: '#92400e' },
  Offer:          { bg: '#dcfce7', color: '#15803d' },
  Rejected:       { bg: '#fee2e2', color: '#dc2626' },
}

const pageStyle = { padding: '36px 40px', maxWidth: '940px' }
const headerRowStyle = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }
const titleStyle = { fontSize: '22px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px', letterSpacing: '-0.3px' }
const subtitleStyle = { fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '400' }
const addBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '7px',
  padding: '8px 16px', background: 'var(--color-navy)', color: '#ffffff',
  border: 'none', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: '500',
  cursor: 'pointer', transition: 'background 0.12s ease', flexShrink: 0,
}
const filterRowStyle = { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '28px' }

function statusFilterBtnStyle(isActive, status) {
  const colorMap = STATUS_COLORS[status]
  return {
    padding: '6px 14px', borderRadius: '999px',
    border: isActive ? '1.5px solid transparent' : '1.5px solid var(--color-border)',
    fontSize: '13px', fontWeight: isActive ? '600' : '400',
    cursor: 'pointer', transition: 'all 0.12s ease',
    background: isActive ? (status === 'All' ? 'var(--color-navy)' : colorMap?.bg || 'var(--color-navy)') : 'var(--color-bg)',
    color: isActive ? (status === 'All' ? '#ffffff' : colorMap?.color || '#ffffff') : 'var(--color-text-secondary)',
  }
}

export default function Tracker() {
  const [activeStatus, setActiveStatus] = useState('All')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadApplications = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchTracker(activeStatus)
      setApplications(data)
    } finally {
      setLoading(false)
    }
  }, [activeStatus, refreshKey])

  useEffect(() => { loadApplications() }, [loadApplications])

  function refresh() { setRefreshKey(k => k + 1) }

  function handleDelete(id) {
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerRowStyle}>
        <div>
          <h1 style={titleStyle}>Application Tracker</h1>
          <p style={subtitleStyle}>Track your applications from saved to offer</p>
        </div>
        <button
          style={addBtnStyle}
          onClick={() => setShowModal(true)}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-navy-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--color-navy)'}
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Application
        </button>
      </div>

      {/* Status Filter Row */}
      <div style={filterRowStyle}>
        {ALL_STATUSES.map(status => (
          <button
            key={status}
            style={statusFilterBtnStyle(activeStatus === status, status)}
            onClick={() => setActiveStatus(status)}
            onMouseEnter={e => { if (activeStatus !== status) { e.currentTarget.style.background = 'var(--color-bg-hover)'; e.currentTarget.style.color = 'var(--color-text-primary)' } }}
            onMouseLeave={e => { if (activeStatus !== status) { e.currentTarget.style.background = 'var(--color-bg)'; e.currentTarget.style.color = 'var(--color-text-secondary)' } }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications list */}
      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Loading…
        </div>
      ) : applications.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', gap: '8px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>No applications yet</p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Save jobs from the feed or add one manually</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {applications.map(app => (
            <ApplicationCard
              key={app.id}
              application={app}
              onUpdate={refresh}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Application Modal */}
      {showModal && (
        <AddApplicationModal
          onClose={() => setShowModal(false)}
          onSaved={refresh}
        />
      )}
    </div>
  )
}

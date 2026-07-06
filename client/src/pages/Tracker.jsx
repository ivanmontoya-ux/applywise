import React, { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { fetchTracker } from '../lib/api'
import ApplicationCard from '../components/ApplicationCard'
import AddApplicationModal from '../components/AddApplicationModal'
import { APPLICATION_STATUSES, getStatusStyle } from '../lib/application'

const ALL_STATUSES = ['All', ...APPLICATION_STATUSES]

const pageStyle = { padding: '36px 40px', maxWidth: '1060px' }
const headerRowStyle = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }
const titleStyle = { fontSize: '28px', lineHeight: '1.15', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '0' }
const subtitleStyle = { fontSize: '16px', color: 'var(--color-text-secondary)', fontWeight: '400' }
const addBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '9px',
  minHeight: 44, padding: '0 16px', background: 'var(--color-applied-teal)', color: '#ffffff',
  border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: '800',
  cursor: 'pointer', transition: 'background 0.12s ease, transform 0.14s ease, box-shadow 0.14s ease', flexShrink: 0,
  boxShadow: 'var(--shadow-primary)',
}
const filterRowStyle = { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '30px' }

function statusFilterBtnStyle(isActive, status) {
  const colorMap = status === 'All'
    ? { bg: 'var(--color-applied-teal)', color: '#ffffff', border: 'var(--color-applied-teal)' }
    : getStatusStyle(status)
  return {
    minHeight: 36,
    padding: '0 14px', borderRadius: '999px',
    border: isActive ? `1.5px solid ${colorMap.border}` : '1.5px solid var(--color-border)',
    fontSize: '13px', fontWeight: isActive ? '800' : '500',
    cursor: 'pointer', transition: 'all 0.12s ease',
    background: isActive ? colorMap.bg : 'var(--color-bg)',
    color: isActive ? colorMap.color : 'var(--color-text-secondary)',
  }
}

function SkeletonLine({ width = '100%', height = 12, radius = 6 }) {
  return <div className="skeleton-block" style={{ width, height, borderRadius: radius }} />
}

function ApplicationSkeleton() {
  return (
    <div className="skeleton-card" style={{
      background: '#ffffff',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px' }}>
        <div style={{ flex: 1 }}>
          <SkeletonLine width="48%" height={15} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <SkeletonLine width={92} height={22} radius={999} />
            <SkeletonLine width={70} height={22} radius={999} />
            <SkeletonLine width={76} height={22} radius={999} />
          </div>
        </div>
        <SkeletonLine width={72} height={28} radius={999} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Array.from({ length: 7 }).map((_, index) => (
          <SkeletonLine key={index} width={index === 2 ? 82 : 68} height={32} radius={6} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <SkeletonLine height={54} radius={8} />
        <SkeletonLine height={54} radius={8} />
      </div>
    </div>
  )
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
          <p style={subtitleStyle}>Move each application from saved role to final outcome with documents and next actions visible.</p>
        </div>
        <button
          className="primary-action"
          style={addBtnStyle}
          onClick={() => setShowModal(true)}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--color-navy-hover)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--color-applied-teal)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {Array.from({ length: 3 }).map((_, index) => <ApplicationSkeleton key={index} />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="interactive-card" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', gap: '10px', padding: '32px', textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
          <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Saved jobs become applications here.</p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Save your first job or add one manually to start tracking deadlines and next actions.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

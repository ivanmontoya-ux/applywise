import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import JobFeed from './pages/JobFeed'
import Tracker from './pages/Tracker'
import Documents from './pages/Documents'
import Coach from './pages/Coach'
import Reminders from './pages/Reminders'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100dvh', overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg-page)' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/feed" element={<JobFeed />} />
            <Route path="/jobs" element={<JobFeed />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/reminders" element={<Reminders />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

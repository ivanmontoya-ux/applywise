import React, { useMemo, useState } from 'react'
import { Check, Crown, Gem, Tag, Zap } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

const plans = [
  {
    id: 'explorer',
    name: 'Explorer',
    price: '€0',
    period: 'forever',
    icon: Tag,
    tone: 'muted',
    features: [
      'Track up to 5 applications',
      'Job search and filters',
      'Basic deadline reminders',
      '1 CV upload',
    ],
  },
  {
    id: 'career_builder',
    name: 'Career Builder',
    price: '€9.99',
    period: 'month',
    icon: Gem,
    tone: 'popular',
    badge: 'Most popular',
    features: [
      'Unlimited application tracking',
      'AI-tailored CVs and cover letters',
      'Interview coaching with AI',
      'Recruiter email templates',
    ],
  },
  {
    id: 'launch',
    name: 'Launch',
    price: '€19.99',
    period: 'month',
    icon: Crown,
    tone: 'premium',
    features: [
      'Everything in Career Builder',
      'Integrated recruiter inbox',
      'Priority AI processing',
      '1:1 coach session credits',
    ],
  },
]

const pageStyle = {
  padding: '36px 40px',
  maxWidth: '1240px',
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '24px',
  flexWrap: 'wrap',
  marginBottom: '26px',
}

const titleStyle = {
  fontSize: '28px',
  lineHeight: '1.15',
  fontWeight: '800',
  color: 'var(--color-text-primary)',
  marginBottom: '8px',
  letterSpacing: 0,
}

const subtitleStyle = {
  fontSize: '16px',
  color: 'var(--color-applied-teal-muted)',
  fontStyle: 'italic',
  lineHeight: '1.5',
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '28px',
  alignItems: 'stretch',
}

const ctaStyle = {
  minHeight: 42,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  width: '100%',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: '#ffffff',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
  fontWeight: '800',
  boxShadow: 'var(--shadow-sm)',
}

function getCardStyle(plan, selected) {
  const isPopular = plan.tone === 'popular'
  return {
    minHeight: 460,
    position: 'relative',
    display: 'grid',
    gridTemplateRows: '34px 76px 48px 1fr auto',
    rowGap: '22px',
    padding: '26px 34px 34px',
    borderRadius: 'var(--radius-lg)',
    border: selected ? '2px solid #0dbfa6' : '1px solid var(--color-border)',
    background: isPopular ? '#078b95' : '#edf6f4',
    color: isPopular ? '#ffffff' : '#0b3034',
    boxShadow: selected ? '0 18px 42px rgba(13, 191, 166, 0.20)' : 'var(--shadow-card)',
    transform: selected ? 'translateY(-3px)' : 'none',
  }
}

function PlanCard({ plan, selected, onSelect }) {
  const Icon = plan.icon
  const isPopular = plan.tone === 'popular'
  const iconBackground = isPopular ? '#d8f5f1' : plan.tone === 'premium' ? '#006a73' : '#5f7d81'
  const iconColor = isPopular ? '#ffffff' : '#ffffff'

  return (
    <article className="interactive-card" style={getCardStyle(plan, selected)}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        {plan.badge && (
          <span style={{
          minHeight: 32,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 36px',
          borderRadius: '999px',
          background: '#0ac7a8',
          color: '#063237',
          fontSize: '11px',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          whiteSpace: 'nowrap',
        }}>
          {plan.badge}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{
          width: 54,
          height: 54,
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: iconBackground,
          color: iconColor,
          flexShrink: 0,
        }}>
          <Icon size={25} strokeWidth={2.4} />
        </span>
        <h2 style={{ fontSize: '24px', lineHeight: '1.15', fontWeight: '900', color: 'inherit', letterSpacing: 0 }}>{plan.name}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontSize: '18px', fontWeight: '900', color: isPopular ? '#ffffff' : '#017f8b' }}>{plan.price}</span>
        <span style={{ fontSize: '15px', color: isPopular ? 'rgba(255,255,255,0.78)' : 'var(--color-applied-teal-muted)' }}>/ {plan.period}</span>
      </div>

      <ul style={{ display: 'grid', alignContent: 'start', gap: '10px', fontSize: '15px', lineHeight: '1.45' }}>
        {plan.features.map(feature => (
          <li key={feature} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: '900', marginTop: '-1px' }}>•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div>
        <button
          type="button"
          onClick={() => onSelect(plan)}
          className={isPopular ? 'primary-action pressable' : 'secondary-action pressable'}
          style={{
            ...ctaStyle,
            borderColor: isPopular ? 'rgba(255,255,255,0.42)' : 'var(--color-border)',
            background: selected ? '#0ac7a8' : isPopular ? 'rgba(255,255,255,0.12)' : '#ffffff',
            color: selected ? '#063237' : isPopular ? '#ffffff' : 'var(--color-text-primary)',
          }}
        >
          {selected ? <Check size={16} strokeWidth={2.5} /> : <Zap size={15} strokeWidth={2.5} />}
          {selected ? 'Selected plan' : plan.id === 'explorer' ? 'Start free' : 'Choose plan'}
        </button>
      </div>
    </article>
  )
}

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState(() => {
    try { return localStorage.getItem('applywise-selected-plan') || 'explorer' } catch { return 'explorer' }
  })
  const selected = useMemo(() => plans.find(plan => plan.id === selectedPlan) || plans[0], [selectedPlan])

  function handleSelect(plan) {
    setSelectedPlan(plan.id)
    try { localStorage.setItem('applywise-selected-plan', plan.id) } catch {}
  }

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Pricing</h1>
          <p style={subtitleStyle}>Freemium model - free to start, upgrade when the job hunt gets serious.</p>
        </div>
        <BrandLogo
          width={210}
          style={{ paddingTop: '4px', background: 'transparent' }}
          imgStyle={{ mixBlendMode: 'multiply', background: 'transparent' }}
        />
      </header>

      <section style={gridStyle} className="pricing-grid">
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} selected={selectedPlan === plan.id} onSelect={handleSelect} />
        ))}
      </section>

      <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
        <p style={{ color: 'var(--color-applied-teal-muted)', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.5' }}>
          All paid plans: 20% off with annual billing • Free for verified university career-center partners
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
          padding: '16px 18px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          background: '#ffffff',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--color-text-primary)', marginBottom: '3px' }}>
              Current subscription: {selected.name}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>
              Plan selection is saved for the demo. Connect Stripe or a Supabase billing function before taking real payments.
            </p>
          </div>
          <span style={{
            minHeight: 30,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 10px',
            borderRadius: '999px',
            background: 'var(--color-applied-teal-soft)',
            color: 'var(--color-applied-teal)',
            fontSize: '12px',
            fontWeight: '900',
            whiteSpace: 'nowrap',
          }}>
            Demo billing
          </span>
        </div>
      </div>
    </div>
  )
}

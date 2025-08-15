import React, { memo } from 'react'
import { Link } from 'react-router-dom'

const HomePage = memo(() => {
  return (
    <div className="home-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '700', 
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Poker AI Solver
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--color-text-secondary)', 
          maxWidth: '600px', 
          margin: '0 auto' 
        }}>
          Advanced AI-powered poker analysis with optimized performance for lightning-fast calculations.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        <FeatureCard
          icon="🧠"
          title="Poker Solver"
          description="Advanced GTO solver for optimal play decisions"
          link="/solver"
          performance="< 100ms calculations"
        />
        <FeatureCard
          icon="🔍"
          title="Hand Analyzer"
          description="Detailed hand analysis with equity calculations"
          link="/analyzer"
          performance="Real-time analysis"
        />
        <FeatureCard
          icon="📊"
          title="Range Calculator"
          description="Pre-flop and post-flop range construction tools"
          link="/ranges"
          performance="Instant range updates"
        />
      </div>

      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>
          Performance Optimized
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <MetricCard title="Bundle Size" value="< 200KB" description="Gzipped" />
          <MetricCard title="First Paint" value="< 1.2s" description="LCP Target" />
          <MetricCard title="Interactivity" value="< 300ms" description="FID Target" />
          <MetricCard title="Layout Shift" value="< 0.1" description="CLS Score" />
        </div>
      </div>
    </div>
  )
})

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  link: string
  performance: string
}

const FeatureCard = memo<FeatureCardProps>(({ icon, title, description, link, performance }) => (
  <Link 
    to={link} 
    className="card"
    style={{ 
      textDecoration: 'none', 
      color: 'inherit',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      border: '1px solid #374151'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
      e.currentTarget.style.borderColor = 'var(--color-accent)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      e.currentTarget.style.borderColor = '#374151'
    }}
  >
    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
      {title}
    </h3>
    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
      {description}
    </p>
    <div style={{ 
      fontSize: '0.875rem', 
      color: 'var(--color-success)', 
      fontWeight: '500',
      padding: '0.25rem 0.5rem',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderRadius: '0.25rem',
      display: 'inline-block'
    }}>
      ⚡ {performance}
    </div>
  </Link>
))

interface MetricCardProps {
  title: string
  value: string
  description: string
}

const MetricCard = memo<MetricCardProps>(({ title, value, description }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ 
      fontSize: '1.5rem', 
      fontWeight: '700', 
      color: 'var(--color-success)',
      marginBottom: '0.25rem'
    }}>
      {value}
    </div>
    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{title}</div>
    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
      {description}
    </div>
  </div>
))

FeatureCard.displayName = 'FeatureCard'
MetricCard.displayName = 'MetricCard'
HomePage.displayName = 'HomePage'

export default HomePage
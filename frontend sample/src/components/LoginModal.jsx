import { useState } from 'react'

const USER_TYPES = [
  {
    id: 'jobseeker',
    label: 'Job Seeker',
    icon: '🎯',
    desc: 'Find your next opportunity',
    color: '#2A7D4F',
    pale: '#EDFAF3',
  },
  {
    id: 'employer',
    label: 'Employer',
    icon: '🏢',
    desc: 'Hire exceptional talent',
    color: '#1D4ED8',
    pale: '#EFF6FF',
  },
  {
    id: 'recruiter',
    label: 'Recruiter',
    icon: '🤝',
    desc: 'Manage your placements',
    color: '#7C3AED',
    pale: '#F5F3FF',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: '⚙️',
    desc: 'Platform administration',
    color: '#D97706',
    pale: '#FEF3C7',
  },
]

export default function LoginModal({ onClose }) {
  const [step, setStep] = useState('select') // 'select' | 'form'
  const [selected, setSelected] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleTypeSelect = (type) => {
    setSelected(type)
    setStep('form')
  }

  const handleBack = () => {
    setStep('select')
    setSelected(null)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    alert(`Login as ${selected.label} — connect your backend here!`)
    onClose()
  }

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 9998,
    background: 'rgba(28,25,23,0.65)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
    animation: 'fadeIn 0.25s ease',
  }

  const modalStyle = {
    background: 'var(--warm-white)',
    borderRadius: '20px',
    width: '100%',
    maxWidth: step === 'select' ? '520px' : '420px',
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(28,25,23,0.3)',
    animation: 'scaleIn 0.3s cubic-bezier(0.34,1.3,0.64,1)',
    transition: 'max-width 0.3s ease',
  }

  return (
    <div style={overlayStyle} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        {/* Modal Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid var(--warm-tan)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {step === 'form' && (
              <button
                onClick={handleBack}
                style={{
                  background: 'var(--warm-cream)', border: '1.5px solid var(--warm-tan)',
                  borderRadius: '8px', width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '14px', color: 'var(--brown-gray)',
                  transition: 'all 0.18s',
                }}
              >←</button>
            )}
            <div>
              <div style={{
                fontFamily: "'Fraunces', serif", fontSize: '20px',
                fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1.1,
              }}>
                {step === 'select' ? 'Welcome Back' : `Sign in as ${selected.label}`}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 300, marginTop: '2px' }}>
                {step === 'select' ? 'Choose how you want to sign in' : selected.desc}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--warm-cream)', border: '1.5px solid var(--warm-tan)',
              fontSize: '16px', color: 'var(--muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>
          {step === 'select' ? (
            <>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
                {USER_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type)}
                    style={{
                      background: 'var(--warm-cream)',
                      border: '1.5px solid var(--warm-tan)',
                      borderRadius: '14px',
                      padding: '20px 18px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = type.pale
                      e.currentTarget.style.borderColor = type.color
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = `0 8px 24px ${type.color}22`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--warm-cream)'
                      e.currentTarget.style.borderColor = 'var(--warm-tan)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ fontSize: '26px', marginBottom: '10px' }}>{type.icon}</div>
                    <div style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: '16px', fontWeight: 700,
                      color: 'var(--charcoal)', marginBottom: '4px',
                    }}>{type.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 300 }}>
                      {type.desc}
                    </div>
                    <div style={{
                      position: 'absolute', top: '16px', right: '16px',
                      fontSize: '16px', color: 'var(--warm-tan)',
                    }}>→</div>
                  </button>
                ))}
              </div>
              <div style={{
                textAlign: 'center', marginTop: '20px',
                fontSize: '12px', color: 'var(--muted)',
              }}>
                New here?{' '}
                <span style={{ color: 'var(--red)', fontWeight: 600, cursor: 'pointer' }}>
                  Create an account
                </span>
              </div>
            </>
          ) : (
            <form onSubmit={handleLogin}>
              {/* Selected badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: selected.pale,
                border: `1px solid ${selected.color}33`,
                borderRadius: '100px', padding: '5px 14px',
                fontSize: '12px', fontWeight: 600,
                color: selected.color,
                marginBottom: '20px',
              }}>
                {selected.icon} Logging in as {selected.label}
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{
                  fontSize: '12px', fontWeight: 600,
                  color: 'var(--brown-gray)', letterSpacing: '0.07em',
                  textTransform: 'uppercase', display: 'block', marginBottom: '7px',
                }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '13px 16px',
                    border: '1.5px solid var(--warm-tan)',
                    borderRadius: '10px', fontSize: '14px',
                    color: 'var(--charcoal)', background: 'var(--warm-cream)',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = selected.color}
                  onBlur={e => e.target.style.borderColor = 'var(--warm-tan)'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '7px',
                }}>
                  <label style={{
                    fontSize: '12px', fontWeight: 600,
                    color: 'var(--brown-gray)', letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                  }}>Password</label>
                  <span style={{ fontSize: '12px', color: 'var(--red)', cursor: 'pointer', fontWeight: 500 }}>
                    Forgot password?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%', padding: '13px 44px 13px 16px',
                      border: '1.5px solid var(--warm-tan)',
                      borderRadius: '10px', fontSize: '14px',
                      color: 'var(--charcoal)', background: 'var(--warm-cream)',
                      outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = selected.color}
                    onBlur={e => e.target.style.borderColor = 'var(--warm-tan)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      fontSize: '16px', cursor: 'pointer', color: 'var(--muted)',
                    }}
                  >{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', padding: '14px',
                  background: selected.color,
                  color: '#fff', border: 'none',
                  borderRadius: '10px', fontSize: '15px', fontWeight: 700,
                  transition: 'opacity 0.2s, transform 0.15s',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Sign In as {selected.label} →
              </button>

              <div style={{
                textAlign: 'center', marginTop: '16px',
                fontSize: '12px', color: 'var(--muted)',
              }}>
                Don't have an account?{' '}
                <span style={{ color: 'var(--red)', fontWeight: 600, cursor: 'pointer' }}>
                  Sign up free
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
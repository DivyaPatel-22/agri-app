import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const [tab, setTab] = useState('login') // 'login' | 'signup' | 'reset'
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [resetSent, setResetSent] = useState(false)

    const { login, signup, loginWithGoogle, resetPassword } = useAuth()
    const navigate = useNavigate()

    const clearError = () => setError('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            if (tab === 'login') {
                await login(email, password)
            } else {
                if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return }
                await signup(email, password, name.trim())
            }
            navigate('/')
        } catch (err) {
            const msg = {
                'auth/invalid-credential': 'Incorrect email or password.',
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/email-already-in-use': 'This email is already registered. Please sign in.',
                'auth/weak-password': 'Password must be at least 6 characters.',
                'auth/invalid-email': 'Please enter a valid email address.',
            }[err.code] || 'Something went wrong. Please try again.'
            setError(msg)
        }
        setLoading(false)
    }

    const handleGoogle = async () => {
        setError('')
        setLoading(true)
        try {
            await loginWithGoogle()
            navigate('/')
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('Google sign-in failed. Please try again.')
            }
        }
        setLoading(false)
    }

    const handleReset = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await resetPassword(email)
            setResetSent(true)
        } catch {
            setError('Could not send reset email. Check the address and try again.')
        }
        setLoading(false)
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 40%, #388e3c 70%, #43a047 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}>
            {/* Background pattern */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
                background: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(255,255,255,0.04) 0%, transparent 50%)`
            }} />

            <div style={{
                width: '100%', maxWidth: 440, position: 'relative', zIndex: 1,
                animation: 'fadeUp 0.5s ease'
            }}>
                {/* Logo / Hero */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        fontSize: 56, marginBottom: 8,
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                        animation: 'floatIcon 3s ease-in-out infinite'
                    }}>🌾</div>
                    <h1 style={{
                        color: '#fff', fontSize: '1.9rem', fontWeight: 800,
                        margin: 0, letterSpacing: '-0.5px',
                        textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>Kisan Saathi</h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.75)', margin: '6px 0 0',
                        fontSize: '0.9rem', fontWeight: 400
                    }}>Your Smart Farming Companion</p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.97)',
                    borderRadius: 20,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
                    padding: '32px 36px',
                    backdropFilter: 'blur(10px)',
                }}>

                    {/* Password Reset View */}
                    {tab === 'reset' ? (
                        <>
                            <button onClick={() => { setTab('login'); setResetSent(false); setError('') }}
                                style={{ background: 'none', border: 'none', color: '#388e3c', cursor: 'pointer', fontSize: '0.85rem', padding: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                                ← Back to Sign In
                            </button>
                            <h2 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 700, color: '#1b5e20' }}>Reset Password</h2>
                            <p style={{ margin: '0 0 20px', color: '#666', fontSize: '0.87rem' }}>We'll send a reset link to your email.</p>
                            {resetSent ? (
                                <div style={{ background: '#E8F5E9', border: '1.5px solid #4CAF50', borderRadius: 10, padding: '14px 16px', color: '#2E7D32', fontWeight: 600, textAlign: 'center' }}>
                                    ✅ Reset email sent! Check your inbox.
                                </div>
                            ) : (
                                <form onSubmit={handleReset}>
                                    <InputField label="Email Address" type="email" value={email} onChange={e => { setEmail(e.target.value); clearError() }} placeholder="you@example.com" />
                                    {error && <ErrorBox msg={error} />}
                                    <SubmitBtn loading={loading} label="Send Reset Link" />
                                </form>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: '#f5f5f5', borderRadius: 12, padding: 4 }}>
                                {['login', 'signup'].map(t => (
                                    <button key={t} onClick={() => { setTab(t); setError('') }} style={{
                                        flex: 1, padding: '9px 0', border: 'none', borderRadius: 9, cursor: 'pointer',
                                        fontWeight: 600, fontSize: '0.9rem',
                                        background: tab === t ? '#fff' : 'transparent',
                                        color: tab === t ? '#2e7d32' : '#888',
                                        boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.2s',
                                    }}>
                                        {t === 'login' ? '🔑 Sign In' : '🌱 Sign Up'}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit}>
                                {tab === 'signup' && (
                                    <InputField label="Full Name" type="text" value={name}
                                        onChange={e => { setName(e.target.value); clearError() }}
                                        placeholder="Your name" autoFocus />
                                )}
                                <InputField label="Email Address" type="email" value={email}
                                    onChange={e => { setEmail(e.target.value); clearError() }}
                                    placeholder="you@example.com"
                                    autoFocus={tab === 'login'} />
                                <div style={{ position: 'relative' }}>
                                    <InputField label="Password" type={showPass ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); clearError() }}
                                        placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'} />
                                    <button type="button" onClick={() => setShowPass(v => !v)} style={{
                                        position: 'absolute', right: 12, top: 36,
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: '1rem', color: '#888',
                                    }}>{showPass ? '🙈' : '👁️'}</button>
                                </div>

                                {tab === 'login' && (
                                    <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 14 }}>
                                        <button type="button" onClick={() => { setTab('reset'); setError('') }}
                                            style={{ background: 'none', border: 'none', color: '#388e3c', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}>
                                            Forgot password?
                                        </button>
                                    </div>
                                )}

                                {error && <ErrorBox msg={error} />}
                                <SubmitBtn loading={loading} label={tab === 'login' ? 'Sign In' : 'Create Account'} />
                            </form>

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
                                <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
                                <span style={{ color: '#aaa', fontSize: '0.78rem', fontWeight: 500 }}>OR</span>
                                <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
                            </div>

                            {/* Google Button */}
                            <button onClick={handleGoogle} disabled={loading} style={{
                                width: '100%', padding: '12px', border: '1.5px solid #e0e0e0',
                                borderRadius: 12, background: '#fff', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                fontSize: '0.92rem', fontWeight: 600, color: '#333',
                                transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                            }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'}
                            >
                                <svg width="18" height="18" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                                </svg>
                                Continue with Google
                            </button>
                        </>
                    )}
                </div>

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginTop: 20 }}>
                    🔒 Secured by Firebase Authentication
                </p>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes floatIcon {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-8px); }
                }
            `}</style>
        </div>
    )
}

function InputField({ label, type, value, onChange, placeholder, autoFocus }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: '#444', marginBottom: 6 }}>
                {label}
            </label>
            <input
                type={type} value={value} onChange={onChange}
                placeholder={placeholder} autoFocus={autoFocus} required
                style={{
                    width: '100%', padding: '11px 14px', border: '1.5px solid #e0e0e0',
                    borderRadius: 10, fontSize: '0.93rem', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s', background: '#fafafa', color: '#222',
                }}
                onFocus={e => e.target.style.borderColor = '#388e3c'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
        </div>
    )
}

function ErrorBox({ msg }) {
    return (
        <div style={{
            background: '#FFEBEE', border: '1.5px solid #EF9A9A', borderRadius: 10,
            padding: '10px 14px', color: '#C62828', fontSize: '0.85rem',
            marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
        }}>
            ⚠️ {msg}
        </div>
    )
}

function SubmitBtn({ loading, label }) {
    return (
        <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', border: 'none', borderRadius: 12,
            background: loading ? '#81C784' : 'linear-gradient(135deg, #2e7d32, #43a047)',
            color: '#fff', fontWeight: 700, fontSize: '0.97rem', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(46,125,50,0.35)', transition: 'all 0.2s',
            letterSpacing: '0.3px',
        }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
            {loading ? '⏳ Please wait...' : label}
        </button>
    )
}

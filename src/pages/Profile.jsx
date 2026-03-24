import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SOIL_TYPES = ['clay', 'sandy', 'loamy', 'black', 'red', 'alluvial']
const CROPS = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Tomato', 'Onion', 'Chilli', 'Groundnut']

export default function Profile() {
    const { t, i18n } = useTranslation()
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    const [profile, setProfile] = useState({
        name: '', phone: '', location: '', landSize: '', soilType: 'loamy',
        preferredCrops: [], language: 'en', lastCrop: '', otp: '', otpSent: false, verified: false
    })
    const [saved, setSaved] = useState(false)
    const [detecting, setDetecting] = useState(false)
    const [otpStatus, setOtpStatus] = useState('') // 'success' | 'error' | ''
    const [demoOtp, setDemoOtp] = useState('')
    const [locationError, setLocationError] = useState('')

    const handleSignOut = async () => {
        await logout()
        navigate('/login')
    }

    useEffect(() => {
        const saved = localStorage.getItem('kisanProfile')
        if (saved) {
            setProfile(JSON.parse(saved))
        } else if (currentUser?.displayName) {
            setProfile(p => ({ ...p, name: currentUser.displayName }))
        }
    }, [])

    const handleSave = () => {
        localStorage.setItem('kisanProfile', JSON.stringify(profile))
        i18n.changeLanguage(profile.language)
        localStorage.setItem('kisanLang', profile.language)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    const detectLocation = () => {
        setDetecting(true)
        setLocationError('')
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
                    const data = await res.json()
                    const loc = data.address?.state_district || data.address?.city || data.address?.state || 'Your Location'
                    setProfile(p => ({ ...p, location: loc }))
                } catch {
                    setProfile(p => ({ ...p, location: 'Location detected' }))
                }
                setDetecting(false)
            },
            () => { setDetecting(false); setLocationError('Could not detect location. Please enter manually.') }
        )
    }

    const handleSendOtp = () => {
        if (!profile.phone || profile.phone.length < 8) {
            setOtpStatus('phone_error')
            return
        }
        // Demo OTP = last 4 digits of phone number
        const demo = profile.phone.replace(/\D/g, '').slice(-4)
        setDemoOtp(demo)
        setProfile(p => ({ ...p, otpSent: true, otp: '', verified: false }))
        setOtpStatus('sent')
    }

    const handleVerifyOtp = () => {
        if (profile.otp === demoOtp) {
            setOtpStatus('success')
            setProfile(p => ({ ...p, verified: true }))
        } else {
            setOtpStatus('error')
        }
    }

    const toggleCrop = (crop) => {
        setProfile(p => ({
            ...p,
            preferredCrops: p.preferredCrops.includes(crop)
                ? p.preferredCrops.filter(c => c !== crop)
                : [...p.preferredCrops, crop]
        }))
    }

    const memory = {
        lastCrop: localStorage.getItem('kisanLastCrop') || profile.lastCrop || '—',
        lastQuestion: localStorage.getItem('kisanLastQuestion') || '—'
    }

    return (
        <div className="page">
            {/* Profile Hero */}
            <div className="profile-hero">
                <div className="profile-avatar">🧑‍🌾</div>
                <div className="profile-name">{profile.name || currentUser?.displayName || t('profile.title')}</div>
                {currentUser?.email && <div className="profile-sub">✉️ {currentUser.email}</div>}
                {profile.location && <div className="profile-sub">📍 {profile.location}</div>}
                {profile.landSize && <div className="profile-sub">🌾 {profile.landSize} acres | {t(`soil.${profile.soilType}`)}</div>}
            </div>

            {/* Phone Login */}
            <div className="card">
                <div className="card-title">📱 {t('profile.phone')}</div>

                {/* Verified Badge */}
                {profile.verified && (
                    <div style={{ background: '#E8F5E9', border: '1.5px solid #4CAF50', borderRadius: 10, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#2E7D32', fontWeight: 600, fontSize: '0.9rem' }}>
                        ✅ Phone Verified — {profile.phone}
                    </div>
                )}

                {!profile.verified && (
                    <>
                        <div className="form-group">
                            <label className="form-label">{t('profile.phone')}</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    className="form-input"
                                    placeholder="+91 XXXXXXXXXX"
                                    value={profile.phone}
                                    onChange={e => { setProfile(p => ({ ...p, phone: e.target.value, otpSent: false, otp: '' })); setOtpStatus('') }}
                                    type="tel"
                                    maxLength={13}
                                    disabled={profile.otpSent}
                                />
                                <button
                                    className="btn btn-primary btn-sm btn-icon"
                                    style={{ whiteSpace: 'nowrap' }}
                                    onClick={handleSendOtp}
                                    disabled={profile.otpSent}
                                >
                                    {t('profile.otp')}
                                </button>
                            </div>
                            {otpStatus === 'phone_error' && <div style={{ color: '#C62828', fontSize: '0.82rem', marginTop: 4 }}>⚠️ Please enter a valid phone number first.</div>}
                        </div>

                        {profile.otpSent && (
                            <div className="form-group">
                                {/* Demo OTP hint */}
                                <div style={{ background: '#FFF8E1', border: '1px solid #FFB300', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: '0.82rem', color: '#E65100' }}>
                                    📲 Demo OTP sent! Use <strong>{demoOtp}</strong> to verify (last 4 digits of your phone).
                                </div>
                                <label className="form-label">{t('profile.otpVerify')}</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input
                                        className="form-input"
                                        placeholder="Enter OTP"
                                        value={profile.otp}
                                        onChange={e => { setProfile(p => ({ ...p, otp: e.target.value })); setOtpStatus('') }}
                                        type="tel"
                                        maxLength={6}
                                        onKeyPress={e => e.key === 'Enter' && handleVerifyOtp()}
                                        style={{ borderColor: otpStatus === 'error' ? '#C62828' : otpStatus === 'success' ? '#4CAF50' : undefined }}
                                        autoFocus
                                    />
                                    <button
                                        className="btn btn-primary btn-sm btn-icon"
                                        style={{ whiteSpace: 'nowrap' }}
                                        onClick={handleVerifyOtp}
                                    >
                                        {t('profile.otpVerify')}
                                    </button>
                                </div>
                                {otpStatus === 'error' && (
                                    <div style={{ color: '#C62828', fontSize: '0.82rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        ❌ Incorrect OTP. Please try again.
                                    </div>
                                )}
                                {otpStatus === 'sent' && (
                                    <div style={{ color: '#0277BD', fontSize: '0.82rem', marginTop: 6 }}>📨 OTP sent. Enter it above to verify.</div>
                                )}
                                <button style={{ background: 'none', border: 'none', color: 'var(--green-main)', fontSize: '0.82rem', cursor: 'pointer', marginTop: 4, padding: 0 }}
                                    onClick={() => { setProfile(p => ({ ...p, otpSent: false, otp: '' })); setOtpStatus('') }}>
                                    ← Change number
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Basic Info */}
            <div className="card">
                <div className="card-title">👤 Basic Information</div>
                <div className="form-group">
                    <label className="form-label">{t('profile.name')}</label>
                    <input className="form-input" placeholder="Enter your name" value={profile.name}
                        onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label className="form-label">{t('profile.location')}</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input className="form-input" placeholder="Village, District, State" value={profile.location}
                            onChange={e => { setProfile(p => ({ ...p, location: e.target.value })); setLocationError('') }} />
                        <button className="btn btn-secondary btn-sm btn-icon" style={{ whiteSpace: 'nowrap' }}
                            onClick={detectLocation} disabled={detecting} title={t('profile.detectLocation')}>
                            {detecting ? '⏳' : '📍'}
                        </button>
                    </div>
                    {locationError && <div style={{ color: '#C62828', fontSize: '0.82rem', marginTop: 4 }}>⚠️ {locationError}</div>}
                </div>
                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">{t('profile.landSize')}</label>
                        <input className="form-input" placeholder="e.g. 5" type="number" value={profile.landSize}
                            onChange={e => setProfile(p => ({ ...p, landSize: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('profile.soilType')}</label>
                        <select className="form-select" value={profile.soilType}
                            onChange={e => setProfile(p => ({ ...p, soilType: e.target.value }))}>
                            {SOIL_TYPES.map(s => <option key={s} value={s}>{t(`soil.${s}`)}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">{t('profile.language')}</label>
                    <select className="form-select" value={profile.language}
                        onChange={e => setProfile(p => ({ ...p, language: e.target.value }))}>
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                        <option value="te">తెలుగు</option>
                    </select>
                </div>
            </div>

            {/* Preferred Crops */}
            <div className="card">
                <div className="card-title">🌾 {t('profile.preferredCrops')}</div>
                <div className="crop-tags">
                    {CROPS.map(crop => (
                        <div
                            key={crop}
                            className={`crop-tag ${profile.preferredCrops.includes(crop) ? 'selected' : ''}`}
                            onClick={() => toggleCrop(crop)}
                        >
                            {crop}
                        </div>
                    ))}
                </div>
            </div>

            {/* Last Crop */}
            <div className="card">
                <div className="card-title">🌱 Last Crop Grown</div>
                <div className="form-group">
                    <input className="form-input" placeholder="e.g. Wheat, Rice" value={profile.lastCrop}
                        onChange={e => {
                            setProfile(p => ({ ...p, lastCrop: e.target.value }))
                            localStorage.setItem('kisanLastCrop', e.target.value)
                        }} />
                </div>
            </div>

            {/* AI Memory */}
            <div className="card">
                <div className="card-title">🧠 {t('profile.memory')}</div>
                <div className="memory-item"><span className="memory-icon">🌾</span><span>{t('profile.lastCrop')}: <strong>{memory.lastCrop}</strong></span></div>
                <div className="memory-item"><span className="memory-icon">❓</span><span>{t('profile.lastQuestion')}: <strong>{memory.lastQuestion}</strong></span></div>
                <div className="memory-item"><span className="memory-icon">🌍</span><span>Language: <strong>{profile.language === 'en' ? 'English' : profile.language === 'hi' ? 'हिंदी' : 'తెలుగు'}</strong></span></div>
            </div>

            <button className="btn btn-primary" onClick={handleSave}>💾 {t('profile.save')}</button>
            {saved && <div className="toast-success">✅ {t('profile.saved')}</div>}

            {/* Sign Out */}
            <button
                className="btn"
                onClick={handleSignOut}
                style={{ marginTop: 12, background: 'linear-gradient(135deg,#c62828,#e53935)', color: '#fff', width: '100%' }}
            >
                🚪 Sign Out
            </button>
        </div>
    )
}

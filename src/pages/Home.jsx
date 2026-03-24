import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLangData } from '../data/langData'

const quickActions = [
    { path: '/weather', icon: '🌤️', labelKey: 'nav.weather', bg: '#E3F2FD', iconBg: '#BBDEFB' },
    { path: '/market-price', icon: '📊', labelKey: 'nav.marketPrice', bg: '#FFF8E1', iconBg: '#FFE082' },
    { path: '/leaf-detection', icon: '🌿', labelKey: 'nav.leafDetection', bg: '#E8F5E9', iconBg: '#A5D6A7' },
    { path: '/crop-agent', icon: '🌾', labelKey: 'nav.cropAgent', bg: '#F3E5F5', iconBg: '#CE93D8' },
    { path: '/schemes', icon: '📋', labelKey: 'nav.schemes', bg: '#FBE9E7', iconBg: '#FFAB91' },
    { path: '/community', icon: '👥', labelKey: 'nav.community', bg: '#E0F2F1', iconBg: '#80CBC4' },
]

export default function Home({ setVoiceOpen }) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const d = getLangData(i18n.language)
    const profile = JSON.parse(localStorage.getItem('kisanProfile') || '{}')
    const farmerName = profile.name || 'Farmer'

    return (
        <div className="page">
            <div className="hero-section">
                <div className="hero-welcome">🙏 {t('home.welcome')}, {farmerName}!</div>
                <div className="hero-sub">{t('home.subtitle')}</div>
                <div className="hero-tagline">
                    <span>💡</span>
                    <span>{t('home.tagline')}</span>
                </div>
                <button className="btn btn-amber" style={{ marginTop: 16, maxWidth: 260 }} onClick={() => setVoiceOpen(true)}>
                    🎤 {t('home.askVoice')}
                </button>
            </div>

            <div className="section-title">⚡ {t('home.quickActions')}</div>
            <div className="grid-3" style={{ marginBottom: 20 }}>
                {quickActions.map(item => (
                    <div key={item.path} className="quick-tile" style={{ background: item.bg }} onClick={() => navigate(item.path)}>
                        <div className="quick-tile-icon" style={{ background: item.iconBg }}>{item.icon}</div>
                        <div className="quick-tile-label">{t(item.labelKey)}</div>
                    </div>
                ))}
            </div>

            <div className="section-title">🌟 {t('home.latestNews')}</div>
            <div className="card">
                {d.homeTips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < d.homeTips.length - 1 ? '1px solid var(--green-bg)' : 'none', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 22 }}>{tip.icon}</span>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>{tip.text}</span>
                    </div>
                ))}
            </div>

            {!profile.name && (
                <div className="card" style={{ borderLeft: '4px solid var(--amber)', background: '#FFF8E1' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 28 }}>👤</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{t('profile.title')}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-mid)', marginBottom: 10 }}>{t('home.subtitle')}</div>
                            <button className="btn btn-amber btn-sm btn-icon" onClick={() => navigate('/profile')}>
                                {t('profile.save')} →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

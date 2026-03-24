import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const navItems = [
    { path: '/', icon: '🏠', labelKey: 'nav.home' },
    { path: '/profile', icon: '👤', labelKey: 'nav.profile' },
    { path: '/weather', icon: '🌤️', labelKey: 'nav.weather' },
    { path: '/market-price', icon: '📊', labelKey: 'nav.marketPrice' },
    { path: '/leaf-detection', icon: '🌿', labelKey: 'nav.leafDetection' },
    { path: '/crop-agent', icon: '🌾', labelKey: 'nav.cropAgent' },
    { path: '/schemes', icon: '📋', labelKey: 'nav.schemes' },
    { path: '/community', icon: '👥', labelKey: 'nav.community' },
]

const languages = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिं' },
    { code: 'te', label: 'తె' },
]

export default function Navbar({ voiceOpen, setVoiceOpen }) {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()

    const changeLanguage = (code) => {
        i18n.changeLanguage(code)
        localStorage.setItem('kisanLang', code)
    }

    return (
        <>
            {/* Top Bar */}
            <nav className="navbar">
                <a className="navbar-brand" href="/" onClick={e => { e.preventDefault(); navigate('/') }}>
                    <div className="navbar-logo">🌾</div>
                    <div className="navbar-title">
                        KisanSaathi
                        <span>किसान साथी</span>
                    </div>
                </a>

                <div className="navbar-actions">
                    <div className="lang-toggle">
                        {languages.map(lang => (
                            <button
                                key={lang.code}
                                className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
                                onClick={() => changeLanguage(lang.code)}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                    <button className="mic-fab" onClick={() => setVoiceOpen(true)} title="Voice Assistant">
                        🎤
                    </button>
                </div>
            </nav>

            {/* Bottom Navigation (Mobile) */}
            <nav className="bottom-nav">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <div className="nav-icon-wrap">{item.icon}</div>
                        <span className="nav-label">{t(item.labelKey).split('(')[0].trim()}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Side Navigation (Desktop) */}
            <nav className="side-nav">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => `side-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="side-nav-icon">{item.icon}</span>
                        {t(item.labelKey)}
                    </NavLink>
                ))}
                <div style={{ marginTop: 'auto', paddingTop: 16 }}>
                    <button
                        className="btn btn-amber btn-sm"
                        onClick={() => setVoiceOpen(true)}
                        style={{ gap: 6 }}
                    >
                        🎤 {t('voice.title')}
                    </button>
                </div>
            </nav>
        </>
    )
}

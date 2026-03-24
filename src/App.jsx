import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './components/Navbar'
import AlertBanner from './components/AlertBanner'
import VoiceAssistant from './components/VoiceAssistant'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Community from './pages/Community'
import LeafDetection from './pages/LeafDetection'
import Weather from './pages/Weather'
import MarketPrice from './pages/MarketPrice'
import Schemes from './pages/Schemes'
import CropAgent from './pages/CropAgent'
import Login from './pages/Login'

function AppShell() {
    const { i18n } = useTranslation()
    const [alerts, setAlerts] = useState([])
    const [voiceOpen, setVoiceOpen] = useState(false)
    const location = useLocation()
    const isLoginPage = location.pathname === '/login'

    useEffect(() => {
        const savedAlerts = localStorage.getItem('kisanAlerts')
        if (!savedAlerts) {
            const initial = [
                { id: 1, type: 'rain', icon: '🌧️' },
                { id: 2, type: 'scheme', icon: '📋' },
            ]
            setAlerts(initial)
            localStorage.setItem('kisanAlerts', JSON.stringify(initial))
        } else {
            setAlerts(JSON.parse(savedAlerts))
        }
    }, [])

    const dismissAlert = (id) => {
        const updated = alerts.filter(a => a.id !== id)
        setAlerts(updated)
        localStorage.setItem('kisanAlerts', JSON.stringify(updated))
    }

    return (
        <div className="app-container" lang={i18n.language}>
            {!isLoginPage && <Navbar voiceOpen={voiceOpen} setVoiceOpen={setVoiceOpen} />}
            <main className={isLoginPage ? '' : 'main-content'}>
                {!isLoginPage && <AlertBanner alerts={alerts} onDismiss={dismissAlert} />}
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected */}
                    <Route path="/" element={<ProtectedRoute><Home setVoiceOpen={setVoiceOpen} /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                    <Route path="/leaf-detection" element={<ProtectedRoute><LeafDetection /></ProtectedRoute>} />
                    <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
                    <Route path="/market-price" element={<ProtectedRoute><MarketPrice /></ProtectedRoute>} />
                    <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
                    <Route path="/crop-agent" element={<ProtectedRoute><CropAgent /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            {voiceOpen && !isLoginPage && <VoiceAssistant onClose={() => setVoiceOpen(false)} />}
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <AppShell />
        </BrowserRouter>
    )
}

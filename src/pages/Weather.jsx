import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getLangData } from '../data/langData'

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
const DAYS_TE = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని']
const TODAY_LABELS = { en: 'Today', hi: 'आज', te: 'నేడు' }

function getDays(lang) {
    if (lang === 'hi') return DAYS_HI
    if (lang === 'te') return DAYS_TE
    return DAYS_EN
}

function getWeatherAdvice(data, d) {
    if (!data) return ''
    const maxRain = Math.max(...(data.daily?.precipitation_probability_max || [0]))
    const maxTemp = data.daily?.temperature_2m_max?.[0] || 0
    const windspeed = data.current_weather?.windspeed || 0
    const humid = data.hourly?.relativehumidity_2m?.[12] || 50
    const parts = []
    if (maxRain > 60) parts.push(d.weatherAdvice.heavyRain)
    else if (maxRain > 40) parts.push(d.weatherAdvice.moderateRain)
    if (maxTemp > 38) parts.push(d.weatherAdvice.extremeHeat)
    if (windspeed > 20) parts.push(d.weatherAdvice.strongWind)
    if (humid > 80) parts.push(d.weatherAdvice.highHumidity)
    if (parts.length === 0) parts.push(d.weatherAdvice.good)
    return parts.join('\n\n')
}

export default function Weather() {
    const { t, i18n } = useTranslation()
    const [weather, setWeather] = useState(null)
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords
                try {
                    const [weatherRes, geoRes] = await Promise.all([
                        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=Asia%2FKolkata`),
                        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
                    ])
                    const wData = await weatherRes.json()
                    const gData = await geoRes.json()
                    setWeather(wData)
                    setLocation(gData.address?.state_district || gData.address?.city || gData.address?.state || 'Your Location')
                } catch { setError('Failed to fetch weather data') }
                setLoading(false)
            },
            () => {
                fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6&longitude=77.2&current_weather=true&hourly=relativehumidity_2m,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=Asia%2FKolkata')
                    .then(r => r.json())
                    .then(data => { setWeather(data); setLocation('New Delhi'); setLoading(false) })
                    .catch(() => { setError('Failed to fetch weather'); setLoading(false) })
            }
        )
    }, [])

    const d = getLangData(i18n.language)
    const DAYS = getDays(i18n.language)
    const todayLabel = TODAY_LABELS[i18n.language] || 'Today'

    if (loading) return <div className="page"><div className="loading-container"><div className="spinner" />{t('weather.detecting')}</div></div>
    if (error) return <div className="page"><div className="empty-state"><div className="empty-icon">⚠️</div><div className="empty-text">{error}</div></div></div>

    const current = weather?.current_weather
    const daily = weather?.daily
    const humidity = weather?.hourly?.relativehumidity_2m?.[new Date().getHours()] || 65
    const wcode = current?.weathercode || 0
    const wInfo = d.weatherCodes[wcode] || d.weatherCodes[0] || { label: 'Clear', icon: '☀️' }
    const todayDate = new Date()

    return (
        <div className="page">
            <div className="weather-main">
                <div style={{ fontSize: 48, marginBottom: 4 }}>{wInfo.icon}</div>
                <div className="weather-temp">{Math.round(current?.temperature || 28)}°C</div>
                <div className="weather-desc">{wInfo.label}</div>
                <div className="weather-location">📍 {location}</div>
            </div>

            <div className="weather-stats">
                <div className="weather-stat">
                    <div className="weather-stat-icon">💧</div>
                    <div className="weather-stat-val">{humidity}%</div>
                    <div className="weather-stat-label">{t('weather.humidity')}</div>
                </div>
                <div className="weather-stat">
                    <div className="weather-stat-icon">💨</div>
                    <div className="weather-stat-val">{Math.round(current?.windspeed || 10)} km/h</div>
                    <div className="weather-stat-label">{t('weather.wind')}</div>
                </div>
                <div className="weather-stat">
                    <div className="weather-stat-icon">🌧️</div>
                    <div className="weather-stat-val">{daily?.precipitation_probability_max?.[0] || 20}%</div>
                    <div className="weather-stat-label">{t('weather.rain')}</div>
                </div>
            </div>

            <div className="card">
                <div className="card-title">📅 {t('weather.sevenDay')}</div>
                <div className="forecast-scroll">
                    {(daily?.weathercode || []).map((code, i) => {
                        const d2 = new Date(todayDate); d2.setDate(todayDate.getDate() + i)
                        const info = getLangData(i18n.language).weatherCodes[code] || { icon: '🌤️' }
                        return (
                            <div key={i} className={`forecast-card ${i === 0 ? 'today' : ''}`}>
                                <div className="forecast-day">{i === 0 ? todayLabel : DAYS[d2.getDay()]}</div>
                                <div className="forecast-icon">{info.icon}</div>
                                <div className="forecast-temp">
                                    {Math.round(daily?.temperature_2m_max?.[i] || 30)}°/{Math.round(daily?.temperature_2m_min?.[i] || 22)}°
                                </div>
                                <div className="forecast-rain">🌧 {daily?.precipitation_probability_max?.[i] || 0}%</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="ai-advice-box">
                <h3>🤖 {t('weather.aiAdvice')}</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{getWeatherAdvice(weather, getLangData(i18n.language))}</p>
            </div>
        </div>
    )
}

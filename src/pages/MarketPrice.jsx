import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const CROPS = ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Maize', 'Sugarcane', 'Tomato', 'Onion', 'Potato', 'Groundnut', 'Mustard', 'Chana']
const STATES = ['All India', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Andhra Pradesh', 'Telangana', 'Karnataka', 'Gujarat', 'Bihar']

const BASE_PRICES = {
    Wheat: 2150, Rice: 2183, Cotton: 6800, Soybean: 4500, Maize: 1850,
    Sugarcane: 315, Tomato: 2200, Onion: 1750, Potato: 1200, Groundnut: 5800, Mustard: 5400, Chana: 5100
}

function generateTrend(base) {
    return Array.from({ length: 7 }, (_, i) => {
        const days = ['7d', '6d', '5d', '4d', '3d', '2d', 'Today']
        const variance = (Math.random() - 0.5) * base * 0.06
        return { day: days[i], price: Math.round(base + variance * (i + 1)) }
    })
}

export default function MarketPrice() {
    const { t } = useTranslation()
    const [selectedCrop, setSelectedCrop] = useState('Wheat')
    const [selectedState, setSelectedState] = useState('All India')
    const [trendData, setTrendData] = useState(() => generateTrend(BASE_PRICES['Wheat']))
    const [price, setPrice] = useState(BASE_PRICES['Wheat'])

    const fetchPrice = () => {
        const base = BASE_PRICES[selectedCrop] || 2000
        const stateVariance = 1 + (Math.random() - 0.5) * 0.1
        const newPrice = Math.round(base * stateVariance)
        setPrice(newPrice)
        setTrendData(generateTrend(base))
    }

    const prevPrice = trendData[trendData.length - 2]?.price || price
    const priceChange = price - prevPrice
    const pctChange = ((priceChange / prevPrice) * 100).toFixed(1)

    const bestAdvice = priceChange > 0
        ? `📈 Price is rising! Consider selling ${selectedCrop} in the next 2-3 days for better returns.`
        : priceChange < 0
            ? `📉 Price dipping. Hold your stock for 1-2 weeks — prices may recover.`
            : '✅ Price is stable. Good time to sell if you need immediate funds.'

    return (
        <div className="page">
            <div className="page-header">
                <h1>📊 {t('market.title')}</h1>
                <p>Real-time mandi prices for Indian farmers</p>
            </div>

            {/* Selectors */}
            <div className="card">
                <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{t('market.selectCrop')}</label>
                        <select className="form-select" value={selectedCrop}
                            onChange={e => setSelectedCrop(e.target.value)}>
                            {CROPS.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{t('market.selectState')}</label>
                        <select className="form-select" value={selectedState}
                            onChange={e => setSelectedState(e.target.value)}>
                            {STATES.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={fetchPrice}>
                    🔍 {t('market.fetch')}
                </button>
            </div>

            {/* Price Hero */}
            <div className="price-hero">
                <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{selectedCrop} — {selectedState}</div>
                <div className="price-main">₹{price.toLocaleString('en-IN')}</div>
                <div className="price-unit">{t('market.perQuintal')}</div>
                <div className={`price-change ${priceChange >= 0 ? 'price-up' : 'price-down'}`}>
                    {priceChange >= 0 ? '▲' : '▼'} ₹{Math.abs(priceChange)} ({pctChange}%) today
                </div>
            </div>

            {/* 7-Day Trend */}
            <div className="card">
                <div className="card-title">📈 {t('market.trend')}</div>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                        <Tooltip formatter={(v) => [`₹${v}`, 'Price']} />
                        <Line
                            type="monotone" dataKey="price" stroke="#2E7D32"
                            strokeWidth={2.5} dot={{ fill: '#2E7D32', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* AI Sell Advice */}
            <div className="ai-advice-box">
                <h3>💡 {t('market.bestTime')}</h3>
                <p>{bestAdvice}</p>
            </div>

            {/* Nearby Crops */}
            <div className="card">
                <div className="card-title">🌾 Popular Crops Today</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Wheat', 'Rice', 'Cotton', 'Mustard', 'Chana'].map(crop => (
                        <div key={crop} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 0', borderBottom: '1px solid var(--green-bg)'
                        }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{crop}</span>
                            <span style={{ color: 'var(--green-dark)', fontWeight: 700 }}>
                                ₹{(BASE_PRICES[crop] + Math.round((Math.random() - 0.5) * 200)).toLocaleString('en-IN')}/qtl
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

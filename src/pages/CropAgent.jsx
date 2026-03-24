import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getLangData } from '../data/langData'

const SOIL_TYPES = ['clay', 'sandy', 'loamy', 'black', 'red', 'alluvial']
const SEASONS = ['kharif', 'rabi', 'zaid']
const WATER = ['rain-fed', 'canal', 'borewell', 'drip-irrigation']

function getCropRec(soil, season, d) {
    const key = `${soil}_${season}`
    if (d.crops[key]) return d.crops[key]
    if (season === 'kharif') return d.crops['loamy_kharif']
    if (season === 'rabi') return d.crops['clay_rabi']
    return d.crops['sandy_rabi']
}

const AI_CROP_QA = {
    en: { fert: r => r?.fertilizer, irr: r => r?.irrigation, pest: r => r?.pest, profit: r => r ? `Expected profit from ${r.crop}: ${r.profit}. Focus on quality inputs for maximum returns.` : null, def: r => `For best results, ensure your soil pH is 6–7.5. Use organic manure and get a soil health card if you haven't already. ${r ? `Your recommended crop is ${r.crop}.` : ''}` },
    hi: { fert: r => r?.fertilizer, irr: r => r?.irrigation, pest: r => r?.pest, profit: r => r ? `${r.crop} से अपेक्षित लाभ: ${r.profit}। अधिकतम उत्पादन के लिए गुणवत्तापूर्ण आदान उपयोग करें।` : null, def: r => `बेहतर परिणाम के लिए मिट्टी का pH 6–7.5 रखें। जैविक खाद उपयोग करें। ${r ? `आपकी सुझाई गई फसल ${r.crop} है।` : ''}` },
    te: { fert: r => r?.fertilizer, irr: r => r?.irrigation, pest: r => r?.pest, profit: r => r ? `${r.crop} నుండి అంచనా లాభం: ${r.profit}. గరిష్ట దిగుబడికి నాణ్యమైన వనరులు వాడండి.` : null, def: r => `మంచి ఫలితాల కోసం నేల pH 6–7.5 లో ఉంచండి. సేంద్రీయ ఎరువు వాడండి. ${r ? `మీకు సిఫారసు చేసిన పంట ${r.crop}.` : ''}` },
}

const WATER_LABELS = {
    en: { 'rain-fed': 'Rain-fed', 'canal': 'Canal', 'borewell': 'Borewell', 'drip-irrigation': 'Drip Irrigation' },
    hi: { 'rain-fed': 'वर्षाधारित', 'canal': 'नहर', 'borewell': 'बोरवेल', 'drip-irrigation': 'ड्रिप सिंचाई' },
    te: { 'rain-fed': 'వర్షాధారిత', 'canal': 'కాలువ', 'borewell': 'బోరువెల్', 'drip-irrigation': 'డ్రిప్ సేద్యం' },
}

export default function CropAgent() {
    const { t, i18n } = useTranslation()
    const [form, setForm] = useState({ soilType: 'loamy', season: 'kharif', water: 'canal', location: '', budget: '50000' })
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [aiQuestion, setAiQuestion] = useState('')
    const [aiAnswer, setAiAnswer] = useState('')

    const analyze = async () => {
        setLoading(true)
        await new Promise(r => setTimeout(r, 1200))
        const d = getLangData(i18n.language)
        setResult(getCropRec(form.soilType, form.season, d))
        setLoading(false)
    }

    const askAI = () => {
        if (!aiQuestion.trim()) return
        const q = aiQuestion.toLowerCase()
        const qa = AI_CROP_QA[i18n.language] || AI_CROP_QA.en
        let answer = ''
        if (q.includes('fertilizer') || q.includes('urea') || q.includes('dap') || q.includes('उर्वरक') || q.includes('ఎరువు')) answer = qa.fert(result) || ''
        else if (q.includes('water') || q.includes('irrigation') || q.includes('सिंचाई') || q.includes('నీటి')) answer = qa.irr(result) || ''
        else if (q.includes('pest') || q.includes('insect') || q.includes('कीट') || q.includes('పురుగు')) answer = qa.pest(result) || ''
        else if (q.includes('profit') || q.includes('income') || q.includes('लाभ') || q.includes('లాభం')) answer = qa.profit(result) || ''
        else answer = qa.def(result)
        if (!answer) answer = qa.def(result)
        setAiAnswer(answer)
        localStorage.setItem('kisanLastQuestion', aiQuestion)
        setAiQuestion('')
    }

    const waterLabels = WATER_LABELS[i18n.language] || WATER_LABELS.en

    return (
        <div className="page">
            <div className="page-header">
                <h1>🌾 {t('cropAgent.title')}</h1>
                <p>AI-powered crop recommendation for your farm</p>
            </div>

            <div className="card">
                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">{t('cropAgent.soilType')}</label>
                        <select className="form-select" value={form.soilType} onChange={e => setForm(p => ({ ...p, soilType: e.target.value }))}>
                            {SOIL_TYPES.map(s => <option key={s} value={s}>{t(`soil.${s}`)}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('cropAgent.season')}</label>
                        <select className="form-select" value={form.season} onChange={e => setForm(p => ({ ...p, season: e.target.value }))}>
                            {SEASONS.map(s => <option key={s} value={s}>{t(`season.${s}`)}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('cropAgent.water')}</label>
                        <select className="form-select" value={form.water} onChange={e => setForm(p => ({ ...p, water: e.target.value }))}>
                            {WATER.map(w => <option key={w} value={w}>{waterLabels[w] || w}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">{t('cropAgent.budget')}</label>
                        <input className="form-input" type="number" placeholder="50000" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">{t('cropAgent.location')}</label>
                    <input className="form-input" placeholder="e.g. Nashik, Maharashtra" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <button className="btn btn-primary" onClick={analyze} disabled={loading}>
                    {loading ? <><span className="spinner" style={{ width: 18, height: 18, margin: 0 }} /> {t('common.loading')}</> : `🌾 ${t('cropAgent.analyze')}`}
                </button>
            </div>

            {result && (
                <>
                    <div className="result-hero">
                        <div style={{ fontSize: 48, marginBottom: 8 }}>{result.emoji}</div>
                        <div className="result-crop">{result.crop}</div>
                        <div style={{ fontSize: '0.88rem', opacity: 0.85, marginTop: 4 }}>{result.reason}</div>
                        <div className="result-profit">
                            <div className="profit-label">{t('cropAgent.profit')}</div>
                            <div className="profit-val">{result.profit}</div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-title">📋 {t('cropAgent.plan')}</div>
                        {result.plan.map((step, i) => (
                            <div key={i} className="step-item">
                                <div className="step-num">{i + 1}</div>
                                <div className="step-text">{step}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid-2">
                        <div className="card"><div className="card-title">🧪 {t('cropAgent.fertilizer')}</div><div className="result-value">{result.fertilizer}</div></div>
                        <div className="card"><div className="card-title">💧 {t('cropAgent.irrigation')}</div><div className="result-value">{result.irrigation}</div></div>
                    </div>
                    <div className="card"><div className="card-title">🐛 {t('cropAgent.pestControl')}</div><div className="result-value">{result.pest}</div></div>

                    <div className="card">
                        <div className="card-title">🤖 Ask AI about your crop</div>
                        <div className="ai-chat-input">
                            <input className="form-input" placeholder={t('schemes.aiAsk')} value={aiQuestion}
                                onChange={e => setAiQuestion(e.target.value)} onKeyPress={e => e.key === 'Enter' && askAI()} />
                            <button className="btn btn-primary btn-sm btn-icon" onClick={askAI}>Ask</button>
                        </div>
                        {aiAnswer && <div className="ai-response">{aiAnswer}</div>}
                    </div>
                </>
            )}
        </div>
    )
}

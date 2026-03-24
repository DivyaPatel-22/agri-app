import React, { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { getLangData } from '../data/langData'
import { analyzeLeafLocally } from '../services/geminiLeafService'

export default function LeafDetection() {
    const { t, i18n } = useTranslation()
    const [image, setImage] = useState(null)
    const [imageFile, setImageFile] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [dragOver, setDragOver] = useState(false)
    const [progress, setProgress] = useState(0)
    const fileRef = useRef()
    const cameraRef = useRef()

    const handleImage = (file) => {
        if (!file) return
        setResult(null)
        setError(null)
        setImageFile(file)
        const reader = new FileReader()
        reader.onload = (e) => setImage(e.target.result)
        reader.readAsDataURL(file)
    }

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) handleImage(file)
    }, [])

    const analyzeImage = async () => {
        if (!imageFile) return
        setAnalyzing(true)
        setError(null)
        setProgress(0)

        // Animated progress
        const tick = setInterval(() => setProgress(p => Math.min(p + 12, 90)), 200)

        try {
            // Runs entirely in browser — no API, no server
            const aiResult = await analyzeLeafLocally(imageFile)
            const d = getLangData(i18n.language)
            const diseaseData = d.diseases[aiResult.disease_key] || d.diseases['healthy']
            setResult({
                key: aiResult.disease_key,
                confidence: aiResult.confidence,
                observation: aiResult.observation,
                ...diseaseData,
            })
        } catch (err) {
            setError('generic')
        } finally {
            clearInterval(tick)
            setProgress(100)
            setTimeout(() => setAnalyzing(false), 400)
        }
    }

    const reset = () => {
        setImage(null)
        setImageFile(null)
        setResult(null)
        setError(null)
        setProgress(0)
        if (fileRef.current) fileRef.current.value = ''
        if (cameraRef.current) cameraRef.current.value = ''
    }

    const severityClass = { high: 'severity-high', medium: 'severity-medium', low: 'severity-low', none: 'severity-low' }
    const severityLabel = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low', none: '🟢 Healthy' }
    const severityBg = { high: 'rgba(239,68,68,0.08)', medium: 'rgba(245,158,11,0.08)', low: 'rgba(34,197,94,0.08)', none: 'rgba(34,197,94,0.08)' }

    return (
        <div className="page">
            <div className="page-header">
                <h1>🌿 {t('leaf.title')}</h1>
                <p>AI-powered plant disease detection using Google Gemini Vision</p>
            </div>

            {/* Tips strip */}
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-mid)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.82rem', color: 'var(--green-dark)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>💡</span>
                <span>For best results: upload a clear, close-up photo of a <strong>single leaf</strong> in good lighting. Avoid blurry or dark images.</span>
            </div>

            <div className="card">
                {/* Upload Zone */}
                <div
                    className="upload-zone"
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => !image && fileRef.current.click()}
                    style={{ border: dragOver ? '2px dashed var(--green-dark)' : undefined, background: dragOver ? 'var(--green-bg)' : undefined, cursor: image ? 'default' : 'pointer', position: 'relative', minHeight: 180 }}
                >
                    {image ? (
                        <>
                            <img src={image} alt="leaf" className="upload-preview" style={{ maxHeight: 260, objectFit: 'contain' }} />
                            <button
                                onClick={(e) => { e.stopPropagation(); reset() }}
                                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >×</button>
                        </>
                    ) : (
                        <>
                            <div className="upload-icon">📸</div>
                            <div className="upload-text">{t('leaf.upload')}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: 4 }}>Click to browse or drag & drop</div>
                        </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImage(e.target.files[0])} />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => cameraRef.current.click()} style={{ flex: 1 }}>
                        📷 {t('leaf.camera')}
                    </button>
                    <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handleImage(e.target.files[0])} />
                    <button className="btn btn-primary" onClick={analyzeImage} disabled={!image || analyzing} style={{ flex: 2 }}>
                        {analyzing
                            ? <><span className="spinner" style={{ width: 18, height: 18, margin: 0 }} /> 🧠 {t('leaf.analyzing')}</>
                            : `🔍 ${t('leaf.analyze')}`}
                    </button>
                </div>

                {/* Progress bar */}
                {analyzing && (
                    <div style={{ marginTop: 10, height: 4, background: 'var(--green-bg)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--green-mid)', borderRadius: 4, transition: 'width 0.3s ease' }} />
                    </div>
                )}
            </div>

            {/* Error state */}
            {error && (
                <div className="card" style={{ textAlign: 'center', padding: 24 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-dark)', marginBottom: 6 }}>Analysis Failed</div>
                    <div style={{ fontSize: '0.87rem', color: 'var(--text-mid)' }}>Could not analyze the image. Please check your internet connection and try again.</div>
                    <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={analyzeImage}>🔄 Try Again</button>
                </div>
            )}


            {/* Results */}
            {result && (
                <>
                    {/* AI Observation card */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid var(--green-mid)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--green-dark)' }}>🤖 AI Observation</div>
                            <div style={{ background: '#166534', color: '#fff', borderRadius: 20, padding: '3px 12px', fontSize: '0.78rem', fontWeight: 600 }}>
                                {result.confidence}% Confident
                            </div>
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-mid)', fontStyle: 'italic' }}>"{result.observation}"</div>
                    </div>

                    {/* Disease / Health card */}
                    {result.severity === 'none' ? (
                        <div className="card" style={{ textAlign: 'center', padding: 28, background: severityBg['none'] }}>
                            <div style={{ fontSize: 52, marginBottom: 8 }}>✅</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--green-dark)' }}>{t('leaf.healthy')}</div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--text-mid)', marginTop: 8 }}>{result.description}</div>
                        </div>
                    ) : (
                        <div className="card" style={{ background: severityBg[result.severity] }}>
                            <div className="card-title">🔬 {t('leaf.disease')}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-dark)', marginBottom: 2 }}>{result.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{result.hindiName}</div>
                                </div>
                                <span className={`severity-badge ${severityClass[result.severity]}`}>{severityLabel[result.severity]}</span>
                            </div>
                            <div className="result-value">{result.description}</div>
                        </div>
                    )}

                    {result.treatment?.length > 0 && (
                        <div className="card">
                            <div className="card-title">💊 {t('leaf.treatment')}</div>
                            {result.treatment.map((step, i) => (
                                <div key={i} className="step-item">
                                    <div className="step-num">{i + 1}</div>
                                    <div className="step-text">{step}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="card">
                        <div className="card-title">🌿 {t('leaf.organic')}</div>
                        <div className="result-value">{result.organic}</div>
                    </div>

                    <div className="card">
                        <div className="card-title">🧪 {t('leaf.chemical')}</div>
                        <div className="result-value">{result.chemical}</div>
                    </div>

                    <div className="card">
                        <div className="card-title">🛡️ {t('leaf.preventive')}</div>
                        {result.preventive.map((tip, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < result.preventive.length - 1 ? '1px solid var(--green-bg)' : 'none' }}>
                                <span style={{ color: 'var(--green-dark)' }}>✓</span>
                                <span className="result-value">{tip}</span>
                            </div>
                        ))}
                    </div>

                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: 4 }} onClick={reset}>
                        🔄 Analyze Another Leaf
                    </button>
                </>
            )}
        </div>
    )
}

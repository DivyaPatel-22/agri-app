import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const AI_RESPONSES = {
    en: {
        weather: "Based on your area's weather forecast, there's a 70% chance of rain tomorrow. I recommend avoiding pesticide spraying today. Instead, focus on drainage improvement in your fields.",
        disease: "For most fungal diseases, apply Copper Oxychloride (3g/liter water). Spray early morning or evening for best results. Repeat after 7 days.",
        crop: "For your soil type and current season, I recommend growing Wheat or Mustard. These crops give good yield with minimal water requirement.",
        price: "Current wheat prices are around ₹2,200/quintal. Prices usually rise in March-April. I suggest holding your stock for 2-3 more weeks.",
        scheme: "You may be eligible for PM-KISAN scheme. You need Aadhaar card, land documents, and bank account details. Visit your nearest Common Service Centre.",
        default: "I'm your KisanSaathi AI assistant. I can help you with crop advice, weather information, market prices, disease detection, and government schemes. What would you like to know?"
    },
    hi: {
        weather: "आपके क्षेत्र के मौसम के अनुसार कल 70% बारिश की संभावना है। आज कीटनाशक छिड़काव न करें। अपने खेत में नाली सुधार पर ध्यान दें।",
        disease: "अधिकांश फफूंदी रोगों के लिए कॉपर ऑक्सीक्लोराइड (3 ग्राम/लीटर पानी) लगाएं। सुबह या शाम छिड़काव करें। 7 दिन बाद दोहराएं।",
        crop: "आपकी मिट्टी और मौसम के लिए गेहूं या सरसों की खेती करें। कम पानी में अच्छी पैदावार मिलेगी।",
        price: "गेहूं का भाव ₹2,200/क्विंटल है। मार्च-अप्रैल में भाव और बढ़ेंगे। 2-3 सप्ताह और रुककर बेचें।",
        scheme: "आप PM-KISAN योजना के पात्र हो सकते हैं। आधार कार्ड, जमीन के कागज़ और बैंक खाता चाहिए। नज़दीकी CSC केंद्र जाएं।",
        default: "मैं आपका किसान साथी AI सहायक हूं। मैं फसल सलाह, मौसम, बाजार भाव, रोग पहचान और सरकारी योजनाओं में मदद कर सकता हूं।"
    },
    te: {
        weather: "మీ ప్రాంతంలో రేపు 70% వర్షం అంచనా. నేడు పురుగుమందు పిచికారీ చేయకండి. పొలంలో నీటి ప్రవాహ మెరుగుదలపై దృష్టి పెట్టండి.",
        disease: "చాలా శిలీంధ్ర వ్యాధులకు కాపర్ ఆక్సీక్లోరైడ్ (3గ్రా/లీటర్ నీరు) వాడండి. తెల్లవారు లేదా సాయంత్రం పిచికారీ చేయండి. 7 రోజుల తర్వాత పునరావృత్తి చేయండి.",
        crop: "మీ నేల మరియు సీజన్‌కు వరి లేదా వేరుశనగ సిఫారసు చేస్తున్నాను. తక్కువ నీటితో మంచి దిగుబడి వస్తుంది.",
        price: "ప్రస్తుతం వరి ధర ₹2,200/క్వింటాల్. మార్చి-ఏప్రిల్‌లో ధర పెరగవచ్చు. 2-3 వారాలు వేచి అమ్మండి.",
        scheme: "మీరు PM-KISAN పథకానికి అర్హులు కావచ్చు. ఆధార్ కార్డ్, భూమి పత్రాలు, బ్యాంకు ఖాతా అవసరం. సమీప CSC కేంద్రానికి వెళ్ళండి.",
        default: "నేను మీ కిసాన్ సాథీ AI సహాయకుడిని. పంట సలహా, వాతావరణం, మార్కెట్ ధరలు, వ్యాధి గుర్తింపు మరియు ప్రభుత్వ పథకాలలో సహాయం చేయగలను."
    }
}

function getAIResponse(text, lang) {
    const lower = text.toLowerCase()
    const responses = AI_RESPONSES[lang] || AI_RESPONSES.en
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('मौसम') || lower.includes('बारिश') || lower.includes('వాతావరణ') || lower.includes('వర్షం')) return responses.weather
    if (lower.includes('disease') || lower.includes('रोग') || lower.includes('पत्ता') || lower.includes('వ్యాధి') || lower.includes('ఆకు')) return responses.disease
    if (lower.includes('crop') || lower.includes('फसल') || lower.includes('seed') || lower.includes('పంట')) return responses.crop
    if (lower.includes('price') || lower.includes('भाव') || lower.includes('mandi') || lower.includes('ధర')) return responses.price
    if (lower.includes('scheme') || lower.includes('योजना') || lower.includes('subsidy') || lower.includes('పథకం')) return responses.scheme
    return responses.default
}

export default function VoiceAssistant({ onClose }) {
    const { t, i18n } = useTranslation()
    const [listening, setListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [response, setResponse] = useState('')
    const [status, setStatus] = useState('idle')
    const recognitionRef = useRef(null)

    const langCodes = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' }

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setResponse('Speech recognition not supported in this browser. Please use Chrome.')
            return
        }
        const recognition = new SpeechRecognition()
        recognition.lang = langCodes[i18n.language] || 'en-IN'
        recognition.interimResults = true
        recognition.continuous = false
        recognitionRef.current = recognition

        recognition.onstart = () => { setListening(true); setStatus('listening'); setTranscript(''); setResponse('') }
        recognition.onresult = (e) => {
            const text = Array.from(e.results).map(r => r[0].transcript).join('')
            setTranscript(text)
        }
        recognition.onend = () => {
            setListening(false)
            setStatus('processing')
        }
        recognition.onerror = () => { setListening(false); setStatus('idle') }
        recognition.start()
    }

    const stopListening = () => {
        if (recognitionRef.current) recognitionRef.current.stop()
    }

    useEffect(() => {
        if (status === 'processing' && transcript) {
            setTimeout(() => {
                const aiReply = getAIResponse(transcript, i18n.language)
                setResponse(aiReply)
                setStatus('speaking')
                // Text to Speech
                const utterance = new SpeechSynthesisUtterance(aiReply)
                utterance.lang = langCodes[i18n.language] || 'en-IN'
                utterance.rate = 0.9
                utterance.onend = () => setStatus('idle')
                window.speechSynthesis.speak(utterance)
                // Save to memory
                localStorage.setItem('kisanLastQuestion', transcript)
            }, 800)
        }
    }, [status, transcript])

    useEffect(() => {
        return () => { window.speechSynthesis.cancel() }
    }, [])

    return (
        <div className="voice-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="voice-panel" style={{ position: 'relative' }}>
                <button className="voice-close-btn" onClick={onClose}>✕</button>
                <div className="voice-title">🎤 {t('voice.title')}</div>
                <div className="voice-status">
                    {status === 'idle' && t('voice.tap')}
                    {status === 'listening' && t('voice.listening')}
                    {status === 'processing' && t('voice.processing')}
                    {status === 'speaking' && '🔊 Speaking...'}
                </div>

                {status === 'speaking' && (
                    <div className="speaking-waves">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="wave-bar" />)}
                    </div>
                )}

                <button
                    className={`voice-mic-btn ${listening ? 'listening' : ''}`}
                    onClick={listening ? stopListening : startListening}
                >
                    {listening ? '⏹' : '🎤'}
                </button>

                {transcript && (
                    <div className="voice-transcript">
                        <div style={{ fontSize: '0.72rem', opacity: 0.6, marginBottom: 4 }}>You said:</div>
                        {transcript}
                    </div>
                )}
                {response && (
                    <div className="voice-response">
                        <div style={{ fontSize: '0.72rem', opacity: 0.7, marginBottom: 4 }}>🤖 KisanSaathi AI:</div>
                        {response}
                    </div>
                )}
            </div>
        </div>
    )
}

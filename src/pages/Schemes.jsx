import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const SCHEMES = [
    {
        id: 1, icon: '💰', name: 'PM-KISAN', ministry: 'Ministry of Agriculture',
        category: 'income-support', states: ['all'],
        tags: ['All Farmers', 'Income Support'],
        shortDesc: 'Direct income support of ₹6,000/year to all small and marginal farmer families.',
        eligibility: 'All landholding farmer families (small/marginal). Aadhaar mandatory. Excludes government employees and income tax payers.',
        documents: ['Aadhaar Card', 'Land ownership documents (Khasra/Khatoni)', 'Bank account passbook', 'Mobile number linked to Aadhaar'],
        process: ['Visit pmkisan.gov.in or nearest CSC centre', 'Register with Aadhaar-linked mobile number', 'Upload land records and bank details', 'Village Patwari verifies land records', 'Amount credited directly to bank in 3 installments (₹2,000 each)'],
        link: 'https://pmkisan.gov.in', type: 'small'
    },
    {
        id: 2, icon: '🌾', name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', ministry: 'Ministry of Agriculture',
        category: 'insurance', states: ['all'],
        tags: ['All Farmers', 'Crop Insurance'],
        shortDesc: 'Crop insurance protection against natural calamities, pests and diseases.',
        eligibility: 'All farmers growing notified crops. Loanee farmers covered mandatorily. Non-loanee farmers can opt voluntarily.',
        documents: ['Aadhaar Card', 'Land records/bank loan documents', 'Crop sowing certificate from Patwari', 'Bank account details'],
        process: ['Enroll before cutoff date at bank/CSC/insurance company office', 'Pay premium (1.5-2% of sum insured for food crops)', 'Damage reported within 72 hours of calamity', 'Field survey by insurance officials', 'Claim settled within 2 months of harvest'],
        link: 'https://pmfby.gov.in', type: 'all'
    },
    {
        id: 3, icon: '🏦', name: 'Kisan Credit Card (KCC)', ministry: 'Ministry of Finance',
        category: 'credit', states: ['all'],
        tags: ['All Farmers', 'Credit & Loans'],
        shortDesc: 'Flexible credit for crop production, post-harvest needs and allied activities at low interest rates.',
        eligibility: 'All farmers, tenant farmers, oral lessees and sharecroppers. No minimum land holding required.',
        documents: ['Identity proof (Aadhaar/Voter ID)', 'Address proof', 'Land documents (own land/lease agreement)', 'Passport size photographs'],
        process: ['Visit nearest bank branch or apply online at KCC portal', 'Fill application form', 'Bank sanctions credit limit based on land holding', 'KCC issued in 14 working days', 'Revolving credit available for 5 years'],
        link: 'https://www.nabard.org', type: 'all'
    },
    {
        id: 4, icon: '💧', name: 'PM Krishi Sinchai Yojana', ministry: 'Ministry of Jal Shakti',
        category: 'irrigation', states: ['all'],
        tags: ['All Farmers', 'Irrigation', 'Water'],
        shortDesc: '"Har khet ko pani, More crop per drop" — irrigation subsidy up to 90% for micro-irrigation.',
        eligibility: 'All categories of farmers. SC/ST and small-marginal farmers get higher subsidy (90%). General category: 80% subsidy for drip/sprinkler.',
        documents: ['Aadhaar Card', 'Land ownership proof', 'Bank account details'],
        process: ['Apply on state agriculture dept portal', 'Receive approval & quotation from empanelled vendors', 'Install drip/sprinkler system', 'Physical verification by agriculture officer', 'Subsidy credited to bank account'],
        link: 'https://pmksy.gov.in', type: 'all'
    },
    {
        id: 5, icon: '🌱', name: 'National Mission for Sustainable Agriculture', ministry: 'NMSA - MoAFW',
        category: 'sustainability', states: ['all'],
        tags: ['All Farmers', 'Organic Farming'],
        shortDesc: 'Support for soil health, organic farming, water-use efficiency and climate adaptation.',
        eligibility: 'All farmers. Special focus on rainfed area farmers. Organic farmers get additional benefits.',
        documents: ['Aadhaar Card', 'Land records', 'Soil health card'],
        process: ['Contact local agriculture department', 'Apply for soil health card first', 'Participate in farmer field schools', 'Receive organic certification assistance'],
        link: 'https://nmsa.dac.gov.in', type: 'organic'
    },
    {
        id: 6, icon: '🚜', name: 'Sub-Mission on Agricultural Mechanization (SMAM)', ministry: 'Ministry of Agriculture',
        category: 'mechanization', states: ['all'],
        tags: ['All Farmers', 'Farm Equipment'],
        shortDesc: 'Subsidy of 40-50% on purchase of farm machinery (tractors, harvesters, power tillers).',
        eligibility: 'Small and marginal farmers: 50% subsidy. Other farmers: 40% subsidy. Priority to SC/ST/Women farmers.',
        documents: ['Aadhaar Card', 'Land records', 'Caste certificate (if applicable)', 'Bank account'],
        process: ['Apply online at agriculture department website', 'Lottery/first-come basis selection', 'Quote from empanelled dealers', 'Purchase after approval', 'Subsidy credited directly to account'],
        link: 'https://agrimachinery.nic.in', type: 'all'
    },
    {
        id: 7, icon: '🌿', name: 'Paramparagat Krishi Vikas Yojana (PKVY)', ministry: 'Ministry of Agriculture',
        category: 'organic', states: ['all'],
        tags: ['Organic Farmers', 'Certification'],
        shortDesc: 'Financial support of ₹50,000/ha for organic farming certification and market development.',
        eligibility: 'Farmers willing to practice organic farming for minimum 3 years. Group of 20+ farmers in cluster.',
        documents: ['Aadhaar Card', 'Land records', 'Group formation certificate'],
        process: ['Form Farmer Interest Group (20+ members)', 'Apply through local agriculture office', 'PGS-India certification', '₹50,000/ha support over 3 years'],
        link: 'https://pgsindia-ncof.gov.in', type: 'organic'
    },
    {
        id: 8, icon: '📊', name: 'e-NAM (National Agriculture Market)', ministry: 'SFAC - Ministry of Agriculture',
        category: 'marketing', states: ['all'],
        tags: ['All Farmers', 'Market Access'],
        shortDesc: 'Online trading platform connecting farmers directly to buyers across India.',
        eligibility: 'All farmers registered at their local APMC mandi. Free registration.',
        documents: ['Aadhaar Card', 'Bank account details', 'Mandi license/registration'],
        process: ['Register at enam.gov.in', 'Link to nearest e-NAM mandi', 'Upload produce quality details', 'Receive competitive bids from traders', 'Payment directly to bank within 24 hours'],
        link: 'https://enam.gov.in', type: 'all'
    }
]

const STATES_LIST = ['All States', 'Punjab', 'Haryana', 'UP', 'Maharashtra', 'AP', 'Telangana', 'Karnataka', 'MP', 'Rajasthan']
const TYPES_LIST = ['All Types', 'small', 'organic', 'all']

export default function Schemes() {
    const { t } = useTranslation()
    const [stateFilter, setStateFilter] = useState('All States')
    const [typeFilter, setTypeFilter] = useState('All Types')
    const [expanded, setExpanded] = useState(null)
    const [aiQuestion, setAiQuestion] = useState('')
    const [aiAnswer, setAiAnswer] = useState('')
    const profile = JSON.parse(localStorage.getItem('kisanProfile') || '{}')

    const filtered = SCHEMES.filter(s => {
        if (typeFilter !== 'All Types' && s.type !== typeFilter && s.type !== 'all') return false
        return true
    })

    const askAI = () => {
        const q = aiQuestion.toLowerCase()
        let answer = ''
        const landSize = parseFloat(profile.landSize) || 0
        if (q.includes('pm-kisan') || q.includes('kisan')) {
            answer = `PM-KISAN gives ₹6,000/year to eligible farmers. ${landSize > 0 && landSize <= 5 ? 'Based on your profile, you appear eligible as a small/marginal farmer!' : 'Check if you hold land in your name.'} Visit pmkisan.gov.in to apply.`
        } else if (q.includes('insurance') || q.includes('bima')) {
            answer = `PMFBY crop insurance is available with low premiums (1.5-2%). Contact your nearest bank before the cutoff date for your crop season. You can also apply through CSC centres.`
        } else if (q.includes('subsidy') || q.includes('machinery') || q.includes('tractor')) {
            answer = `Under SMAM scheme, you can get 40-50% subsidy on farm machinery. ${profile.soilType === 'black' ? 'For cotton farms, a power sprayer would be very useful!' : ''} Apply through your state agriculture department.`
        } else if (q.includes('organic')) {
            answer = `PKVY scheme provides ₹50,000/ha support for organic farming. You need to form a group of 20+ farmers and commit to organic practices for 3 years.`
        } else if (q.includes('eligible') || q.includes('qualify')) {
            answer = `Based on your profile (${profile.name || 'farmer'}, ${landSize || '?'} acres), you may be eligible for: PM-KISAN (income support), PMFBY (crop insurance), KCC (credit card), and SMAM (machinery subsidy). Please verify at your local agriculture office.`
        } else {
            answer = `I can help you find the right government scheme. Ask me about PM-KISAN, PMFBY insurance, Kisan Credit Card, irrigation subsidy, organic farming support, or farm machinery subsidy.`
        }
        setAiAnswer(answer)
        localStorage.setItem('kisanLastQuestion', aiQuestion)
        setAiQuestion('')
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>📋 {t('schemes.title')}</h1>
                <p>8 government schemes for Indian farmers</p>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{t('schemes.filterState')}</label>
                        <select className="form-select" value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
                            {STATES_LIST.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{t('schemes.filterType')}</label>
                        <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                            {TYPES_LIST.map(s => <option key={s} value={s}>{s === 'All Types' ? t('schemes.allTypes') : s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* AI Eligibility Checker */}
            <div className="card">
                <div className="card-title">🤖 {t('schemes.aiAsk')}</div>
                <div className="ai-chat-input">
                    <input
                        className="form-input"
                        placeholder="e.g. Am I eligible for PM-KISAN?"
                        value={aiQuestion}
                        onChange={e => setAiQuestion(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && askAI()}
                    />
                    <button className="btn btn-primary btn-sm btn-icon" onClick={askAI}>Ask</button>
                </div>
                {aiAnswer && <div className="ai-response">{aiAnswer}</div>}
            </div>

            {/* Scheme Cards */}
            {filtered.map(scheme => (
                <div className="scheme-card" key={scheme.id}>
                    <div className="scheme-header">
                        <div className="scheme-icon">{scheme.icon}</div>
                        <div>
                            <div className="scheme-title">{scheme.name}</div>
                            <div className="scheme-ministry">{scheme.ministry}</div>
                        </div>
                    </div>
                    <div className="scheme-body">
                        {scheme.tags.map(tag => (
                            <span key={tag} className="scheme-tag tag-green">{tag}</span>
                        ))}
                        <div className="scheme-detail" style={{ marginTop: 8 }}>{scheme.shortDesc}</div>

                        {expanded === scheme.id ? (
                            <>
                                <div style={{ marginTop: 10 }}>
                                    <div className="result-label">{t('schemes.eligibility')}</div>
                                    <div className="scheme-detail">{scheme.eligibility}</div>
                                </div>
                                <div>
                                    <div className="result-label">{t('schemes.documents')}</div>
                                    {scheme.documents.map((doc, i) => (
                                        <div key={i} style={{ fontSize: '0.83rem', color: 'var(--text-mid)', padding: '2px 0' }}>
                                            📄 {doc}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: 10 }}>
                                    <div className="result-label">How to Apply</div>
                                    {scheme.process.map((step, i) => (
                                        <div key={i} className="step-item" style={{ padding: '6px 0' }}>
                                            <div className="step-num" style={{ width: 22, height: 22, minWidth: 22, fontSize: '0.7rem' }}>{i + 1}</div>
                                            <div className="step-text">{step}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <a href={scheme.link} target="_blank" rel="noreferrer"
                                        className="btn btn-primary btn-sm" style={{ flex: 1, textDecoration: 'none' }}>
                                        🔗 {t('schemes.apply')}
                                    </a>
                                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setExpanded(null)}>
                                        {t('common.close')}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}
                                onClick={() => setExpanded(scheme.id)}>
                                View Details & Apply →
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

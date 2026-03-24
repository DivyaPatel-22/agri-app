import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { getLangData } from '../data/langData'

const CROPS = ['All', 'Wheat', 'Rice', 'Cotton', 'Soybean', 'Chilli', 'Tomato', 'Onion', 'Sugarcane']

function moderateContent(text) {
    const harmful = ['spam', 'bet', 'casino', 'loan shark', 'guarantee profit']
    return !harmful.some(w => text.toLowerCase().includes(w))
}

export default function Community() {
    const { t, i18n } = useTranslation()
    const d = getLangData(i18n.language)

    const [posts, setPosts] = useState(() => {
        const saved = localStorage.getItem('kisanCommunityPosts')
        return saved ? [...JSON.parse(saved), ...d.communityPosts] : [...d.communityPosts]
    })

    // Re-sync sample posts when language changes
    const [currentLang, setCurrentLang] = useState(i18n.language)
    if (i18n.language !== currentLang) {
        setCurrentLang(i18n.language)
        const saved = localStorage.getItem('kisanCommunityPosts')
        const userPosts = saved ? JSON.parse(saved) : []
        const newD = getLangData(i18n.language)
        // Filter out old sample posts (ids 101-104), keep only user posts
        const onlyUser = userPosts.filter(p => p.id > 200)
        setPosts([...onlyUser, ...newD.communityPosts])
    }

    const [cropFilter, setCropFilter] = useState('All')
    const [newPost, setNewPost] = useState({ text: '', crop: 'Wheat', image: null })
    const [expandComments, setExpandComments] = useState({})
    const [newComment, setNewComment] = useState({})
    const [posting, setPosting] = useState(false)
    const profile = JSON.parse(localStorage.getItem('kisanProfile') || '{}')
    const fileRef = useRef()

    const filteredPosts = cropFilter === 'All' ? posts : posts.filter(p => p.crop === cropFilter)

    const handlePost = async () => {
        if (!newPost.text.trim()) return
        if (!moderateContent(newPost.text)) { alert('⚠️ Content flagged by AI moderation.'); return }
        setPosting(true)
        await new Promise(r => setTimeout(r, 600))
        const post = {
            id: Date.now(), author: profile.name || 'Anonymous Farmer',
            location: profile.location || 'India', avatar: '🧑‍🌾',
            crop: newPost.crop, time: 'Just now',
            text: newPost.text, image: newPost.image,
            likes: 0, liked: false, comments: []
        }
        const updated = [post, ...posts]
        setPosts(updated)
        const userPosts = updated.filter(p => p.id > 200)
        localStorage.setItem('kisanCommunityPosts', JSON.stringify(userPosts))
        setNewPost({ text: '', crop: 'Wheat', image: null })
        setPosting(false)
    }

    const toggleLike = (id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p))

    const addComment = (postId) => {
        const text = newComment[postId]?.trim()
        if (!text) return
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, { author: profile.name || 'You', text }] } : p))
        setNewComment(prev => ({ ...prev, [postId]: '' }))
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>👥 {t('community.title')}</h1>
                <p>Connect with farmers across India</p>
            </div>

            <div className="card">
                <div className="card-title">✏️ {t('community.newPost')}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                    <div className="post-avatar">{profile.name?.[0] || '🧑'}</div>
                    <textarea className="form-textarea" placeholder={t('community.placeholder')}
                        value={newPost.text} onChange={e => setNewPost(p => ({ ...p, text: e.target.value }))} rows={3} />
                </div>
                {newPost.image && <img src={newPost.image} alt="post" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <select className="form-select" style={{ flex: 1, minWidth: 120 }} value={newPost.crop}
                        onChange={e => setNewPost(p => ({ ...p, crop: e.target.value }))}>
                        {CROPS.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                    </select>
                    <button className="btn btn-secondary btn-sm btn-icon" onClick={() => fileRef.current.click()} style={{ flex: 0 }}>
                        📷 {t('community.addImage')}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setNewPost(p => ({ ...p, image: ev.target.result })); r.readAsDataURL(f) }} />
                    <button className="btn btn-primary btn-sm" onClick={handlePost} disabled={posting} style={{ flex: 1 }}>
                        {posting ? '...' : t('community.post')}
                    </button>
                </div>
            </div>

            <div className="crop-tags" style={{ marginBottom: 14 }}>
                {CROPS.map(c => (
                    <div key={c} className={`crop-tag ${cropFilter === c ? 'selected' : ''}`} onClick={() => setCropFilter(c)}>{c}</div>
                ))}
            </div>

            {filteredPosts.map(post => (
                <div className="post-card" key={post.id}>
                    <div className="post-header">
                        <div className="post-avatar">{post.avatar}</div>
                        <div>
                            <div className="post-author">{post.author}</div>
                            <div className="post-meta">📍 {post.location} • {post.time}</div>
                        </div>
                        <div className="post-crop-badge">🌾 {post.crop}</div>
                    </div>
                    {post.image && <img src={post.image} alt="" className="post-image" />}
                    <div className="post-body">{post.text}</div>
                    <div className="post-actions">
                        <button className={`action-btn ${post.liked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                            {post.liked ? '❤️' : '🤍'} {post.likes} {t('community.like')}
                        </button>
                        <button className="action-btn" onClick={() => setExpandComments(p => ({ ...p, [post.id]: !p[post.id] }))}>
                            💬 {post.comments.length} {t('community.comment')}
                        </button>
                    </div>
                    {expandComments[post.id] && (
                        <div style={{ padding: '0 14px 14px' }}>
                            {post.comments.map((c, i) => (
                                <div key={i} style={{ background: 'var(--green-tint)', borderRadius: 8, padding: '8px 10px', marginBottom: 6 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--green-dark)', marginBottom: 2 }}>{c.author}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)' }}>{c.text}</div>
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <input className="form-input" placeholder={t('community.addComment')}
                                    value={newComment[post.id] || ''} onChange={e => setNewComment(p => ({ ...p, [post.id]: e.target.value }))}
                                    onKeyPress={e => e.key === 'Enter' && addComment(post.id)}
                                    style={{ fontSize: '0.85rem', padding: '8px 12px' }} />
                                <button className="btn btn-primary btn-sm btn-icon" onClick={() => addComment(post.id)}>Send</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

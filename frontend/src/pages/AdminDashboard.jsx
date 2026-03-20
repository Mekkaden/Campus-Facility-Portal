import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
    ShieldCheck, BarChart3, AlertTriangle, CheckCircle2,
    Clock, XCircle, LogOut, Eye
} from 'lucide-react';
import axios from 'axios';

// ─── fake creds ───────────────────────────────────────────────────────────────
const FAKE_ADMIN = { username: 'admin', password: 'deepimpact123' };

const api = axios.create({ baseURL: 'http://localhost:5001/api' });

// ─── util: status badge ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
    if (status === 'approved') {
        return (
            <span style={{ padding: '4px 12px', background: 'rgba(16,185,129,0.12)', color: '#10B981', borderRadius: '20px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <CheckCircle2 size={13} /> Approved
            </span>
        );
    }
    if (status === 'pending_manual_review') {
        return (
            <span style={{ padding: '4px 12px', background: 'rgba(234,179,8,0.12)', color: '#EAB308', borderRadius: '20px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Clock size={13} /> Under Review
            </span>
        );
    }
    return (
        <span style={{ padding: '4px 12px', background: 'rgba(239,68,68,0.12)', color: '#EF4444', borderRadius: '20px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <XCircle size={13} /> Rejected
        </span>
    );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
    const cardRef = useRef(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [shaking, setShaking] = useState(false);

    useEffect(function () {
        gsap.from(cardRef.current, { y: 30, duration: 0.5, ease: 'power3.out' });
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        if (username === FAKE_ADMIN.username && password === FAKE_ADMIN.password) {
            gsap.to(cardRef.current, { scale: 0.95, y: -10, duration: 0.25, ease: 'power2.in', onComplete: onLogin });
        } else {
            setError('Invalid credentials. Access denied.');
            setShaking(true);
            gsap.fromTo(cardRef.current, { x: -10 }, { x: 10, duration: 0.07, repeat: 5, yoyo: true, ease: 'none', onComplete: function () { gsap.set(cardRef.current, { x: 0 }); setShaking(false); } });
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#0D0D0D' }}>
            <div ref={cardRef} style={{ width: '100%', maxWidth: '420px' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{ width: '60px', height: '60px', background: '#222', border: '1px solid #555', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                        <ShieldCheck size={30} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px', color: '#FFFFFF' }}>Admin Portal</h1>
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>Restricted access — authorised personnel only</p>
                </div>

                <div style={{ background: '#1A1A1A', border: '1px solid #444', borderRadius: '16px', padding: '32px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#E5E5E5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Username</label>
                            <input
                                style={{ width: '100%', background: '#262626', border: '1px solid #555', color: '#fff', padding: '14px 16px', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                                type="text"
                                value={username}
                                onChange={function (e) { setUsername(e.target.value); setError(''); }}
                                placeholder="Enter username"
                                autoComplete="username"
                                onFocus={function(e) { e.target.style.borderColor = '#888'; }}
                                onBlur={function(e) { e.target.style.borderColor = '#555'; }}
                            />
                        </div>
                        <div style={{ marginBottom: '28px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#E5E5E5', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
                            <input
                                style={{ width: '100%', background: '#262626', border: '1px solid #555', color: '#fff', padding: '14px 16px', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                                type="password"
                                value={password}
                                onChange={function (e) { setPassword(e.target.value); setError(''); }}
                                placeholder="Enter password"
                                autoComplete="current-password"
                                onFocus={function(e) { e.target.style.borderColor = '#888'; }}
                                onBlur={function(e) { e.target.style.borderColor = '#555'; }}
                            />
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '12px 16px', color: '#FCA5A5', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <XCircle size={14} /> {error}
                            </div>
                        )}

                        <button type="submit" style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 700, background: '#fff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.2s' }}
                            onMouseOver={function(e) { e.currentTarget.style.opacity = '0.9'; }}
                            onMouseOut={function(e) { e.currentTarget.style.opacity = '1'; }}
                        >
                            Authenticate <Eye size={16} />
                        </button>
                    </form>
                </div>
                <p style={{ textAlign: 'center', color: '#52525B', fontSize: '0.8rem', marginTop: '20px' }}>
                    Campus Facility Portal · Administration Core
                </p>
            </div>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [authed, setAuthed] = useState(function() { return sessionStorage.getItem('adminAuthed') === 'true'; });
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const containerRef = useRef(null);

    useEffect(function () {
        if (!authed) return;
        gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });

        api.get('/complaints/admin/complaints')
            .then(function (res) {
                setComplaints(res.data);
                setLoading(false);
                setTimeout(function () {
                    gsap.fromTo('.admin-table-row', { opacity: 0, x: -16 }, { opacity: 1, x: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out' });
                }, 50);
            })
            .catch(function (err) {
                console.error('Fetch error:', err);
                setLoading(false);
            });
    }, [authed]);

    function handleLogout() {
        gsap.to(containerRef.current, { opacity: 0, y: 16, duration: 0.3, onComplete: function () { sessionStorage.removeItem('adminAuthed'); setAuthed(false); setComplaints([]); setLoading(true); } });
    }

    if (!authed) {
        return <LoginScreen onLogin={function () { sessionStorage.setItem('adminAuthed', 'true'); setAuthed(true); }} />;
    }

    const filtered = filter === 'all' ? complaints : complaints.filter(function (c) { return c.status === filter; });
    const pendingCount = complaints.filter(function (c) { return c.status === 'pending_manual_review'; }).length;
    const approvedCount = complaints.filter(function (c) { return c.status === 'approved'; }).length;
    const rejectedCount = complaints.filter(function (c) { return c.status === 'rejected'; }).length;
    const avgScore = complaints.length > 0
        ? Math.round(complaints.reduce(function (acc, c) { return acc + c.trustScore; }, 0) / complaints.length)
        : 0;

    const FILTERS = [
        { key: 'all', label: 'All', count: complaints.length },
        { key: 'pending_manual_review', label: 'Under Review', count: pendingCount },
        { key: 'approved', label: 'Approved', count: approvedCount },
        { key: 'rejected', label: 'Rejected', count: rejectedCount },
    ];

    return (
        <div ref={containerRef} className="container" style={{ padding: '40px 24px', minHeight: '100vh' }}>
            {/* ── header ── */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #27272A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid #27272A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Administration Core</h1>
                        <p style={{ color: '#52525B', fontSize: '0.8rem', marginTop: '2px' }}>Complaint Management System</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '6px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px', fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%' }} />
                        Secure Session
                    </div>
                    <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </header>

            {/* ── stat cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '36px' }}>
                {[
                    { label: 'Total Complaints', value: complaints.length, icon: <BarChart3 size={18} color="#52525B" />, color: '#fff' },
                    { label: 'Under Review', value: pendingCount, icon: <AlertTriangle size={18} color="#EAB308" />, color: '#EAB308' },
                    { label: 'Approved', value: approvedCount, icon: <CheckCircle2 size={18} color="#10B981" />, color: '#10B981' },
                    { label: 'Avg Trust Score', value: avgScore + '%', icon: <ShieldCheck size={18} color="#A1A1AA" />, color: '#fff' },
                ].map(function (stat) {
                    return (
                        <div key={stat.label} className="premium-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ color: '#52525B', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{stat.label}</span>
                                {stat.icon}
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: stat.color }}>{stat.value}</div>
                        </div>
                    );
                })}
            </div>

            {/* ── filter tabs ── */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {FILTERS.map(function (f) {
                    return (
                        <button
                            key={f.key}
                            onClick={function () { setFilter(f.key); }}
                            style={{
                                padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                                background: filter === f.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                                border: filter === f.key ? '1px solid #3F3F46' : '1px solid transparent',
                                color: filter === f.key ? '#fff' : '#52525B',
                            }}
                        >
                            {f.label}
                            <span style={{ background: filter === f.key ? '#27272A' : 'transparent', padding: '1px 7px', borderRadius: '10px', fontSize: '0.75rem' }}>
                                {f.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── complaints table ── */}
            <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#52525B' }}>Fetching complaints...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#52525B' }}>No complaints found.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #27272A' }}>
                                    {['Category', 'Title', 'Trust Score', 'AI Flags', 'Date', 'Status', ''].map(function (h) {
                                        return (
                                            <th key={h} style={{ padding: '16px 20px', color: '#52525B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(function (comp) {
                                        var isFlagged = comp.moderationFlags && comp.moderationFlags.length > 0;
                                        return (
                                        <tr
                                            key={comp._id}
                                            className="admin-table-row"
                                            style={{ borderBottom: '1px solid #1A1A1A', transition: 'background 0.15s', borderLeft: isFlagged ? '3px solid rgba(239,68,68,0.6)' : '3px solid transparent' }}
                                            onMouseOver={function (e) { e.currentTarget.style.background = isFlagged ? 'rgba(239,68,68,0.05)' : '#111'; }}
                                            onMouseOut={function (e) { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ padding: '3px 10px', background: '#111', border: '1px solid #27272A', borderRadius: '6px', fontSize: '0.8rem', color: '#A1A1AA', fontWeight: 500 }}>
                                                    {comp.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px', fontWeight: 600, maxWidth: '220px' }}>
                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {isFlagged && (
                                                        <span style={{ flexShrink: 0, padding: '2px 8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                            ⚠️ Flagged
                                                        </span>
                                                    )}
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isFlagged ? '#EF4444' : '#fff' }}>{comp.title}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '90px' }}>
                                                    <div style={{ flex: 1, height: '4px', background: '#27272A', borderRadius: '2px', overflow: 'hidden' }}>
                                                        <div style={{ width: comp.trustScore + '%', height: '100%', background: comp.trustScore > 80 ? '#10B981' : comp.trustScore > 50 ? '#EAB308' : '#EF4444' }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem', color: comp.trustScore > 80 ? '#10B981' : comp.trustScore > 50 ? '#EAB308' : '#EF4444', minWidth: '30px', fontWeight: 700 }}>{comp.trustScore}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#EF4444', maxWidth: '160px' }}>
                                                {comp.moderationFlags && comp.moderationFlags.length > 0
                                                    ? <span style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                        {comp.moderationFlags.slice(0, 2).map(function(f) {
                                                            return <span key={f} style={{ padding: '2px 7px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '4px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{f}</span>;
                                                        })}
                                                        {comp.moderationFlags.length > 2 && <span style={{ color: '#52525B', fontSize: '0.72rem' }}>+{comp.moderationFlags.length - 2}</span>}
                                                      </span>
                                                    : <span style={{ color: '#3F3F46' }}>None</span>
                                                }
                                            </td>
                                            <td style={{ padding: '16px 20px', color: '#52525B', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                {new Date(comp.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <StatusBadge status={comp.status} />
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <button
                                                    onClick={function () { navigate('/admin/complaints/' + comp._id); }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        color: isFlagged ? '#EF4444' : '#52525B', fontSize: '0.8rem', fontWeight: 600,
                                                        background: 'none', border: '1px solid ' + (isFlagged ? 'rgba(239,68,68,0.3)' : '#27272A'),
                                                        borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
                                                        transition: 'all 0.2s', whiteSpace: 'nowrap'
                                                    }}
                                                    onMouseOver={function (e) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#52525B'; }}
                                                    onMouseOut={function (e) { e.currentTarget.style.color = isFlagged ? '#EF4444' : '#52525B'; e.currentTarget.style.borderColor = isFlagged ? 'rgba(239,68,68,0.3)' : '#27272A'; }}
                                                >
                                                    <Eye size={14} /> View
                                                </button>
                                            </td>
                                        </tr>
                                        );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

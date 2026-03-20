import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gsap } from 'gsap';
import {
    ArrowLeft, ShieldCheck, CheckCircle2, XCircle, Clock,
    AlertTriangle, RotateCcw, StickyNote, History,
    Loader2, ChevronDown, ChevronUp, Send
} from 'lucide-react';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5001/api' });

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
    const ref = useRef(null);
    useEffect(function () {
        gsap.fromTo(ref.current,
            { y: 24, opacity: 0, scale: 0.96 },
            { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }
        );
        const timer = setTimeout(function () {
            gsap.to(ref.current, { y: 24, opacity: 0, scale: 0.96, duration: 0.3, ease: 'power2.in', onComplete: onDone });
        }, 3000);
        return function () { clearTimeout(timer); };
    }, []);

    const colors = {
        success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#10B981' },
        error:   { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#EF4444' },
        info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#60A5FA' },
    };
    const c = colors[type] || colors.info;

    return (
        <div ref={ref} style={{
            position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
            background: c.bg, border: '1px solid ' + c.border, borderRadius: '10px',
            padding: '14px 20px', color: c.text, fontSize: '0.9rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)', maxWidth: '360px'
        }}>
            {type === 'success' && <CheckCircle2 size={16} />}
            {type === 'error' && <XCircle size={16} />}
            {type === 'info' && <AlertTriangle size={16} />}
            {message}
        </div>
    );
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel, confirmColor }) {
    const overlayRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(function () {
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        gsap.fromTo(cardRef.current,
            { y: 20, opacity: 0, scale: 0.97 },
            { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' }
        );
    }, []);

    function dismiss(cb) {
        gsap.to(cardRef.current, { y: 10, opacity: 0, scale: 0.97, duration: 0.2, ease: 'power2.in', onComplete: cb });
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.25 });
    }

    return (
        <div ref={overlayRef} onClick={function () { dismiss(onCancel); }} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 2000, padding: '24px'
        }}>
            <div ref={cardRef} onClick={function (e) { e.stopPropagation(); }} style={{
                background: '#0A0A0A', border: '1px solid #27272A', borderRadius: '14px',
                padding: '28px', maxWidth: '400px', width: '100%'
            }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>{title}</h3>
                <p style={{ color: '#A1A1AA', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>{message}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={function () { dismiss(onCancel); }}
                        style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #27272A', borderRadius: '8px', color: '#A1A1AA', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={function () { dismiss(onConfirm); }}
                        style={{ flex: 1, padding: '12px', background: confirmColor || 'rgba(16,185,129,0.12)', border: '1px solid ' + (confirmColor || 'rgba(16,185,129,0.3)'), borderRadius: '8px', color: confirmColor ? '#EF4444' : '#10B981', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                        {confirmLabel || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonBlock({ width, height, style }) {
    return (
        <div style={Object.assign({
            width: width || '100%', height: height || '16px',
            background: 'linear-gradient(90deg, #1A1A1A 25%, #222 50%, #1A1A1A 75%)',
            backgroundSize: '200% 100%', borderRadius: '6px',
            animation: 'shimmer 1.5s infinite'
        }, style)} />
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    if (status === 'approved') {
        return (
            <span style={{ padding: '6px 16px', background: 'rgba(16,185,129,0.12)', color: '#10B981', borderRadius: '20px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, border: '1px solid rgba(16,185,129,0.25)' }}>
                <CheckCircle2 size={14} /> Approved
            </span>
        );
    }
    if (status === 'pending_manual_review') {
        return (
            <span style={{ padding: '6px 16px', background: 'rgba(234,179,8,0.12)', color: '#EAB308', borderRadius: '20px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, border: '1px solid rgba(234,179,8,0.25)' }}>
                <Clock size={14} /> Under Review
            </span>
        );
    }
    return (
        <span style={{ padding: '6px 16px', background: 'rgba(239,68,68,0.12)', color: '#EF4444', borderRadius: '20px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.25)' }}>
            <XCircle size={14} /> Rejected
        </span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ComplaintDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [addingNote, setAddingNote] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirm, setConfirm] = useState(null); // { action, label, message, color }

    const showToast = useCallback(function (message, type) {
        setToast({ message: message, type: type || 'success', key: Date.now() });
    }, []);

    function fetchComplaint() {
        setLoading(true);
        setError('');
        api.get('/complaints/admin/complaints/' + id)
            .then(function (res) {
                setComplaint(res.data);
                setLoading(false);
            })
            .catch(function (err) {
                console.error('Fetch error:', err);
                setError('Failed to load complaint. Please check your connection.');
                setLoading(false);
            });
    }

    useEffect(function () {
        fetchComplaint();
    }, [id]);

    useEffect(function () {
        if (complaint && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );
        }
    }, [complaint]);

    function handleDeleteAction(toastMsg) {
        setUpdating(true);
        api.delete('/complaints/admin/complaints/' + id)
            .then(function () {
                setUpdating(false);
                showToast(toastMsg, 'success');
                setTimeout(function () { navigate('/admin'); }, 1200);
            })
            .catch(function (err) {
                console.error('Delete error:', err);
                setUpdating(false);
                showToast('Failed to process action. Please try again.', 'error');
            });
    }

    function handleAddNote(e) {
        e.preventDefault();
        if (!noteText.trim()) return;
        setAddingNote(true);
        api.post('/complaints/admin/complaints/' + id + '/notes', { text: noteText })
            .then(function (res) {
                setComplaint(res.data.complaint);
                setNoteText('');
                setAddingNote(false);
                showToast('Note added successfully.', 'success');
            })
            .catch(function (err) {
                console.error('Note add error:', err);
                setAddingNote(false);
                showToast('Failed to add note.', 'error');
            });
    }

    function requestAction(actionKey) {
        if (actionKey === 'approved') {
            setConfirm({
                action: function () { handleDeleteAction('Complaint resolved and removed ✅'); },
                label: 'Mark Resolved',
                title: 'Confirm Resolution',
                message: 'This complaint will be marked as resolved and permanently removed from the system.',
                color: null
            });
        } else if (actionKey === 'rejected') {
            setConfirm({
                action: function () { handleDeleteAction('Complaint rejected and removed ❌'); },
                label: 'Reject & Remove',
                title: 'Confirm Rejection',
                message: 'This complaint will be rejected and permanently deleted from the database.',
                color: 'rgba(239,68,68,0.15)'
            });
        } else if (actionKey === 'revoke') {
            setConfirm({
                action: function () { handleDeleteAction('Decision revoked — complaint removed 🔄'); },
                label: 'Revoke & Remove',
                title: 'Revoke & Remove',
                message: 'This will permanently delete the complaint from the system. Are you sure?',
                color: 'rgba(234,179,8,0.15)'
            });
        }
    }

    const desc = complaint ? complaint.description : '';
    const longDesc = desc.length > 300;

    // ─── Skeleton ───
    if (loading) {
        return (
            <div className="container" style={{ padding: '40px 24px', minHeight: '100vh' }}>
                <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
                <div style={{ marginBottom: '32px' }}>
                    <SkeletonBlock width="120px" height="36px" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                    {[1,2,3,4].map(function(i) { return <SkeletonBlock key={i} height="80px" />; })}
                </div>
                <SkeletonBlock height="200px" style={{ marginBottom: '20px' }} />
                <SkeletonBlock height="120px" style={{ marginBottom: '20px' }} />
                <SkeletonBlock height="60px" />
            </div>
        );
    }

    // ─── Error ───
    if (error) {
        return (
            <div className="container" style={{ padding: '40px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <XCircle size={48} color="#EF4444" />
                <p style={{ color: '#EF4444', fontWeight: 600, fontSize: '1.1rem' }}>{error}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={fetchComplaint} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>Retry</button>
                    <button onClick={function () { navigate('/admin'); }} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>← Back to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                .action-btn { transition: all 0.2s ease; }
                .action-btn:hover:not(:disabled) { transform: translateY(-1px); }
            `}</style>

            <div ref={containerRef} className="container" style={{ padding: '40px 24px', minHeight: '100vh' }}>

                {/* ── Topbar ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <button
                        onClick={function () { navigate('/admin'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #27272A', borderRadius: '8px', color: '#A1A1AA', padding: '9px 16px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s' }}
                        onMouseOver={function (e) { e.currentTarget.style.borderColor = '#52525B'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={function (e) { e.currentTarget.style.borderColor = '#27272A'; e.currentTarget.style.color = '#A1A1AA'; }}
                    >
                        <ArrowLeft size={15} /> Back to Dashboard
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#52525B', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            #{complaint._id.slice(-10).toUpperCase()}
                        </span>
                        <StatusBadge status={complaint.status} />
                    </div>
                </div>

                {/* ── Title + Category ── */}
                <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '4px 12px', background: '#111', border: '1px solid #27272A', borderRadius: '6px', fontSize: '0.8rem', color: '#A1A1AA', fontWeight: 600 }}>
                            {complaint.category}
                        </span>
                        {complaint.moderationFlags && complaint.moderationFlags.length > 0 && (
                            <span style={{ padding: '4px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '0.8rem', color: '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <AlertTriangle size={12} /> Flagged by AI
                            </span>
                        )}
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{complaint.title}</h1>
                </div>

                {/* ── Meta Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>

                    {/* Trust Score */}
                    <div className="premium-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#52525B', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '14px' }}>
                            <ShieldCheck size={12} /> Trust Score
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, height: '6px', background: '#27272A', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: complaint.trustScore + '%', height: '100%', borderRadius: '3px', background: complaint.trustScore > 80 ? '#10B981' : complaint.trustScore > 50 ? '#EAB308' : '#EF4444', transition: 'width 0.6s ease' }} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: complaint.trustScore > 80 ? '#10B981' : complaint.trustScore > 50 ? '#EAB308' : '#EF4444' }}>
                                {complaint.trustScore}
                            </span>
                        </div>
                    </div>

                    {/* Submitted */}
                    <div className="premium-card" style={{ padding: '20px' }}>
                        <div style={{ color: '#52525B', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '10px' }}>Submitted</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div style={{ color: '#52525B', fontSize: '0.8rem', marginTop: '4px' }}>{new Date(complaint.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>

                    {/* Student Hash */}
                    <div className="premium-card" style={{ padding: '20px' }}>
                        <div style={{ color: '#52525B', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '10px' }}>Anonymous Student ID</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#52525B', wordBreak: 'break-all' }}>
                            {complaint.studentHash.slice(0, 32)}…
                        </div>
                    </div>

                    {/* Status */}
                    <div className="premium-card" style={{ padding: '20px' }}>
                        <div style={{ color: '#52525B', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '10px' }}>Current Status</div>
                        <StatusBadge status={complaint.status} />
                    </div>
                </div>

                {/* ── AI Flags ── */}
                {complaint.moderationFlags && complaint.moderationFlags.length > 0 && (
                    <div className="premium-card" style={{ padding: '20px', marginBottom: '20px', borderColor: 'rgba(239,68,68,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '14px' }}>
                            <AlertTriangle size={13} /> AI Moderation Flags
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {complaint.moderationFlags.map(function (flag) {
                                return (
                                    <span key={flag} style={{ padding: '5px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                                        {flag}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Description ── */}
                <div className="premium-card" style={{ padding: '24px', marginBottom: '20px' }}>
                    <div style={{ color: '#52525B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '16px' }}>Full Description</div>
                    <div style={{ color: '#D4D4D8', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                        {longDesc && !expanded ? desc.slice(0, 300) + '…' : desc}
                    </div>
                    {longDesc && (
                        <button
                            onClick={function () { setExpanded(function (p) { return !p; }); }}
                            style={{ marginTop: '12px', background: 'none', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px', padding: 0, fontWeight: 600, transition: 'color 0.2s' }}
                            onMouseOver={function (e) { e.currentTarget.style.color = '#A1A1AA'; }}
                            onMouseOut={function (e) { e.currentTarget.style.color = '#52525B'; }}
                        >
                            {expanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show more</>}
                        </button>
                    )}
                </div>

                {/* ── Action Buttons ── */}
                <div className="premium-card" style={{ padding: '24px', marginBottom: '20px' }}>
                    <div style={{ color: '#52525B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '18px' }}>Admin Actions</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>

                        {/* Resolve & Remove */}
                        <button
                            className="action-btn"
                            disabled={updating}
                            onClick={function () { requestAction('approved'); }}
                            style={{ padding: '14px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', cursor: updating ? 'not-allowed' : 'pointer', border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.06)', color: '#10B981', opacity: updating ? 0.55 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
                        >
                            {updating ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={15} />}
                            Mark Resolved
                        </button>

                        {/* Reject & Remove */}
                        <button
                            className="action-btn"
                            disabled={updating}
                            onClick={function () { requestAction('rejected'); }}
                            style={{ padding: '14px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', cursor: updating ? 'not-allowed' : 'pointer', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#EF4444', opacity: updating ? 0.55 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
                        >
                            {updating ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={15} />}
                            Reject Complaint
                        </button>

                        {/* Revoke & Remove */}
                        <button
                            className="action-btn"
                            disabled={updating}
                            onClick={function () { requestAction('revoke'); }}
                            style={{ padding: '14px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', cursor: updating ? 'not-allowed' : 'pointer', border: '1px solid #3F3F46', background: 'rgba(255,255,255,0.03)', color: '#A1A1AA', opacity: updating ? 0.45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}
                        >
                            {updating ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <RotateCcw size={15} />}
                            Revoke & Remove
                        </button>
                    </div>
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>

                {/* ── Admin Notes ── */}
                <div className="premium-card" style={{ padding: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#52525B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '18px' }}>
                        <StickyNote size={13} /> Internal Admin Notes
                    </div>

                    {/* Existing notes */}
                    {complaint.adminNotes && complaint.adminNotes.length > 0 ? (
                        <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {complaint.adminNotes.map(function (note, idx) {
                                return (
                                    <div key={idx} style={{ background: '#111', border: '1px solid #27272A', borderRadius: '8px', padding: '14px 16px' }}>
                                        <p style={{ color: '#D4D4D8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '8px' }}>{note.text}</p>
                                        <p style={{ color: '#52525B', fontSize: '0.75rem' }}>
                                            {new Date(note.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ color: '#3F3F46', fontSize: '0.87rem', marginBottom: '16px', fontStyle: 'italic' }}>No notes added yet.</p>
                    )}

                    {/* Add note form */}
                    <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '10px' }}>
                        <textarea
                            value={noteText}
                            onChange={function (e) { setNoteText(e.target.value); }}
                            placeholder="Add an internal note (only visible to admins)…"
                            rows={2}
                            style={{ flex: 1, background: '#111', border: '1px solid #27272A', borderRadius: '8px', color: '#fff', padding: '12px 14px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s' }}
                            onFocus={function (e) { e.target.style.borderColor = '#52525B'; }}
                            onBlur={function (e) { e.target.style.borderColor = '#27272A'; }}
                            disabled={addingNote}
                        />
                        <button
                            type="submit"
                            disabled={addingNote || !noteText.trim()}
                            style={{ padding: '0 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid #27272A', borderRadius: '8px', color: '#A1A1AA', cursor: addingNote || !noteText.trim() ? 'not-allowed' : 'pointer', opacity: addingNote || !noteText.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                            onMouseOver={function (e) { if (!addingNote && noteText.trim()) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}}
                            onMouseOut={function (e) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#A1A1AA'; }}
                        >
                            {addingNote ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={15} />}
                            Save Note
                        </button>
                    </form>
                </div>

                {/* ── Status History ── */}
                <div className="premium-card" style={{ padding: '24px', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#52525B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '18px' }}>
                        <History size={13} /> Status History
                    </div>
                    {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {(function() { var reversed = [...complaint.statusHistory].reverse(); return reversed; })().map(function (entry, idx, arr) {
                                var statusColor = entry.status === 'approved' ? '#10B981' : entry.status === 'rejected' ? '#EF4444' : '#EAB308';
                                var statusLabel = entry.status === 'approved' ? 'Approved' : entry.status === 'rejected' ? 'Rejected' : 'Under Review';
                                return (
                                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: idx === arr.length - 1 ? '0' : '20px', position: 'relative' }}>
                                        {/* Timeline dot + line */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '2px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                                            {idx < complaint.statusHistory.length - 1 && (
                                                <div style={{ width: '1px', flex: 1, background: '#27272A', marginTop: '4px', minHeight: '24px' }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: statusColor }}>{statusLabel}</span>
                                                <span style={{ color: '#52525B', fontSize: '0.775rem' }}>
                                                    {new Date(entry.changedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {entry.note && (
                                                <p style={{ color: '#71717A', fontSize: '0.825rem' }}>{entry.note}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ color: '#3F3F46', fontSize: '0.87rem', fontStyle: 'italic' }}>No history available for this complaint.</p>
                    )}
                </div>
            </div>

            {/* ── Toast ── */}
            {toast && (
                <Toast
                    key={toast.key}
                    message={toast.message}
                    type={toast.type}
                    onDone={function () { setToast(null); }}
                />
            )}

            {/* ── Confirm Modal ── */}
            {confirm && (
                <ConfirmModal
                    title={confirm.title}
                    message={confirm.message}
                    confirmLabel={confirm.label}
                    confirmColor={confirm.color}
                    onConfirm={function () { confirm.action(); setConfirm(null); }}
                    onCancel={function () { setConfirm(null); }}
                />
            )}
        </>
    );
}

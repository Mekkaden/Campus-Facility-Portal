import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { complaintStepState, complaintDataState } from '../store';
import { gsap } from 'gsap';
import { Mail, ShieldCheck, ArrowRight, CheckCircle, Loader2, XCircle } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api'
});

export default function SubmissionFlow() {
    const [step, setStep] = useRecoilState(complaintStepState);
    const [complaintData, setComplaintData] = useRecoilState(complaintDataState);
    const [isLoading, setIsLoading] = useState(false);
    const [rejectionMessage, setRejectionMessage] = useState('');
    const containerRef = useRef(null);
    const formRef = useRef(null);

    useEffect(function () {
        gsap.fromTo(containerRef.current, {
            y: 30,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out"
        });
    }, []);

    function handleEmailSubmit(e) {
        e.preventDefault();
        if (!complaintData.email.includes('@mgits.ac.in')) {
            alert('Please use a valid @mgits.ac.in domain email.');
            return;
        }

        setIsLoading(true);
        api.post('/auth/send-otp', { email: complaintData.email })
            .then(function (response) {
                setIsLoading(false);
                gsap.to(formRef.current, {
                    x: -50,
                    opacity: 0,
                    duration: 0.4,
                    ease: "power2.in",
                    onComplete: function () {
                        setStep(1.5);
                        gsap.fromTo(formRef.current,
                            { x: 50, opacity: 0 },
                            { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
                        );
                    }
                });
            })
            .catch(function (error) {
                setIsLoading(false);
                alert(error.response?.data?.error || 'Failed to send OTP. Please try again later.');
            });
    }

    function handleOtpSubmit(e) {
        e.preventDefault();
        if (!complaintData.otp || complaintData.otp.trim() === '') {
            alert('Please enter the OTP.');
            return;
        }

        setIsLoading(true);
        api.post('/auth/verify-otp', { email: complaintData.email, otp: complaintData.otp.trim() })
            .then(function (response) {
                setIsLoading(false);
                gsap.to(formRef.current, {
                    x: -50,
                    opacity: 0,
                    duration: 0.4,
                    ease: "power2.in",
                    onComplete: function () {
                        setStep(2);
                        gsap.fromTo(formRef.current,
                            { x: 50, opacity: 0 },
                            { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
                        );
                    }
                });
            })
            .catch(function (error) {
                setIsLoading(false);
                alert(error.response?.data?.error || 'Verification failed. Incorrect or expired OTP.');
            });
    }

    // ── Client-side profanity guard (same logic as backend Layer 1) ──
    var BLOCK_WORDS_CLIENT = [
        'fuck', 'fuk', 'fck', 'shit', 'shyt', 'bitch', 'biatch', 'asshole', 'bastard', 'cunt',
        'dick', 'cock', 'pussy', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'rape', 'kys',
        'madarchod', 'mc', 'bhenchod', 'bc', 'chutiya', 'chutia', 'gandu', 'bhosdike',
        'harami', 'randi', 'hijra', 'lund', 'gaand', 'kutte', 'suar',
        'myre', 'myra', 'myree', 'poda', 'thayoli', 'oomb', 'umbo', 'kundi', 'kunna',
        'poorr', 'koothichi', 'nayinte', 'porinju', 'thendi', 'kazhuthai'
    ];

    function clientNormalize(text) {
        var s = String(text).toLowerCase();
        s = s.replace(/4/g, 'a').replace(/@/g, 'a').replace(/3/g, 'e')
            .replace(/1/g, 'i').replace(/!/g, 'i').replace(/0/g, 'o')
            .replace(/\$/g, 's').replace(/5/g, 's').replace(/7/g, 't');
        s = s.replace(/([a-z])[^a-z0-9\s]{1,3}([a-z])/g, '$1$2');
        s = s.replace(/(.)\1{2,}/g, '$1$1');
        s = s.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
        return s;
    }

    function clientCheckProfanity(title, desc) {
        var combined = clientNormalize(title + ' ' + desc);
        for (var i = 0; i < BLOCK_WORDS_CLIENT.length; i++) {
            if (combined.includes(BLOCK_WORDS_CLIENT[i])) return true;
        }
        return false;
    }

    function handleComplaintSubmit(e) {
        e.preventDefault();
        if (!complaintData.title || !complaintData.description) {
            alert('Please fill out all fields.');
            return;
        }

        // Instant client-side check
        if (clientCheckProfanity(complaintData.title, complaintData.description)) {
            setRejectionMessage('Inappropriate language detected. Please keep your complaint respectful and factual.');
            setStep(4);
            return;
        }

        setIsLoading(true);
        api.post('/complaints/submit', {
            email: complaintData.email,
            category: complaintData.category,
            title: complaintData.title,
            description: complaintData.description
        }).then(function (response) {
            setIsLoading(false);
            gsap.to(formRef.current, {
                y: -30,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in",
                onComplete: function () {
                    setStep(3);
                    gsap.fromTo(formRef.current,
                        { y: 30, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
                    );
                }
            });
        }).catch(function (error) {
            setIsLoading(false);
            // 422 = AI moderation hard-block
            if (error.response && error.response.status === 422) {
                const msg = error.response.data.error || 'Your complaint was flagged by our AI moderation system.';
                setRejectionMessage(msg);
                gsap.to(formRef.current, {
                    scale: 0.97,
                    opacity: 0,
                    duration: 0.35,
                    ease: "power2.in",
                    onComplete: function () {
                        setStep(4);
                        gsap.fromTo(formRef.current,
                            { scale: 0.95, opacity: 0 },
                            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }
                        );
                    }
                });
            } else {
                alert(error.response?.data?.error || 'Submission failed. Server may be unreachable.');
            }
        });
    }

    function handleInputChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        setComplaintData(function (prev) {
            return {
                ...prev,
                [name]: value
            };
        });
    }

    return (
        <div ref={containerRef} className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '60px 24px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <ShieldCheck size={40} color="var(--success-color)" style={{ marginBottom: '16px', display: 'inline-block' }} />
                    <h2 className="heading-xl" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Secure Submission</h2>
                    <p className="text-subtle">End-to-end encrypted protocol</p>
                </div>

                <div ref={formRef} className="premium-card">
                    {step === 1 && (
                        <form onSubmit={handleEmailSubmit}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', fontWeight: 600 }}>Step 1: Domain Verification</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                                We verify your student status. This email is instantly hashed. The raw email is never stored in our database.
                            </p>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>College Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={20} color="var(--text-tertiary)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="student@mgits.ac.in"
                                        value={complaintData.email}
                                        onChange={handleInputChange}
                                        className="cinematic-input"
                                        style={{ paddingLeft: '48px' }}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                                {isLoading ? <Loader2 size={18} className="spin" style={{ animation: 'spin 2s linear infinite' }} /> : 'Send Verification Code'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    )}

                    {step === 1.5 && (
                        <form onSubmit={handleOtpSubmit}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', fontWeight: 600 }}>Step 1.5: Verification Code</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
                                We've sent a 6-digit code to {complaintData.email}. Please enter it below to securely confirm your identity. It expires in 10 minutes.
                            </p>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>6-Digit OTP</label>
                                <div style={{ position: 'relative' }}>
                                    <ShieldCheck size={20} color="var(--text-tertiary)" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
                                    <input
                                        type="text"
                                        name="otp"
                                        placeholder="123456"
                                        value={complaintData.otp || ''}
                                        onChange={handleInputChange}
                                        className="cinematic-input"
                                        style={{ paddingLeft: '48px', letterSpacing: '8px', fontVariantNumeric: 'tabular-nums', fontWeight: 'bold' }}
                                        maxLength="6"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                                {isLoading ? <Loader2 size={18} className="spin" style={{ animation: 'spin 2s linear infinite' }} /> : 'Authenticate Anonymously'}
                                {!isLoading && <CheckCircle size={18} />}
                            </button>
                            <button type="button" onClick={() => setStep(1)} style={{ width: '100%', marginTop: '16px', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.85rem' }}>
                                Change Email Address
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleComplaintSubmit}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', fontWeight: 600 }}>Step 2: Anonymous Report</h3>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Category</label>
                                <select
                                    name="category"
                                    value={complaintData.category}
                                    onChange={handleInputChange}
                                    className="cinematic-input"
                                    disabled={isLoading}
                                >
                                    <option value="Infrastructure">Infrastructure</option>
                                    <option value="Academics">Academics</option>
                                    <option value="Hostel">Hostel</option>
                                    <option value="Food">Food & Canteen</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Issue Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Brief summation of the issue"
                                    value={complaintData.title}
                                    onChange={handleInputChange}
                                    className="cinematic-input"
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Detailed Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Please provide factual details. All content is analyzed by our moderation model."
                                    value={complaintData.description}
                                    onChange={handleInputChange}
                                    className="cinematic-input"
                                    style={{ minHeight: '150px', resize: 'vertical' }}
                                    required
                                    disabled={isLoading}
                                />
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: '8px' }}>
                                    Content is screened by our intelligent system before it reaches any admin. Keep it respectful and factual.
                                </p>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                                {isLoading ? <Loader2 size={18} style={{ animation: 'spin 2s linear infinite' }} /> : 'Submit Secure Payload'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <CheckCircle size={64} color="var(--success-color)" style={{ margin: '0 auto 24px auto', display: 'inline-block' }} />
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', fontWeight: 600 }}>Submission Encrypted &amp; Sent</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
                                Your feedback has been securely transmitted. It is currently in a quarantine database pending algorithmic verification and manual review. Your identity remains 100% hidden.
                            </p>
                            <button onClick={function () { window.location.href = '/'; }} className="btn-secondary">
                                Return to Terminal
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 24px auto', display: 'inline-block' }} />
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', fontWeight: 600, color: '#ef4444' }}>Submission Blocked by AI</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6', maxWidth: '420px', margin: '0 auto 24px auto' }}>
                                {rejectionMessage}
                            </p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: '28px' }}>
                                Our AI moderation layer detected content that violates the submission policy. Please rephrase your complaint politely and resubmit.
                            </p>
                            <button onClick={function () { setStep(2); }} className="btn-secondary">
                                ← Edit &amp; Resubmit
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Inject a tiny inline style for spinning loaders just in case index.css misses it */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}

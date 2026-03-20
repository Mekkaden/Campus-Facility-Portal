import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ShieldCheck, Github, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const headingRef = useRef(null);
    const textRef = useRef(null);
    const buttonsRef = useRef(null);

    useEffect(function() {
        const ctx = gsap.context(function() {
            gsap.from(headingRef.current, {
                y: 100,
                opacity: 0,
                duration: 1.2,
                ease: "power4.out",
                delay: 0.2
            });
            
            gsap.from(textRef.current, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                delay: 0.6
            });
            
            gsap.from(buttonsRef.current, {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: 1
            });
        }, containerRef);
        
        return function() {
            ctx.revert();
        };
    }, []);

    function handleStartSubmission() {
        gsap.to(containerRef.current, {
            opacity: 0,
            y: -50,
            duration: 0.5,
            ease: "power2.in",
            onComplete: function() {
                navigate('/submit');
            }
        });
    }

    return (
        <div ref={containerRef} className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <ShieldCheck size={48} color="var(--text-primary)" />
                </div>
                
                <h1 ref={headingRef} className="heading-xl" style={{ marginBottom: '32px' }}>
                    Campus Facility Analytics Portal
                </h1>
                
                <div ref={textRef} className="text-subtle" style={{ marginBottom: '48px', fontSize: '1.25rem' }}>
                    <p style={{ marginBottom: '16px' }}>This is an honest, secure facility feedback system.</p>
                    <p style={{ marginBottom: '16px' }}>Your email is only used for one-time verification. Neither the developer nor the college administration can trace your identity.</p>
                    <p>The verification logic is entirely open-source.</p>
                </div>
                
                <div ref={buttonsRef} style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={handleStartSubmission} className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.125rem' }}>
                        Submit Feedback
                        <ArrowRight size={20} />
                    </button>
                    <a href="https://github.com/your-username/campus-facility-portal" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.125rem', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <Github size={20} />
                        View Source
                    </a>
                </div>
            </div>
        </div>
    );
}

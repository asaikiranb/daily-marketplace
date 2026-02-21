'use client';

import { useState, useEffect } from 'react';

export default function TermsModal() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem('husky_terms_accepted');
        if (!accepted) {
            setShow(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('husky_terms_accepted', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Terms & Conditions</h3>
                <p>
                    Welcome to Husky Helpers! By using this platform, you agree to the following:
                </p>
                <ul style={{ fontSize: '0.85rem', color: 'var(--gray-600)', lineHeight: '1.8', marginBottom: '1.5rem', paddingLeft: '1.25rem', listStyle: 'disc' }}>
                    <li>You are a member of the University of Washington community.</li>
                    <li>All services are offered and requested in good faith.</li>
                    <li>You will not post inappropriate, misleading, or harmful content.</li>
                    <li>Payment terms are agreed upon directly between service providers and receivers.</li>
                    <li>Husky Helpers is a platform for connection and does not guarantee service quality.</li>
                    <li>You agree to treat all community members with respect.</li>
                </ul>
                <div className="modal-actions">
                    <button className="btn btn-primary" onClick={handleAccept}>
                        I Accept
                    </button>
                </div>
            </div>
        </div>
    );
}

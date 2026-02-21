'use client';

import Link from 'next/link';

export default function HeroSection({ user }) {
    return (
        <div className="hero">
            <h2>Find Help. Offer Help. Be a Husky Helper.</h2>
            <div className="hero-actions">
                {user ? (
                    <>
                        <Link href="/post-service" className="btn btn-primary btn-lg">
                            Offer a Service
                        </Link>
                        <Link href="/post-request" className="btn btn-secondary btn-lg">
                            Request Help
                        </Link>
                    </>
                ) : (
                    <Link href="/login" className="btn btn-primary btn-lg">
                        Sign In to Get Started
                    </Link>
                )}
            </div>
        </div>
    );
}

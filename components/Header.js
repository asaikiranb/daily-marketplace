'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = '/';
    };

    return (
        <header className="site-header">
            <div className="header-inner">
                <Link href="/" className="header-logo">
                    <span className="logo-icon">🐾</span>
                    <h1>Husky Helpers</h1>
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? '✕' : '☰'}
                </button>

                <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
                    <Link
                        href="/"
                        className={pathname === '/' ? 'active' : ''}
                        onClick={() => setMenuOpen(false)}
                    >
                        Browse
                    </Link>

                    {user && (
                        <>
                            <Link
                                href="/post-service"
                                className={pathname === '/post-service' ? 'active' : ''}
                                onClick={() => setMenuOpen(false)}
                            >
                                Post Service
                            </Link>
                            <Link
                                href="/post-request"
                                className={pathname === '/post-request' ? 'active' : ''}
                                onClick={() => setMenuOpen(false)}
                            >
                                Post Request
                            </Link>
                            <Link
                                href="/profile"
                                className={pathname === '/profile' ? 'active' : ''}
                                onClick={() => setMenuOpen(false)}
                            >
                                My Profile
                            </Link>
                        </>
                    )}

                    {user ? (
                        <button
                            className="btn-header"
                            onClick={() => { handleLogout(); setMenuOpen(false); }}
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="btn-header"
                            onClick={() => setMenuOpen(false)}
                        >
                            Sign In
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

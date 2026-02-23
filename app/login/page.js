'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

function LoginForm() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const errorParam = searchParams.get('error');
    const supabase = createClient();

    const displayError = error || (errorParam === 'domain_restricted'
        ? 'Sign in restricted to @uw.edu email addresses.'
        : errorParam);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        if (isSignUp) {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            // Create profile entry
            if (data?.user) {
                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    email: email,
                    full_name: fullName,
                });
            }

            setSuccessMessage('Account created! Check your email for a confirmation link, or sign in if email confirmation is disabled.');
            setLoading(false);
        } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return;
            }

            router.push(redirect);
            router.refresh();
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
                queryParams: {
                    prompt: 'select_account',
                    hd: 'uw.edu'
                }
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                <p className="auth-subtitle">
                    {isSignUp
                        ? 'Join the Husky Helpers community'
                        : 'Sign in to your Husky Helpers account'}
                </p>

                {displayError && <div className="alert alert-error">{displayError}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                <form onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@uw.edu"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                    <span style={{ padding: '0 0.75rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
                </div>

                <button
                    type="button"
                    className="btn btn-outline btn-lg"
                    style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className="auth-footer">
                    {isSignUp ? (
                        <>
                            Already have an account?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(false); setError(''); setSuccessMessage(''); }}>
                                Sign In
                            </a>
                        </>
                    ) : (
                        <>
                            New to Husky Helpers?{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(true); setError(''); setSuccessMessage(''); }}>
                                Create Account
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="loading-spinner"><div className="spinner" /></div>}>
            <LoginForm />
        </Suspense>
    );
}

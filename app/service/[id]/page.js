'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import StarRating from '@/components/StarRating';
import TestimonialCard from '@/components/TestimonialCard';
import FeedbackForm from '@/components/FeedbackForm';
import Link from 'next/link';

export default function ServiceDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [service, setService] = useState(null);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const supabase = createClient();

    useEffect(() => {
        fetchService();
        checkUser();
    }, [id]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) checkWishlist(user.id);
    };

    const checkWishlist = async (userId) => {
        const { data } = await supabase
            .from('wishlists').select('id').eq('user_id', userId).eq('provider_id', id).maybeSingle();
        setIsWishlisted(!!data);
    };

    const fetchService = async () => {
        setLoading(true);
        const { data: serviceData, error } = await supabase
            .from('services')
            .select('*, profiles!services_provider_id_fkey (id, full_name, photo_url, about_me, contact_info, email)')
            .eq('id', id).single();

        if (error || !serviceData) { setLoading(false); return; }

        const { data: providerServices } = await supabase
            .from('services').select('id, title, category, hourly_rate').eq('provider_id', serviceData.provider_id);

        const { data: testimonialsData } = await supabase
            .from('testimonials')
            .select('*, profiles!testimonials_from_user_id_fkey (full_name)')
            .eq('service_id', id).order('created_at', { ascending: false });

        setService({ ...serviceData, providerServices: providerServices || [] });
        setTestimonials(testimonialsData || []);
        setLoading(false);
    };

    const toggleWishlist = async () => {
        if (!user) { router.push('/login'); return; }
        if (isWishlisted) {
            await supabase.from('wishlists').delete().eq('user_id', user.id).eq('provider_id', service.provider_id);
            setIsWishlisted(false);
        } else {
            await supabase.from('wishlists').insert({ user_id: user.id, provider_id: service.provider_id });
            setIsWishlisted(true);
        }
    };

    const handleFeedbackSubmit = async ({ rating, comment }) => {
        if (!user) { router.push('/login'); return; }
        const { error } = await supabase.from('testimonials').insert({
            from_user_id: user.id,
            to_user_id: service.provider_id,
            service_id: id,
            rating,
            comment,
        });
        if (error) {
            setFeedbackMessage('Error submitting feedback.');
        } else {
            setFeedbackMessage('Feedback submitted!');
            setShowFeedback(false);
            fetchService();
        }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

    if (!service) {
        return (
            <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>Service not found</h3>
                <p>This service may have been removed.</p>
                <Link href="/" className="btn btn-primary">Back to Home</Link>
            </div>
        );
    }

    const provider = service.profiles;
    const initials = provider?.full_name
        ? provider.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
        : '?';

    const avgRating = testimonials.length > 0
        ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
        : 0;

    return (
        <div>
            {/* Header */}
            <div className="detail-header">
                {provider?.photo_url ? (
                    <img src={provider.photo_url} alt={provider.full_name} className="detail-avatar" style={{ objectFit: 'cover' }} />
                ) : (
                    <div className="detail-avatar">{initials}</div>
                )}
                <div className="detail-meta">
                    <h2>{service.title}</h2>
                    <p className="provider-name">by {provider?.full_name || 'Anonymous'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <StarRating rating={Math.round(avgRating)} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                            ({testimonials.length} review{testimonials.length !== 1 ? 's' : ''})
                        </span>
                    </div>
                    <div className="detail-actions">
                        {user && user.id !== service.provider_id && (
                            <>
                                <button className="btn btn-primary" onClick={() => window.location.href = `mailto:${provider?.email || ''}`}>
                                    Request Service
                                </button>
                                <button className="btn btn-secondary" onClick={toggleWishlist}>
                                    {isWishlisted ? '♥ Wishlisted' : '♡ Add to Wishlist'}
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setShowFeedback(!showFeedback)}>
                                    Leave Feedback
                                </button>
                            </>
                        )}
                        {!user && <Link href="/login" className="btn btn-primary">Sign In to Request</Link>}
                    </div>
                </div>
            </div>

            {feedbackMessage && <div className="alert alert-success">{feedbackMessage}</div>}

            {/* Info Grid */}
            <div className="detail-info-grid">
                <div className="info-item">
                    <div className="info-label">Category</div>
                    <div className="info-value">{service.category}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Rate</div>
                    <div className="info-value">${service.hourly_rate}/hr</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Availability</div>
                    <div className="info-value">{service.availability || 'Flexible'}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Rating</div>
                    <div className="info-value">{avgRating > 0 ? avgRating.toFixed(1) : 'No ratings yet'}</div>
                </div>
            </div>

            {/* Description */}
            <div className="detail-section" style={{ marginTop: '2rem' }}>
                <h3>About This Service</h3>
                <p>{service.description}</p>
            </div>

            {/* About Provider */}
            {provider?.about_me && (
                <div className="detail-section">
                    <h3>About the Provider</h3>
                    <p>{provider.about_me}</p>
                </div>
            )}

            {/* Provider's other services */}
            {service.providerServices && service.providerServices.length > 1 && (
                <div className="detail-section">
                    <h3>Other Services by {provider?.full_name}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {service.providerServices
                            .filter((s) => s.id !== service.id)
                            .map((s) => (
                                <Link key={s.id} href={`/service/${s.id}`} className="card"
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{s.title}</strong>
                                        <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', color: 'var(--gray-500)' }}>{s.category}</span>
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'var(--purple)' }}>${s.hourly_rate}/hr</span>
                                </Link>
                            ))}
                    </div>
                </div>
            )}

            {/* Feedback Form */}
            {showFeedback && (
                <div className="detail-section">
                    <h3>Leave Feedback</h3>
                    <FeedbackForm
                        serviceId={id}
                        providerId={service.provider_id}
                        userId={user?.id}
                        onSubmit={handleFeedbackSubmit}
                    />
                </div>
            )}

            {/* Testimonials */}
            <div className="detail-section">
                <h3>Testimonials</h3>
                {testimonials.length > 0 ? (
                    testimonials.map((t) => <TestimonialCard key={t.id} testimonial={t} />)
                ) : (
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>No testimonials yet.</p>
                )}
            </div>
        </div>
    );
}

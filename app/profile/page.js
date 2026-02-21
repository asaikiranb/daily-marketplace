'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AvatarUpload from '@/components/AvatarUpload';
import ProfileEditor from '@/components/ProfileEditor';
import TestimonialCard from '@/components/TestimonialCard';
import StarRating from '@/components/StarRating';
import Link from 'next/link';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [myServices, setMyServices] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ full_name: '', about_me: '', contact_info: '' });
    const [saveMessage, setSaveMessage] = useState('');

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        setUser(user);

        const { data: profileData } = await supabase
            .from('profiles').select('*').eq('id', user.id).single();

        if (profileData) {
            setProfile(profileData);
            setEditForm({
                full_name: profileData.full_name || '',
                about_me: profileData.about_me || '',
                contact_info: profileData.contact_info || '',
            });
        }

        const { data: servicesData } = await supabase
            .from('services').select('*').eq('provider_id', user.id)
            .order('created_at', { ascending: false });
        setMyServices(servicesData || []);

        const { data: wishlistData } = await supabase
            .from('wishlists')
            .select('*, profiles!wishlists_provider_id_fkey (full_name, email)')
            .eq('user_id', user.id);
        setWishlist(wishlistData || []);

        const { data: testimonialsData } = await supabase
            .from('testimonials')
            .select('*, profiles!testimonials_from_user_id_fkey (full_name)')
            .eq('to_user_id', user.id)
            .order('created_at', { ascending: false });
        setTestimonials(testimonialsData || []);

        setLoading(false);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: editForm.full_name, about_me: editForm.about_me, contact_info: editForm.contact_info })
            .eq('id', user.id);

        if (!error) {
            setSaveMessage('Profile updated!');
            setEditing(false);
            setProfile({ ...profile, ...editForm });
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const removeWishlistItem = async (wishlistId) => {
        await supabase.from('wishlists').delete().eq('id', wishlistId);
        setWishlist(wishlist.filter((w) => w.id !== wishlistId));
    };

    const deleteService = async (serviceId) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        await supabase.from('services').delete().eq('id', serviceId);
        setMyServices(myServices.filter((s) => s.id !== serviceId));
    };

    if (loading) {
        return <div className="loading-spinner"><div className="spinner" /></div>;
    }

    return (
        <div>
            {saveMessage && <div className="alert alert-success">{saveMessage}</div>}

            {/* Profile Header */}
            <div className="profile-header">
                <AvatarUpload
                    userId={user?.id}
                    photoUrl={profile?.photo_url}
                    fullName={profile?.full_name}
                    onPhotoUpdate={(url) => {
                        setProfile({ ...profile, photo_url: url });
                        setSaveMessage('Photo updated!');
                        setTimeout(() => setSaveMessage(''), 3000);
                    }}
                />
                <div className="profile-info">
                    {editing ? (
                        <ProfileEditor
                            editForm={editForm}
                            onFormChange={setEditForm}
                            onSave={handleSaveProfile}
                            onCancel={() => setEditing(false)}
                        />
                    ) : (
                        <>
                            <h2>{profile?.full_name || 'Set your name'}</h2>
                            <p className="email">{profile?.email}</p>
                            {profile?.about_me && <p className="about">{profile.about_me}</p>}
                            {profile?.contact_info && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                                    📞 {profile.contact_info}
                                </p>
                            )}
                            <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={() => setEditing(true)}>
                                Edit Profile
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* My Services */}
            <div className="profile-section">
                <h3>My Services ({myServices.length})</h3>
                {myServices.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {myServices.map((s) => (
                            <div key={s.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div>
                                    <Link href={`/service/${s.id}`} style={{ fontWeight: 600, color: 'var(--purple)' }}>{s.title}</Link>
                                    <span style={{ marginLeft: '0.75rem', fontSize: '0.83rem', color: 'var(--gray-500)' }}>
                                        {s.category} · ${s.hourly_rate}/hr
                                    </span>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => deleteService(s.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>You haven't posted any services yet.</p>
                        <Link href="/post-service" className="btn btn-primary btn-sm">Post a Service</Link>
                    </div>
                )}
            </div>

            {/* My Wishlist */}
            <div className="profile-section">
                <h3>My Wishlist ({wishlist.length})</h3>
                {wishlist.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {wishlist.map((w) => (
                            <div key={w.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600 }}>{w.profiles?.full_name || 'Unknown'}</span>
                                <button className="btn btn-secondary btn-sm" onClick={() => removeWishlistItem(w.id)}>Remove</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', padding: '1rem 0' }}>
                        Your wishlist is empty. Browse services and save providers you like!
                    </p>
                )}
            </div>

            {/* Testimonials Received */}
            <div className="profile-section">
                <h3>Testimonials Received ({testimonials.length})</h3>
                {testimonials.length > 0 ? (
                    testimonials.map((t) => <TestimonialCard key={t.id} testimonial={t} />)
                ) : (
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', padding: '1rem 0' }}>
                        No testimonials received yet.
                    </p>
                )}
            </div>
        </div>
    );
}

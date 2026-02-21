'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
    'Tutoring',
    'Moving Help',
    'Cleaning',
    'Tech Support',
    'Photography',
    'Pet Care',
    'Rides',
    'Food & Cooking',
    'Fitness',
    'Other',
];

export default function PostServicePage() {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [availability, setAvailability] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError('You must be logged in.');
            setLoading(false);
            return;
        }

        const { error: insertError } = await supabase.from('services').insert({
            provider_id: user.id,
            title,
            description,
            category,
            hourly_rate: parseFloat(hourlyRate),
            availability,
        });

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            return;
        }

        router.push('/');
        router.refresh();
    };

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Offer a Service</h2>
                <p>Share your skills with the Husky community</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Service Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Math Tutoring — Calculus & Linear Algebra"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">Select a category</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what you offer, your experience, and how you can help..."
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="rate">Hourly Rate ($)</label>
                        <input
                            id="rate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            placeholder="25"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="availability">Availability</label>
                        <input
                            id="availability"
                            type="text"
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            placeholder="e.g., Weekdays 3-8pm"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? 'Posting...' : 'Post Service'}
                </button>
            </form>
        </div>
    );
}

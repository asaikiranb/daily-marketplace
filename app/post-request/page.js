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

export default function PostRequestPage() {
    const [category, setCategory] = useState('');
    const [dateNeeded, setDateNeeded] = useState('');
    const [timeNeeded, setTimeNeeded] = useState('');
    const [duration, setDuration] = useState('');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
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

        const { error: insertError } = await supabase.from('service_requests').insert({
            requester_id: user.id,
            category,
            date_needed: dateNeeded,
            time_needed: timeNeeded,
            duration,
            details,
        });

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);

        setTimeout(() => {
            router.push('/');
        }, 2000);
    };

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div className="page-header">
                <h2>Request Help</h2>
                <p>Post what you need and let Husky Helpers come to you</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && (
                <div className="alert alert-success">
                    Request submitted! Redirecting to home...
                </div>
            )}

            {!success && (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="category">Service Category</label>
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

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="date">Date Needed</label>
                            <input
                                id="date"
                                type="date"
                                value={dateNeeded}
                                onChange={(e) => setDateNeeded(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="time">Time</label>
                            <input
                                id="time"
                                type="time"
                                value={timeNeeded}
                                onChange={(e) => setTimeNeeded(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="duration">Duration</label>
                        <input
                            id="duration"
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="e.g., 2 hours"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="details">Additional Details</label>
                        <textarea
                            id="details"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Describe what you need help with, any specific requirements..."
                        />
                        <span className="form-hint">Optional — but helps providers understand your needs</span>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            )}
        </div>
    );
}

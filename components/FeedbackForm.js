'use client';

import StarRating from './StarRating';
import { useState } from 'react';

export default function FeedbackForm({ serviceId, providerId, userId, onSubmit }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit({ rating, comment });
        setRating(0);
        setComment('');
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
                <label>Rating</label>
                <StarRating rating={rating} interactive onRate={setRating} />
            </div>
            <div className="form-group">
                <label htmlFor="comment">Comment</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading || rating === 0}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
        </form>
    );
}

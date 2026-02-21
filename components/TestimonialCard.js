'use client';

import StarRating from './StarRating';

export default function TestimonialCard({ testimonial }) {
    const initial = testimonial.profiles?.full_name
        ? testimonial.profiles.full_name[0].toUpperCase()
        : '?';

    return (
        <div className="testimonial-card">
            <div className="testimonial-header">
                <div className="testimonial-avatar">{initial}</div>
                <div>
                    <span className="testimonial-name">
                        {testimonial.profiles?.full_name || 'Anonymous'}
                    </span>
                    <StarRating rating={testimonial.rating} />
                </div>
            </div>
            <p className="testimonial-comment">{testimonial.comment}</p>
        </div>
    );
}

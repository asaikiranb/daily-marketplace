'use client';

export default function StarRating({ rating = 0, interactive = false, onRate = () => { } }) {
    return (
        <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
                    onClick={() => interactive && onRate(star)}
                    role={interactive ? 'button' : undefined}
                    aria-label={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
                >
                    ★
                </span>
            ))}
        </div>
    );
}

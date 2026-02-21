'use client';

import Link from 'next/link';
import StarRating from './StarRating';

export default function ServiceCard({ service }) {
    const initials = service.provider_name
        ? service.provider_name.split(' ').map(n => n[0]).join('').toUpperCase()
        : '?';

    return (
        <Link href={`/service/${service.id}`} className="service-card">
            <div className="service-card-body">
                <div className="service-card-header">
                    {service.provider_photo_url ? (
                        <img src={service.provider_photo_url} alt={service.provider_name} className="service-card-avatar" style={{ objectFit: 'cover' }} />
                    ) : (
                        <div className="service-card-avatar">{initials}</div>
                    )}
                    <div className="service-card-info">
                        <h3>{service.title}</h3>
                        <span className="provider-name">{service.provider_name}</span>
                    </div>
                </div>

                <p className="service-card-description">{service.description}</p>

                <div className="service-card-footer">
                    <span className="service-card-category">{service.category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <StarRating rating={Math.round(service.avg_rating || 0)} />
                        <span className="service-card-rate">
                            ${service.hourly_rate}/hr
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

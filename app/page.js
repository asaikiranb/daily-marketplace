'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ServiceCard from '@/components/ServiceCard';
import TermsModal from '@/components/TermsModal';
import HeroSection from '@/components/HeroSection';
import SearchFilter from '@/components/SearchFilter';

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    fetchServices();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        profiles!services_provider_id_fkey (full_name, photo_url),
        testimonials (rating)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const formatted = data.map((s) => ({
        ...s,
        provider_name: s.profiles?.full_name || 'Anonymous',
        provider_photo_url: s.profiles?.photo_url || null,
        avg_rating:
          s.testimonials && s.testimonials.length > 0
            ? s.testimonials.reduce((sum, t) => sum + t.rating, 0) / s.testimonials.length
            : 0,
      }));
      setServices(formatted);
    }
    setLoading(false);
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.provider_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <TermsModal />
      <HeroSection user={user} />

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filteredServices.length > 0 ? (
        <div className="services-grid">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <h3>No services found</h3>
          <p>Try adjusting your search or category filter.</p>
        </div>
      )}
    </>
  );
}

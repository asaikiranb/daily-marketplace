-- ==============================================
-- HUSKY HELPERS DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ==============================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with app-specific fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  photo_url TEXT,
  about_me TEXT,
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICES TABLE
-- Services offered by providers
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  hourly_rate NUMERIC(10, 2) NOT NULL,
  availability TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SERVICE REQUESTS TABLE
-- Requests submitted by receivers
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  date_needed DATE NOT NULL,
  time_needed TIME NOT NULL,
  duration TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TESTIMONIALS TABLE
-- Reviews and feedback
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WISHLISTS TABLE
-- Saved/favorite providers
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- PROFILES: Anyone can read, only owner can update
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- SERVICES: Anyone can read, only provider can insert/update/delete
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create services" ON services
  FOR INSERT WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update their own services" ON services
  FOR UPDATE USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete their own services" ON services
  FOR DELETE USING (auth.uid() = provider_id);

-- SERVICE REQUESTS: Anyone can read, only requester can insert/delete
CREATE POLICY "Service requests are viewable by everyone" ON service_requests
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create requests" ON service_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Requesters can delete their own requests" ON service_requests
  FOR DELETE USING (auth.uid() = requester_id);

-- TESTIMONIALS: Anyone can read, authenticated users can create
CREATE POLICY "Testimonials are viewable by everyone" ON testimonials
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create testimonials" ON testimonials
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- WISHLISTS: Only owner can read/insert/delete
CREATE POLICY "Users can view their own wishlist" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist" ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist" ON wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- AUTO-CREATE PROFILE ON SIGNUP (TRIGGER)
-- ==============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- SEED DATA (sample services)
-- ==============================================
-- NOTE: These use placeholder UUIDs. After creating your first
-- user account, replace the provider_id below with your user's
-- actual UUID from the profiles table, then run these inserts.

-- To find your user ID after signup, run:
-- SELECT id, email FROM profiles;

-- Then uncomment and update the lines below:

/*
INSERT INTO services (provider_id, title, description, category, hourly_rate, availability) VALUES
  ('YOUR-USER-UUID', 'Calculus & Linear Algebra Tutoring', 'Math major offering tutoring in MATH 124, 125, 126, and MATH 308. Patient and thorough explanations with practice problem sessions.', 'Tutoring', 25, 'Mon-Thu 3-8pm'),
  ('YOUR-USER-UUID', 'Moving Day Muscle', 'Need help moving in or out? I have a truck and strong arms. Furniture assembly included.', 'Moving Help', 30, 'Weekends all day'),
  ('YOUR-USER-UUID', 'Python & Web Dev Help', 'CS junior offering help with Python, JavaScript, React, and intro CS coursework. Code reviews and debugging sessions.', 'Tech Support', 20, 'Flexible, just text me'),
  ('YOUR-USER-UUID', 'Event & Portrait Photography', 'Photography student with professional gear. Events, headshots, and social media content.', 'Photography', 40, 'Fri-Sun'),
  ('YOUR-USER-UUID', 'Dog Walking & Pet Sitting', 'Animal lover available for walks, pet sitting, and basic grooming. References available!', 'Pet Care', 18, 'Daily 7am-6pm'),
  ('YOUR-USER-UUID', 'Apartment Deep Cleaning', 'Thorough cleaning service — kitchen, bathroom, floors, dusting. Eco-friendly products used.', 'Cleaning', 22, 'Weekends'),
  ('YOUR-USER-UUID', 'Airport & Campus Rides', 'Reliable rides to Sea-Tac, downtown Seattle, and around campus. Safe driver with a clean car.', 'Rides', 15, 'Anytime with 24hr notice'),
  ('YOUR-USER-UUID', 'Meal Prep & Home Cooking', 'Nutrition-focused meal prep for busy students. Weekly plans or one-time cooking sessions.', 'Food & Cooking', 28, 'Tue & Thu evenings');
*/

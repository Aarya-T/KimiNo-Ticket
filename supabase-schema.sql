-- KimiNo-Ticket Database Schema for Supabase
-- Copy and paste this into your Supabase SQL Editor

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES GRANT ALL ON TABLES TO anon, authenticated;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Movies table
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  duration INTEGER, -- in minutes
  rating DECIMAL(2,1), -- e.g., 4.8
  release_date DATE,
  director TEXT,
  movie_cast TEXT[], -- array of cast members
  genres TEXT[], -- array of genres
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Theaters table
CREATE TABLE IF NOT EXISTS public.theaters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  distance TEXT, -- e.g., "2.5 km"
  total_seats INTEGER DEFAULT 180,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Showtimes table
CREATE TABLE IF NOT EXISTS public.showtimes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  theater_id UUID REFERENCES public.theaters(id) ON DELETE CASCADE,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL,
  available_seats INTEGER DEFAULT 180,
  screen_type TEXT DEFAULT 'standard' CHECK (screen_type IN ('standard', 'imax', '3d', 'vip')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_reference TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id),
  showtime_id UUID REFERENCES public.showtimes(id),
  movie_title TEXT NOT NULL,
  theater_name TEXT NOT NULL,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  seats TEXT[] NOT NULL, -- array of seat numbers like ['A1', 'A2']
  ticket_count INTEGER NOT NULL,
  ticket_total DECIMAL(10,2) NOT NULL,
  snacks_total DECIMAL(10,2) DEFAULT 0,
  booking_fee DECIMAL(10,2) DEFAULT 99,
  tax_amount DECIMAL(10,2) NOT NULL,
  grand_total DECIMAL(10,2) NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  booking_status TEXT DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Snacks table
CREATE TABLE IF NOT EXISTS public.snacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_emoji TEXT, -- for now using emojis
  category TEXT DEFAULT 'snack' CHECK (category IN ('snack', 'drink', 'combo')),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking snacks junction table
CREATE TABLE IF NOT EXISTS public.booking_snacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  snack_id UUID REFERENCES public.snacks(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theaters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_snacks ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert users during signup" ON public.users
  FOR INSERT WITH CHECK (true);

-- Movies policies (public read, admin write)
CREATE POLICY "Anyone can view active movies" ON public.movies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage movies" ON public.movies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Theaters policies (public read, admin write)
CREATE POLICY "Anyone can view active theaters" ON public.theaters
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage theaters" ON public.theaters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Showtimes policies (public read, admin write)
CREATE POLICY "Anyone can view active showtimes" ON public.showtimes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage showtimes" ON public.showtimes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Bookings policies (users can view their own, admins can view all)
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Snacks policies (public read, admin write)
CREATE POLICY "Anyone can view available snacks" ON public.snacks
  FOR SELECT USING (is_available = true);

CREATE POLICY "Only admins can manage snacks" ON public.snacks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Booking snacks policies
CREATE POLICY "Users can view their booking snacks" ON public.booking_snacks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = booking_id AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add snacks to their bookings" ON public.booking_snacks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = booking_id AND bookings.user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_theaters_updated_at BEFORE UPDATE ON public.theaters FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_showtimes_updated_at BEFORE UPDATE ON public.showtimes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_snacks_updated_at BEFORE UPDATE ON public.snacks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data

-- Sample theaters
INSERT INTO public.theaters (name, location, address, distance) VALUES
  ('PVR Cinemas', 'Phoenix Mall', 'Phoenix Marketcity, Viman Nagar, Pune', '2.5 km'),
  ('INOX', 'City Mall', 'Season Mall, Magarpatta City, Pune', '4.2 km'),
  ('Cinepolis', 'Westend Mall', 'Westend Mall, Aundh, Pune', '6.8 km'),
  ('Carnival Cinemas', 'Elpro Mall', 'Elpro City Square Mall, Chinchwad, Pune', '8.1 km');

-- Sample snacks
INSERT INTO public.snacks (name, description, price, image_emoji, category) VALUES
  ('Popcorn Combo', 'Large popcorn with 2 soft drinks', 399, '🍿', 'combo'),
  ('Nachos with Cheese', 'Crispy nachos with melted cheese', 299, '🧀', 'snack'),
  ('Soft Drink (Large)', 'Your choice of Coke, Sprite, or Fanta', 199, '🥤', 'drink'),
  ('Candy Box', 'Assorted candies and chocolates', 149, '🍬', 'snack'),
  ('Samosa (2 pcs)', 'Crispy samosas with mint chutney', 129, '🔺', 'snack'),
  ('French Fries', 'Crispy golden fries with seasoning', 179, '🍟', 'snack');

-- Sample movies
INSERT INTO public.movies (title, description, image_url, backdrop_url, duration, rating, release_date, director, movie_cast, genres) VALUES
  (
    'Dune: Part Two',
    'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.',
    '/placeholder.svg?height=600&width=400&text=Dune%20Part%20Two',
    '/placeholder.svg?height=1080&width=1920&text=Dune%20Part%20Two%20Backdrop',
    166,
    4.8,
    '2024-03-01',
    'Denis Villeneuve',
    ARRAY['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Josh Brolin'],
    ARRAY['Sci-Fi', 'Adventure', 'Drama']
  ),
  (
    'Oppenheimer',
    'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    '/placeholder.svg?height=600&width=400&text=Oppenheimer',
    '/placeholder.svg?height=1080&width=1920&text=Oppenheimer%20Backdrop',
    180,
    4.7,
    '2023-07-21',
    'Christopher Nolan',
    ARRAY['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    ARRAY['Biography', 'Drama', 'History']
  );

-- Create admin user (you'll need to update this with your actual admin user ID after signup)
-- INSERT INTO public.users (id, email, full_name, role) VALUES
--   ('your-admin-user-id-here', 'admin@kiminoticket.com', 'Admin User', 'admin');

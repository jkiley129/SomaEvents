import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database schema
export type Event = {
  id: string;
  title: string;
  slug: string;
  start_datetime: string | null;
  end_datetime: string | null;
  start_date: string;
  end_date: string | null;
  time_clarity: 'exact' | 'unclear';
  venue_name: string | null;
  venue_short: string | null;
  venue_address: string | null;
  venue_city: string | null;
  venue_state: string | null;
  venue_zip: string | null;
  town: 'Maplewood' | 'South Orange' | null;
  categories: string[];
  description_html: string | null;
  description_text: string | null;
  source_name: string;
  source_url: string;
  ticket_url: string | null;
  price_text: string | null;
  image_url: string | null;
  image_source: 'source' | 'placeholder' | null;
  is_recurring: boolean;
  recurring_note: string | null;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
  last_seen_in_source_at: string;
};

export type Source = {
  id: string;
  name: string;
  slug: string;
  url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

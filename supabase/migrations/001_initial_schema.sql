-- SOMAevents Initial Schema Migration
-- Version: 1.0
-- Date: 2026-03-06

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text matching

-- Create enums
CREATE TYPE time_clarity_enum AS ENUM ('exact', 'unclear');
CREATE TYPE event_status_enum AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE town_enum AS ENUM ('Maplewood', 'South Orange');
CREATE TYPE image_source_enum AS ENUM ('source', 'placeholder');

-- Sources table (for extensible source management)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,

  -- Date/time
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  start_date DATE NOT NULL,
  end_date DATE,
  time_clarity time_clarity_enum NOT NULL DEFAULT 'exact',

  -- Venue
  venue_name TEXT,
  venue_short TEXT,
  venue_address TEXT,
  venue_city TEXT,
  venue_state TEXT,
  venue_zip TEXT,
  town town_enum,

  -- Categories and description
  categories TEXT[] NOT NULL DEFAULT '{}',
  description_html TEXT,
  description_text TEXT,

  -- Source info
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  ticket_url TEXT,
  price_text TEXT,

  -- Image
  image_url TEXT,
  image_source image_source_enum,

  -- Recurring
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_note TEXT,

  -- Status and timestamps
  status event_status_enum NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_in_source_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Normalized title for deduplication
  title_normalized TEXT,

  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Ingestion runs table (for logging and monitoring)
CREATE TABLE ingestion_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed
  total_found INTEGER DEFAULT 0,
  total_eligible INTEGER DEFAULT 0,
  total_inserted INTEGER DEFAULT 0,
  total_updated INTEGER DEFAULT 0,
  total_skipped INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  error_log JSONB,
  source_stats JSONB, -- Per-source statistics
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_town ON events(town);
CREATE INDEX idx_events_categories ON events USING GIN(categories);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_source_name ON events(source_name);

-- Trigram indexes for fuzzy matching (deduplication)
CREATE INDEX idx_events_title_trgm ON events USING GIN(title_normalized gin_trgm_ops);
CREATE INDEX idx_events_venue_trgm ON events USING GIN(venue_short gin_trgm_ops);

-- Full-text search index
CREATE INDEX idx_events_description_text ON events USING GIN(to_tsvector('english', description_text));
CREATE INDEX idx_events_title_text ON events USING GIN(to_tsvector('english', title));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed initial sources
INSERT INTO sources (name, slug, url) VALUES
  ('South Orange Downtown', 'sodt', 'https://www.southorangedowntown.org/events'),
  ('Maplewood Arts & Culture', 'mac', 'https://www.maplewoodartsandculture.org/upcoming-events-summary'),
  ('Pallet Brewing', 'pallet', 'https://palletbrewing.com/eventscal/'),
  ('SOPAC', 'sopac', 'https://www.sopacnow.org/events/');

-- Function to normalize title for deduplication
CREATE OR REPLACE FUNCTION normalize_title(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN regexp_replace(
    regexp_replace(
      lower(title),
      '[^\w\s]', '', 'g'  -- Remove punctuation
    ),
    '\s+', ' ', 'g'  -- Collapse whitespace
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-populate title_normalized
CREATE OR REPLACE FUNCTION set_title_normalized()
RETURNS TRIGGER AS $$
BEGIN
  NEW.title_normalized = normalize_title(NEW.title);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_events_title_normalized
  BEFORE INSERT OR UPDATE OF title ON events
  FOR EACH ROW
  EXECUTE FUNCTION set_title_normalized();

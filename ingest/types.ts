/**
 * Types and interfaces for the event ingestion system
 */

import type { Category } from '@/lib/categories';
import type { Town } from '@/lib/geo';
import type { TimeClarity } from '@/lib/date-utils';

/**
 * Raw event data as scraped from a source
 * Before normalization and validation
 */
export interface RawEvent {
  title: string;
  url: string;
  startDate?: string | Date;
  endDate?: string | Date;
  startTime?: string;
  endTime?: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  venueState?: string;
  venueZip?: string;
  description?: string;
  descriptionHtml?: string;
  categories?: string[];
  ticketUrl?: string;
  price?: string;
  imageUrl?: string;
  isRecurring?: boolean;
  recurringNote?: string;
}

/**
 * Normalized event ready for database insertion
 */
export interface NormalizedEvent {
  title: string;
  slug: string;
  start_datetime: Date | null;
  end_datetime: Date | null;
  start_date: Date;
  end_date: Date | null;
  time_clarity: TimeClarity;
  venue_name: string | null;
  venue_short: string | null;
  venue_address: string | null;
  venue_city: string | null;
  venue_state: string | null;
  venue_zip: string | null;
  town: Town;
  categories: Category[];
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
  status: 'active';
}

/**
 * Event source interface
 * All scrapers must implement this interface
 */
export interface EventSource {
  /**
   * Human-readable name of the source
   */
  name: string;

  /**
   * Unique slug identifier
   */
  slug: string;

  /**
   * Base URL of the source
   */
  url: string;

  /**
   * Fetches and parses events from the source
   * Returns an array of normalized events ready for database insertion
   */
  fetchEvents(): Promise<NormalizedEvent[]>;
}

/**
 * Scraper statistics for a single source
 */
export interface SourceStats {
  sourceName: string;
  found: number;
  eligible: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  errorMessages?: string[];
}

/**
 * Overall ingestion run statistics
 */
export interface IngestionStats {
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed';
  totalFound: number;
  totalEligible: number;
  totalInserted: number;
  totalUpdated: number;
  totalSkipped: number;
  totalErrors: number;
  sources: SourceStats[];
}

/**
 * Configuration for retry logic
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  backoffMultiplier: number;
}

/**
 * Configuration for rate limiting
 */
export interface RateLimitConfig {
  requestsPerSecond: number;
  delayBetweenRequests: number; // milliseconds
}

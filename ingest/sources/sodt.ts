/**
 * South Orange Downtown (SODT) Event Source
 * https://www.southorangedowntown.org/events
 *
 * NOTE: This is a Squarespace site that loads events dynamically via JavaScript.
 * May require Playwright for JavaScript rendering.
 */

import { BaseScraper } from '../base-scraper';
import type { EventSource, NormalizedEvent, RawEvent } from '../types';
import { mapCategories, type Category } from '@/lib/categories';
import { determineTown, getVenueShortName, isEligibleLocation } from '@/lib/geo';
import { isWithinEventWindow, determineTimeClarity, getDateOnly, combineDateTime } from '@/lib/date-utils';
import { generateEventSlug } from '@/lib/slug';
import { sanitizeHtml as sanitize, htmlToPlainText } from '@/lib/sanitize';

export class SODTSource extends BaseScraper implements EventSource {
  constructor() {
    super(
      'South Orange Downtown',
      'sodt',
      'https://www.southorangedowntown.org/events'
    );
  }

  async fetchEvents(): Promise<NormalizedEvent[]> {
    this.logger.info('Starting SODT event scrape');

    const normalizedEvents: NormalizedEvent[] = [];

    try {
      // TODO: This site uses Squarespace and loads events via JavaScript
      // Option 1: Find the Squarespace API endpoint
      // Option 2: Use Playwright to render JavaScript and scrape the rendered HTML
      //
      // For now, returning empty array as placeholder
      // Implementation needed: Parse events from the source

      this.logger.warn('SODT scraper not fully implemented - needs JavaScript rendering support');

      // Example structure for when implemented:
      // const html = await this.fetchHtml(this.url);
      // const rawEvents = this.parseEventList(html);
      //
      // for (const raw of rawEvents) {
      //   if (!this.isValidEvent(raw)) continue;
      //   const normalized = this.normalizeEvent(raw);
      //   if (normalized) normalizedEvents.push(normalized);
      // }

      this.logger.info(`Found ${normalizedEvents.length} events from SODT`);
      return normalizedEvents;
    } catch (error) {
      this.logger.error('Failed to fetch SODT events', error as Error);
      return [];
    }
  }

  /**
   * Parse the events list page (to be implemented)
   */
  private parseEventList(html: string): RawEvent[] {
    // TODO: Parse Squarespace event list
    // Look for event elements and extract URLs
    return [];
  }

  /**
   * Validates if a raw event has required fields
   */
  private isValidEvent(raw: RawEvent): boolean {
    if (!raw.title || !raw.url) {
      this.logger.warn('Skipping event with missing title or URL');
      return false;
    }

    if (!raw.startDate) {
      this.logger.warn(`Skipping event "${raw.title}" with missing start date`);
      return false;
    }

    return true;
  }

  /**
   * Normalizes a raw event into database format
   */
  private normalizeEvent(raw: RawEvent): NormalizedEvent | null {
    try {
      // Parse dates
      const startDate = typeof raw.startDate === 'string'
        ? combineDateTime(raw.startDate, raw.startTime)
        : raw.startDate;

      if (!startDate) {
        this.logger.warn(`Could not parse date for event: ${raw.title}`);
        return null;
      }

      // Check if within event window (next 30 days)
      if (!isWithinEventWindow(startDate)) {
        return null;
      }

      // Determine town
      const town = determineTown(
        raw.venueAddress,
        raw.venueCity,
        raw.venueName,
        raw.description
      );

      // Check location eligibility
      if (!isEligibleLocation(raw.venueAddress, raw.venueCity, raw.venueName, raw.description)) {
        return null;
      }

      // Generate slug
      const slug = generateEventSlug(raw.title, raw.venueName, startDate, raw.url);

      // Process description
      const descriptionHtml = raw.descriptionHtml ? sanitize(raw.descriptionHtml) : null;
      const descriptionText = descriptionHtml ? htmlToPlainText(descriptionHtml) : raw.description || null;

      // Map categories
      const categories: Category[] = raw.categories && raw.categories.length > 0
        ? mapCategories(raw.categories)
        : ['Community'];

      return {
        title: raw.title.trim(),
        slug,
        start_datetime: startDate,
        end_datetime: raw.endDate
          ? (typeof raw.endDate === 'string' ? combineDateTime(raw.endDate, raw.endTime) : raw.endDate)
          : null,
        start_date: startDate,
        end_date: raw.endDate
          ? (typeof raw.endDate === 'string' ? combineDateTime(raw.endDate, raw.endTime) : raw.endDate)
          : null,
        time_clarity: determineTimeClarity(startDate),
        venue_name: raw.venueName?.trim() || null,
        venue_short: raw.venueName ? getVenueShortName(raw.venueName) : null,
        venue_address: raw.venueAddress?.trim() || null,
        venue_city: raw.venueCity?.trim() || 'South Orange',
        venue_state: raw.venueState?.trim() || 'NJ',
        venue_zip: raw.venueZip?.trim() || null,
        town,
        categories,
        description_html: descriptionHtml,
        description_text: descriptionText,
        source_name: this.name,
        source_url: raw.url,
        ticket_url: raw.ticketUrl || null,
        price_text: raw.price || null,
        image_url: raw.imageUrl || null,
        image_source: raw.imageUrl ? 'source' : null,
        is_recurring: raw.isRecurring || false,
        recurring_note: raw.recurringNote || null,
        status: 'active',
      };
    } catch (error) {
      this.logger.error(`Error normalizing event: ${raw.title}`, error as Error);
      return null;
    }
  }
}

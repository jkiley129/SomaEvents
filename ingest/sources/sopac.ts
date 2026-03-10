/**
 * SOPAC (South Orange Performing Arts Center) Event Source
 * https://www.sopacnow.org/events/
 */

import { BaseScraper } from '../base-scraper';
import type { EventSource, NormalizedEvent, RawEvent } from '../types';
import { mapCategories, type Category } from '@/lib/categories';
import { determineTown, getVenueShortName, isEligibleLocation } from '@/lib/geo';
import { isWithinEventWindow, determineTimeClarity, combineDateTime } from '@/lib/date-utils';
import { generateEventSlug } from '@/lib/slug';
import { sanitizeHtml as sanitize, htmlToPlainText } from '@/lib/sanitize';

export class SOPACSource extends BaseScraper implements EventSource {
  constructor() {
    super(
      'SOPAC',
      'sopac',
      'https://www.sopacnow.org/events/'
    );
  }

  async fetchEvents(): Promise<NormalizedEvent[]> {
    this.logger.info('Starting SOPAC event scrape');

    const normalizedEvents: NormalizedEvent[] = [];

    try {
      // TODO: Implement SOPAC scraper
      // SOPAC has a dedicated events page
      // Need to inspect structure and implement parsing logic
      //
      // IMPORTANT: SOPAC events should ALWAYS be included (per PRD)
      // even if address information is incomplete

      this.logger.warn('SOPAC scraper not fully implemented');

      this.logger.info(`Found ${normalizedEvents.length} events from SOPAC`);
      return normalizedEvents;
    } catch (error) {
      this.logger.error('Failed to fetch SOPAC events', error as Error);
      return [];
    }
  }

  private normalizeEvent(raw: RawEvent): NormalizedEvent | null {
    try {
      const startDate = typeof raw.startDate === 'string'
        ? combineDateTime(raw.startDate, raw.startTime)
        : raw.startDate;

      if (!startDate) {
        this.logger.warn(`Could not parse date for event: ${raw.title}`);
        return null;
      }

      if (!isWithinEventWindow(startDate)) {
        return null;
      }

      // SOPAC venue information (always included)
      const venueName = 'South Orange Performing Arts Center';
      const venueAddress = '1 SOPAC Way';
      const town = 'South Orange';

      const slug = generateEventSlug(raw.title, venueName, startDate, raw.url);
      const descriptionHtml = raw.descriptionHtml ? sanitize(raw.descriptionHtml) : null;
      const descriptionText = descriptionHtml ? htmlToPlainText(descriptionHtml) : raw.description || null;

      // SOPAC events are typically Music, Theater, Comedy, or Film
      const categories: Category[] = raw.categories && raw.categories.length > 0
        ? mapCategories(raw.categories)
        : ['Theater'];

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
        venue_name: venueName,
        venue_short: 'SOPAC',
        venue_address: venueAddress,
        venue_city: 'South Orange',
        venue_state: 'NJ',
        venue_zip: '07079',
        town: 'South Orange',
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

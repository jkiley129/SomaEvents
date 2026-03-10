/**
 * Maplewood Arts & Culture (MAC) Event Source
 * https://www.maplewoodartsandculture.org/upcoming-events-summary
 */

import { BaseScraper } from '../base-scraper';
import type { EventSource, NormalizedEvent, RawEvent } from '../types';
import { mapCategories, type Category } from '@/lib/categories';
import { determineTown, getVenueShortName, isEligibleLocation } from '@/lib/geo';
import { isWithinEventWindow, determineTimeClarity, combineDateTime } from '@/lib/date-utils';
import { generateEventSlug } from '@/lib/slug';
import { sanitizeHtml as sanitize, htmlToPlainText } from '@/lib/sanitize';

export class MACSource extends BaseScraper implements EventSource {
  constructor() {
    super(
      'Maplewood Arts & Culture',
      'mac',
      'https://www.maplewoodartsandculture.org/upcoming-events-summary'
    );
  }

  async fetchEvents(): Promise<NormalizedEvent[]> {
    this.logger.info('Starting MAC event scrape');

    const normalizedEvents: NormalizedEvent[] = [];

    try {
      // TODO: Implement MAC scraper
      // This site may also load events dynamically
      // Need to inspect the page structure and implement parsing logic

      this.logger.warn('MAC scraper not fully implemented');

      this.logger.info(`Found ${normalizedEvents.length} events from MAC`);
      return normalizedEvents;
    } catch (error) {
      this.logger.error('Failed to fetch MAC events', error as Error);
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

      const town = determineTown(
        raw.venueAddress,
        raw.venueCity,
        raw.venueName,
        raw.description
      );

      if (!isEligibleLocation(raw.venueAddress, raw.venueCity, raw.venueName, raw.description)) {
        return null;
      }

      const slug = generateEventSlug(raw.title, raw.venueName, startDate, raw.url);
      const descriptionHtml = raw.descriptionHtml ? sanitize(raw.descriptionHtml) : null;
      const descriptionText = descriptionHtml ? htmlToPlainText(descriptionHtml) : raw.description || null;
      const categories: Category[] = raw.categories && raw.categories.length > 0
        ? mapCategories(raw.categories)
        : ['Arts'];

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
        venue_name: raw.venueName?.trim() || '1978 Maplewood Arts Center',
        venue_short: raw.venueName ? getVenueShortName(raw.venueName) : 'MAC',
        venue_address: raw.venueAddress?.trim() || null,
        venue_city: raw.venueCity?.trim() || 'Maplewood',
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

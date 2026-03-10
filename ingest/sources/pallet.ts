/**
 * Pallet Brewing Company Event Source
 * https://palletbrewing.com/eventscal/
 */

import { BaseScraper } from '../base-scraper';
import type { EventSource, NormalizedEvent, RawEvent } from '../types';
import { mapCategories, type Category } from '@/lib/categories';
import { determineTown, getVenueShortName, isEligibleLocation } from '@/lib/geo';
import { isWithinEventWindow, determineTimeClarity, combineDateTime } from '@/lib/date-utils';
import { generateEventSlug } from '@/lib/slug';
import { sanitizeHtml as sanitize, htmlToPlainText } from '@/lib/sanitize';

export class PalletSource extends BaseScraper implements EventSource {
  constructor() {
    super(
      'Pallet Brewing',
      'pallet',
      'https://palletbrewing.com/eventscal/'
    );
  }

  async fetchEvents(): Promise<NormalizedEvent[]> {
    this.logger.info('Starting Pallet Brewing event scrape');

    const normalizedEvents: NormalizedEvent[] = [];

    try {
      // TODO: Implement Pallet Brewing scraper
      // This appears to be a calendar/events page
      // Need to inspect structure and implement parsing logic

      this.logger.warn('Pallet Brewing scraper not fully implemented');

      this.logger.info(`Found ${normalizedEvents.length} events from Pallet Brewing`);
      return normalizedEvents;
    } catch (error) {
      this.logger.error('Failed to fetch Pallet Brewing events', error as Error);
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

      // Pallet Brewing is in Maplewood
      const venueName = 'Pallet Brewing Company';
      const venueAddress = '60 Jacobus Ave';
      const town = 'Maplewood';

      const slug = generateEventSlug(raw.title, venueName, startDate, raw.url);
      const descriptionHtml = raw.descriptionHtml ? sanitize(raw.descriptionHtml) : null;
      const descriptionText = descriptionHtml ? htmlToPlainText(descriptionHtml) : raw.description || null;

      // Pallet events are typically Food & Drink, Music, or Community
      const categories: Category[] = raw.categories && raw.categories.length > 0
        ? mapCategories(raw.categories)
        : ['Food & Drink'];

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
        venue_short: 'Pallet Brewing',
        venue_address: venueAddress,
        venue_city: 'Maplewood',
        venue_state: 'NJ',
        venue_zip: '07040',
        town: 'Maplewood',
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

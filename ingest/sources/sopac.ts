/**
 * SOPAC (South Orange Performing Arts Center) Event Source
 * https://www.sopacnow.org/events/
 *
 * Uses RSS feed to get events, then fetches individual event pages for details
 */

import { BaseScraper } from '../base-scraper';
import type { EventSource, NormalizedEvent, RawEvent } from '../types';
import { mapCategories, type Category } from '@/lib/categories';
import { determineTown, getVenueShortName, isEligibleLocation } from '@/lib/geo';
import { isWithinEventWindow, determineTimeClarity, combineDateTime } from '@/lib/date-utils';
import { generateEventSlug } from '@/lib/slug';
import { sanitizeHtml as sanitize, htmlToPlainText } from '@/lib/sanitize';
import * as cheerio from 'cheerio';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXml = promisify(parseString);

export class SOPACSource extends BaseScraper implements EventSource {
  private readonly feedUrl = 'https://www.sopacnow.org/events/feed/';

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
      // Fetch RSS feed
      const feedXml = await this.fetchHtml(this.feedUrl);
      const feed: any = await parseXml(feedXml);

      if (!feed?.rss?.channel?.[0]?.item) {
        this.logger.warn('No events found in RSS feed');
        return [];
      }

      const items = feed.rss.channel[0].item;
      this.logger.info(`Found ${items.length} events in RSS feed`);

      // Process each event (limit to first 10 for testing)
      const itemsToProcess = items.slice(0, 10);

      for (const item of itemsToProcess) {
        try {
          const eventUrl = item.link?.[0];
          const title = item.title?.[0];

          if (!eventUrl || !title) {
            this.logger.warn(`Skipping event with missing URL or title`);
            continue;
          }

          this.logger.info(`Fetching event: ${title}`);

          // Fetch event detail page
          const html = await this.fetchHtml(eventUrl);
          const raw = this.parseEventPage(html, eventUrl);

          if (!raw) continue;

          const normalized = this.normalizeEvent(raw);
          if (normalized) {
            normalizedEvents.push(normalized);
          }
        } catch (error) {
          this.logger.error(`Error processing event`, error as Error);
        }
      }

      this.logger.info(`Found ${normalizedEvents.length} eligible events from SOPAC`);
      return normalizedEvents;
    } catch (error) {
      this.logger.error('Failed to fetch SOPAC events', error as Error);
      return [];
    }
  }

  /**
   * Parses an individual event page
   */
  private parseEventPage(html: string, url: string): RawEvent | null {
    try {
      const $ = cheerio.load(html);

      // Extract title
      const title = $('h1').first().text().trim();
      if (!title) return null;

      // Extract date/time - format: "THU, MAR 12, 2026 at 7:30PM"
      const dateTimeText = $('.event-dates h3').first().text().trim();
      const { startDate, startTime } = this.parseDateTimeText(dateTimeText);

      if (!startDate) {
        this.logger.warn(`Could not parse date for: ${title}`);
        return null;
      }

      // Extract description
      const description = $('.entry-content').text().trim();

      // Extract ticket URL
      const ticketUrl = $('a.btn-primary[href*="salesforce-sites"]').attr('href') || undefined;

      // Extract image
      const imageUrl = $('.page-header--image').css('background-image')?.match(/url\((.*?)\)/)?.[1]?.replace(/['"]/g, '') || undefined;

      // Extract genre/category from classes
      const articleClasses = $('article').attr('class') || '';
      const genreMatch = articleClasses.match(/xdgp_genre-(\w+)/);
      const category = genreMatch ? genreMatch[1] : undefined;

      return {
        title,
        url,
        startDate,
        startTime,
        description,
        ticketUrl,
        imageUrl,
        categories: category ? [category] : [],
      };
    } catch (error) {
      this.logger.error('Error parsing event page', error as Error);
      return null;
    }
  }

  /**
   * Parses SOPAC date/time format: "THU, MAR 12, 2026 at 7:30PM"
   */
  private parseDateTimeText(text: string): { startDate?: string; startTime?: string } {
    try {
      // Example: "THU, MAR 12, 2026 at 7:30PM"
      const match = text.match(/([A-Z]{3}),\s+([A-Z]{3})\s+(\d{1,2}),\s+(\d{4})\s+at\s+(\d{1,2}:\d{2}[AP]M)/i);

      if (!match) {
        return {};
      }

      const [, , month, day, year, time] = match;

      // Convert month name to number
      const monthMap: Record<string, string> = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
        'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
        'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
      };

      const monthNum = monthMap[month.toUpperCase()];
      if (!monthNum) return {};

      const startDate = `${year}-${monthNum}-${day.padStart(2, '0')}`;
      const startTime = time;

      return { startDate, startTime };
    } catch (error) {
      return {};
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

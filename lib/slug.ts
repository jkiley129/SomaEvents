/**
 * Slug generation utilities for event URLs
 * Format: title-venue-hash (e.g., "trivia-night-luna-stella-a3f9")
 */

import slugify from 'slugify';
import { createHash } from 'crypto';

/**
 * Generates a short hash from a string
 */
function generateHash(input: string): string {
  const hash = createHash('md5').update(input).digest('hex');
  return hash.slice(0, 4); // Use first 4 characters
}

/**
 * Generates a URL-safe slug from a title
 */
function slugifyText(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}

/**
 * Generates a unique slug for an event
 * Format: {title}-{venue}-{hash}
 *
 * @param title Event title
 * @param venueName Venue name
 * @param startDate Start date (for uniqueness)
 * @param sourceUrl Source URL (for additional uniqueness)
 */
export function generateEventSlug(
  title: string,
  venueName: string | null | undefined,
  startDate: Date | string,
  sourceUrl: string
): string {
  // Slugify title (limit to ~50 chars for readability)
  const titleSlug = slugifyText(title).slice(0, 50);

  // Slugify venue (limit to ~20 chars)
  const venueSlug = venueName ? slugifyText(venueName).slice(0, 20) : 'venue';

  // Generate hash from unique combination
  const dateStr = typeof startDate === 'string' ? startDate : startDate.toISOString();
  const hashInput = `${title}-${venueName}-${dateStr}-${sourceUrl}`;
  const hash = generateHash(hashInput);

  // Combine into slug
  return `${titleSlug}-${venueSlug}-${hash}`;
}

/**
 * Validates if a slug is in the correct format
 */
export function isValidSlug(slug: string): boolean {
  // Should be lowercase alphanumeric with hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 10 && slug.length <= 100;
}

/**
 * Cleans and normalizes a slug
 */
export function cleanSlug(slug: string): string {
  return slugify(slug, {
    lower: true,
    strict: true,
  });
}

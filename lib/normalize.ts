/**
 * Text normalization utilities for deduplication and matching
 */

/**
 * Common stopwords to remove for better matching
 */
const STOPWORDS = [
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'presents',
  'feat',
  'featuring',
  'live',
];

/**
 * Normalizes text for fuzzy matching
 * - Converts to lowercase
 * - Removes punctuation
 * - Removes extra whitespace
 * - Optionally removes stopwords
 */
export function normalizeText(text: string, removeStopwords: boolean = false): string {
  if (!text) return '';

  let normalized = text
    .toLowerCase()
    .trim()
    // Replace & with 'and'
    .replace(/&/g, ' and ')
    // Remove punctuation except spaces
    .replace(/[^\w\s]/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  if (removeStopwords) {
    const words = normalized.split(' ');
    const filtered = words.filter(word => !STOPWORDS.includes(word));
    normalized = filtered.join(' ');
  }

  return normalized;
}

/**
 * Normalizes a title specifically for deduplication
 * Applies aggressive normalization including stopword removal
 */
export function normalizeTitle(title: string): string {
  return normalizeText(title, true);
}

/**
 * Normalizes a venue name for matching
 */
export function normalizeVenue(venue: string): string {
  return normalizeText(venue, false);
}

/**
 * Strips HTML tags from text, leaving only plain text
 */
export function stripHtml(html: string): string {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Truncates text to a maximum length, adding ellipsis if needed
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Cleans and normalizes whitespace in text
 */
export function cleanWhitespace(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

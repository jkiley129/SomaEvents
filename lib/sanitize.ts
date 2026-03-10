/**
 * HTML sanitization utilities
 * Ensures user-facing HTML is safe and family-friendly
 */

import sanitizeHtml from 'sanitize-html';

/**
 * Allowed HTML tags for event descriptions
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'a',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
];

/**
 * Allowed attributes for HTML tags
 */
const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title', 'target', 'rel'],
};

/**
 * Allowed URL schemes for links
 */
const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

/**
 * Sanitizes HTML content for safe display
 * Removes potentially dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ALLOWED_SCHEMES,
    allowedSchemesByTag: {
      a: ['http', 'https', 'mailto'],
    },
    // Ensure links open in new tab
    transformTags: {
      'a': (tagName, attribs) => {
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        };
      },
    },
  });
}

/**
 * Converts HTML to plain text
 * Strips all HTML tags and entities
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';

  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
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
 * Sanitizes and truncates HTML for preview/excerpt
 */
export function sanitizeExcerpt(html: string, maxLength: number = 150): string {
  const plainText = htmlToPlainText(html);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.slice(0, maxLength).trim() + '...';
}

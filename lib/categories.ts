/**
 * Category taxonomy and mapping utilities
 * Maps source-specific categories to our canonical taxonomy
 */

export const CATEGORIES = [
  'Music',
  'Theater',
  'Comedy',
  'Arts',
  'Film',
  'Kids',
  'Food & Drink',
  'Community',
  'Education',
  'Festival',
  'Sports',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];

/**
 * Mapping of common category keywords to canonical categories
 * Used for fuzzy matching and normalization
 */
const CATEGORY_KEYWORDS: Record<string, Category> = {
  // Music
  'music': 'Music',
  'concert': 'Music',
  'band': 'Music',
  'jazz': 'Music',
  'rock': 'Music',
  'classical': 'Music',
  'opera': 'Music',
  'symphony': 'Music',
  'singer': 'Music',
  'performance': 'Music',
  'live music': 'Music',

  // Theater
  'theater': 'Theater',
  'theatre': 'Theater',
  'play': 'Theater',
  'drama': 'Theater',
  'musical': 'Theater',
  'broadway': 'Theater',
  'production': 'Theater',
  'performance art': 'Theater',

  // Comedy
  'comedy': 'Comedy',
  'comedian': 'Comedy',
  'standup': 'Comedy',
  'stand-up': 'Comedy',
  'improv': 'Comedy',
  'humor': 'Comedy',

  // Arts
  'art': 'Arts',
  'arts': 'Arts',
  'gallery': 'Arts',
  'exhibition': 'Arts',
  'exhibit': 'Arts',
  'painting': 'Arts',
  'sculpture': 'Arts',
  'visual arts': 'Arts',
  'craft': 'Arts',
  'pottery': 'Arts',
  'drawing': 'Arts',

  // Film
  'film': 'Film',
  'movie': 'Film',
  'cinema': 'Film',
  'screening': 'Film',
  'documentary': 'Film',

  // Kids
  'kids': 'Kids',
  'children': 'Kids',
  'family': 'Kids',
  'youth': 'Kids',
  'storytime': 'Kids',
  'story time': 'Kids',

  // Food & Drink
  'food': 'Food & Drink',
  'drink': 'Food & Drink',
  'dining': 'Food & Drink',
  'tasting': 'Food & Drink',
  'wine': 'Food & Drink',
  'beer': 'Food & Drink',
  'restaurant': 'Food & Drink',
  'brewery': 'Food & Drink',
  'culinary': 'Food & Drink',

  // Community
  'community': 'Community',
  'meeting': 'Community',
  'fundraiser': 'Community',
  'volunteer': 'Community',
  'social': 'Community',
  'networking': 'Community',
  'town hall': 'Community',

  // Education
  'education': 'Education',
  'workshop': 'Education',
  'class': 'Education',
  'seminar': 'Education',
  'lecture': 'Education',
  'course': 'Education',
  'training': 'Education',
  'learning': 'Education',
  'tutorial': 'Education',

  // Festival
  'festival': 'Festival',
  'fair': 'Festival',
  'celebration': 'Festival',
  'parade': 'Festival',

  // Sports
  'sports': 'Sports',
  'sport': 'Sports',
  'game': 'Sports',
  'athletic': 'Sports',
  'fitness': 'Sports',
  'yoga': 'Sports',
  'running': 'Sports',
  'basketball': 'Sports',
  'soccer': 'Sports',
  'baseball': 'Sports',
};

/**
 * Maps a source category string to our canonical category
 */
export function mapCategory(sourceCategory: string): Category {
  const normalized = sourceCategory.toLowerCase().trim();

  // Direct match
  if (normalized in CATEGORY_KEYWORDS) {
    return CATEGORY_KEYWORDS[normalized];
  }

  // Partial match - check if any keyword appears in the category string
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      return category;
    }
  }

  return 'Other';
}

/**
 * Maps multiple source categories to canonical categories
 * Returns unique categories
 */
export function mapCategories(sourceCategories: string[]): Category[] {
  const mapped = sourceCategories
    .map(cat => mapCategory(cat))
    .filter((cat, index, self) => self.indexOf(cat) === index); // Remove duplicates

  return mapped.length > 0 ? mapped : ['Other'];
}

/**
 * Validates if a category is in our taxonomy
 */
export function isValidCategory(category: string): category is Category {
  return CATEGORIES.includes(category as Category);
}

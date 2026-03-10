/**
 * Geographic filtering utilities
 * Determines if an event is in Maplewood or South Orange
 */

/**
 * Location keywords for town detection
 */
const MAPLEWOOD_KEYWORDS = [
  'maplewood',
  'maplewood nj',
  'maplewood, nj',
  '07040',
];

const SOUTH_ORANGE_KEYWORDS = [
  'south orange',
  'so nj',
  'south orange nj',
  'south orange, nj',
  '07079',
];

/**
 * Special venues that are always included
 */
const ALWAYS_INCLUDE_VENUES = [
  'sopac',
  'south orange performing arts center',
];

export type Town = 'Maplewood' | 'South Orange' | null;

/**
 * Checks if text contains Maplewood indicators
 */
function isMaplewood(text: string): boolean {
  const normalized = text.toLowerCase();
  return MAPLEWOOD_KEYWORDS.some(keyword => normalized.includes(keyword));
}

/**
 * Checks if text contains South Orange indicators
 */
function isSouthOrange(text: string): boolean {
  const normalized = text.toLowerCase();
  return SOUTH_ORANGE_KEYWORDS.some(keyword => normalized.includes(keyword));
}

/**
 * Checks if venue should always be included regardless of location
 */
function isAlwaysIncludeVenue(venueName: string): boolean {
  const normalized = venueName.toLowerCase();
  return ALWAYS_INCLUDE_VENUES.some(venue => normalized.includes(venue));
}

/**
 * Determines the town for an event based on location information
 * Returns 'Maplewood', 'South Orange', or null if not in either town
 */
export function determineTown(
  address?: string | null,
  city?: string | null,
  venueName?: string | null,
  description?: string | null
): Town {
  // Combine all location text for checking
  const locationText = [address, city, venueName, description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Check for Maplewood
  if (isMaplewood(locationText)) {
    return 'Maplewood';
  }

  // Check for South Orange
  if (isSouthOrange(locationText)) {
    return 'South Orange';
  }

  // Check if venue should always be included (like SOPAC)
  if (venueName && isAlwaysIncludeVenue(venueName)) {
    return 'South Orange'; // SOPAC is in South Orange
  }

  return null;
}

/**
 * Checks if an event is eligible based on location
 * Events must be in Maplewood or South Orange to be included
 */
export function isEligibleLocation(
  address?: string | null,
  city?: string | null,
  venueName?: string | null,
  description?: string | null
): boolean {
  // Special case: always include certain venues (like SOPAC)
  if (venueName && isAlwaysIncludeVenue(venueName)) {
    return true;
  }

  const town = determineTown(address, city, venueName, description);
  return town !== null;
}

/**
 * Checks if event appears to be online-only
 */
export function isOnlineOnly(
  address?: string | null,
  description?: string | null,
  eventUrl?: string | null
): boolean {
  const text = [address, description, eventUrl]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const onlineKeywords = [
    'online only',
    'virtual event',
    'zoom',
    'livestream',
    'live stream',
    'webinar',
    'online event',
  ];

  const hasOnlineKeyword = onlineKeywords.some(keyword => text.includes(keyword));

  // If it has online keywords but no physical address, it's likely online-only
  if (hasOnlineKeyword && !address) {
    return true;
  }

  return false;
}

/**
 * Venue name aliases - maps full names to short names
 */
export const VENUE_ALIASES: Record<string, string> = {
  'South Orange Performing Arts Center': 'SOPAC',
  'SOPAC': 'SOPAC',
  'Pallet Brewing Company': 'Pallet Brewing',
  'Pallet Brewing': 'Pallet Brewing',
  'Luna Stella': 'Luna Stella',
  'The Woodland': 'The Woodland',
  '1978 Maplewood Arts Center': 'MAC',
  'Maplewood Arts Center': 'MAC',
  'Springfield Avenue Marketplace': 'Springfield Marketplace',
};

/**
 * Gets the short venue name from a full venue name
 */
export function getVenueShortName(fullName: string): string {
  const normalized = fullName.trim();

  // Check for exact or partial match in aliases
  for (const [full, short] of Object.entries(VENUE_ALIASES)) {
    if (normalized.toLowerCase().includes(full.toLowerCase())) {
      return short;
    }
  }

  // If no alias found, return the original (truncated if too long)
  return normalized.length > 30 ? normalized.slice(0, 30) + '...' : normalized;
}

/**
 * Event source registry
 * Central registry for all event sources
 */

import type { EventSource } from './types';

// Import source scrapers (will be implemented in Phase 5)
// import { SODTSource } from './sources/sodt';
// import { MACSource } from './sources/mac';
// import { PalletSource } from './sources/pallet';
// import { SOPACSource } from './sources/sopac';

/**
 * Registry of all event sources
 * Add new sources here as they are implemented
 */
export class SourceRegistry {
  private sources: Map<string, EventSource> = new Map();

  constructor() {
    // Register sources here
    // Phase 5: Uncomment these as sources are implemented
    // this.register(new SODTSource());
    // this.register(new MACSource());
    // this.register(new PalletSource());
    // this.register(new SOPACSource());
  }

  /**
   * Registers a new event source
   */
  register(source: EventSource): void {
    if (this.sources.has(source.slug)) {
      throw new Error(`Source with slug "${source.slug}" is already registered`);
    }
    this.sources.set(source.slug, source);
    console.log(`Registered source: ${source.name} (${source.slug})`);
  }

  /**
   * Gets a source by slug
   */
  get(slug: string): EventSource | undefined {
    return this.sources.get(slug);
  }

  /**
   * Gets all registered sources
   */
  getAll(): EventSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * Gets source slugs
   */
  getSlugs(): string[] {
    return Array.from(this.sources.keys());
  }

  /**
   * Checks if a source is registered
   */
  has(slug: string): boolean {
    return this.sources.has(slug);
  }

  /**
   * Gets the count of registered sources
   */
  count(): number {
    return this.sources.size;
  }
}

/**
 * Singleton instance of the source registry
 */
export const sourceRegistry = new SourceRegistry();

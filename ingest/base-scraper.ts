/**
 * Base scraper utilities
 * Provides retry logic, rate limiting, and error handling
 */

import type { RetryConfig, RateLimitConfig } from './types';

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2,
};

/**
 * Default rate limit configuration
 */
const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  requestsPerSecond: 2,
  delayBetweenRequests: 500, // 500ms
};

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetches a URL with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<Response> {
  let lastError: Error | null = null;
  let delay = retryConfig.retryDelay;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      // If it's a client error (4xx), don't retry
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status} ${response.statusText}`);
      }

      // For server errors (5xx), retry
      lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // Don't sleep after the last attempt
    if (attempt < retryConfig.maxRetries) {
      console.log(`Retry attempt ${attempt + 1}/${retryConfig.maxRetries} for ${url} after ${delay}ms`);
      await sleep(delay);
      delay *= retryConfig.backoffMultiplier;
    }
  }

  throw lastError || new Error('Failed to fetch after retries');
}

/**
 * Rate limiter to prevent overwhelming sources
 */
export class RateLimiter {
  private lastRequestTime: number = 0;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG) {
    this.config = config;
  }

  /**
   * Waits if necessary to respect rate limits
   */
  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.config.delayBetweenRequests) {
      const delayNeeded = this.config.delayBetweenRequests - timeSinceLastRequest;
      await sleep(delayNeeded);
    }

    this.lastRequestTime = Date.now();
  }
}

/**
 * Logger for scraper operations
 */
export class ScraperLogger {
  private sourceName: string;
  private errors: string[] = [];

  constructor(sourceName: string) {
    this.sourceName = sourceName;
  }

  info(message: string): void {
    console.log(`[${this.sourceName}] ${message}`);
  }

  error(message: string, error?: Error): void {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    console.error(`[${this.sourceName}] ERROR: ${errorMessage}`);
    this.errors.push(errorMessage);
  }

  warn(message: string): void {
    console.warn(`[${this.sourceName}] WARNING: ${message}`);
  }

  getErrors(): string[] {
    return this.errors;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }
}

/**
 * Base scraper class with common functionality
 */
export abstract class BaseScraper {
  public name: string;
  public slug: string;
  public url: string;
  protected logger: ScraperLogger;
  protected rateLimiter: RateLimiter;

  constructor(name: string, slug: string, url: string) {
    this.name = name;
    this.slug = slug;
    this.url = url;
    this.logger = new ScraperLogger(name);
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Fetches HTML content from a URL with rate limiting and retry
   */
  protected async fetchHtml(url: string): Promise<string> {
    await this.rateLimiter.wait();

    try {
      this.logger.info(`Fetching ${url}`);
      const response = await fetchWithRetry(url);
      return await response.text();
    } catch (error) {
      this.logger.error(`Failed to fetch ${url}`, error as Error);
      throw error;
    }
  }

  /**
   * Fetches JSON data from a URL with rate limiting and retry
   */
  protected async fetchJson<T>(url: string): Promise<T> {
    await this.rateLimiter.wait();

    try {
      this.logger.info(`Fetching JSON from ${url}`);
      const response = await fetchWithRetry(url);
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to fetch JSON from ${url}`, error as Error);
      throw error;
    }
  }
}

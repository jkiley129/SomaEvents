/**
 * Main ingestion runner
 * Orchestrates fetching events from all sources and upserting to database
 */

import { supabase } from '@/lib/supabase';
import { sourceRegistry } from './registry';
import type { IngestionStats, SourceStats, NormalizedEvent } from './types';

/**
 * Upserts events to the database
 * Checks for existing events and updates them if found
 */
async function upsertEvents(events: NormalizedEvent[]): Promise<{ inserted: number; updated: number; errors: number }> {
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const event of events) {
    try {
      // Check if event already exists by slug
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('slug', event.slug)
        .single();

      if (existing) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            ...event,
            updated_at: new Date().toISOString(),
            last_seen_in_source_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          console.error(`Error updating event ${event.slug}:`, error);
          errors++;
        } else {
          updated++;
        }
      } else {
        // Insert new event
        const { error } = await supabase
          .from('events')
          .insert({
            ...event,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_seen_in_source_at: new Date().toISOString(),
          });

        if (error) {
          console.error(`Error inserting event ${event.slug}:`, error);
          errors++;
        } else {
          inserted++;
        }
      }
    } catch (error) {
      console.error(`Error processing event ${event.slug}:`, error);
      errors++;
    }
  }

  return { inserted, updated, errors };
}

/**
 * Runs ingestion for a single source
 */
async function ingestSource(sourceName: string): Promise<SourceStats> {
  const source = sourceRegistry.get(sourceName);

  if (!source) {
    console.error(`Source ${sourceName} not found in registry`);
    return {
      sourceName,
      found: 0,
      eligible: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: 1,
      errorMessages: [`Source ${sourceName} not found`],
    };
  }

  console.log(`\n========================================`);
  console.log(`Starting ingestion for: ${source.name}`);
  console.log(`========================================\n`);

  const stats: SourceStats = {
    sourceName: source.name,
    found: 0,
    eligible: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    errorMessages: [],
  };

  try {
    // Fetch events from source
    const events = await source.fetchEvents();
    stats.found = events.length;
    stats.eligible = events.length; // All returned events are already filtered for eligibility

    console.log(`Found ${events.length} events from ${source.name}`);

    if (events.length === 0) {
      console.log(`No events to process for ${source.name}`);
      return stats;
    }

    // Upsert events to database
    const { inserted, updated, errors } = await upsertEvents(events);
    stats.inserted = inserted;
    stats.updated = updated;
    stats.errors = errors;

    console.log(`\nResults for ${source.name}:`);
    console.log(`  - Inserted: ${inserted}`);
    console.log(`  - Updated: ${updated}`);
    console.log(`  - Errors: ${errors}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error ingesting from ${source.name}:`, errorMessage);
    stats.errors = 1;
    stats.errorMessages = [errorMessage];
  }

  return stats;
}

/**
 * Runs ingestion for all sources
 */
export async function runIngestion(sourceSlugs?: string[]): Promise<IngestionStats> {
  const startedAt = new Date();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`SOMA Events Ingestion - ${startedAt.toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  const stats: IngestionStats = {
    startedAt,
    status: 'running',
    totalFound: 0,
    totalEligible: 0,
    totalInserted: 0,
    totalUpdated: 0,
    totalSkipped: 0,
    totalErrors: 0,
    sources: [],
  };

  // Determine which sources to run
  const sources = sourceSlugs && sourceSlugs.length > 0
    ? sourceSlugs
    : sourceRegistry.getSlugs();

  if (sources.length === 0) {
    console.log('No sources registered. Add sources in Phase 5.');
    stats.status = 'completed';
    stats.completedAt = new Date();
    return stats;
  }

  // Run ingestion for each source
  for (const sourceSlug of sources) {
    const sourceStats = await ingestSource(sourceSlug);
    stats.sources.push(sourceStats);

    // Aggregate stats
    stats.totalFound += sourceStats.found;
    stats.totalEligible += sourceStats.eligible;
    stats.totalInserted += sourceStats.inserted;
    stats.totalUpdated += sourceStats.updated;
    stats.totalSkipped += sourceStats.skipped;
    stats.totalErrors += sourceStats.errors;
  }

  // Mark as completed
  stats.completedAt = new Date();
  stats.status = stats.totalErrors > 0 ? 'failed' : 'completed';

  // Log final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`INGESTION COMPLETE`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total found: ${stats.totalFound}`);
  console.log(`Total inserted: ${stats.totalInserted}`);
  console.log(`Total updated: ${stats.totalUpdated}`);
  console.log(`Total errors: ${stats.totalErrors}`);
  console.log(`Duration: ${(stats.completedAt.getTime() - startedAt.getTime()) / 1000}s`);
  console.log(`${'='.repeat(60)}\n`);

  // Log ingestion run to database
  try {
    await supabase.from('ingestion_runs').insert({
      started_at: stats.startedAt.toISOString(),
      completed_at: stats.completedAt.toISOString(),
      status: stats.status,
      total_found: stats.totalFound,
      total_eligible: stats.totalEligible,
      total_inserted: stats.totalInserted,
      total_updated: stats.totalUpdated,
      total_skipped: stats.totalSkipped,
      total_errors: stats.totalErrors,
      source_stats: stats.sources,
    });
  } catch (error) {
    console.error('Error logging ingestion run:', error);
  }

  return stats;
}

// Run ingestion if this file is executed directly
if (require.main === module) {
  runIngestion()
    .then((stats) => {
      process.exit(stats.totalErrors > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Fatal error during ingestion:', error);
      process.exit(1);
    });
}

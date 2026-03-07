# SOMAevents

A modern events aggregation website for Maplewood and South Orange, NJ. Automatically collects and displays community events from local sources.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)

## Overview

SOMAevents aggregates and displays public events happening in Maplewood and South Orange, NJ within the next 30 days. The site will scrape events from multiple local sources and present them in both list and calendar views.

## Features

- **List View**: Chronological event listing with search and filters
- **Calendar View**: Month grid visualization
- **Event Detail Pages**: Complete event information with "Add to Calendar" functionality
- **ICS Feeds**: Subscribe to events in your calendar app
- **Automated Ingestion**: Scrapes sources every 3 days via GitHub Actions
- **Smart Deduplication**: Fuzzy matching eliminates duplicate events across sources

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Scraping**: Cheerio + Playwright (coming soon)
- **Deployment**: Vercel (planned)
- **Automation**: GitHub Actions (planned)

## Event Sources

1. [South Orange Downtown](https://www.southorangedowntown.org/events)
2. [Maplewood Arts & Culture](https://www.maplewoodartsandculture.org/upcoming-events-summary)
3. [Pallet Brewing](https://palletbrewing.com/eventscal/)
4. [SOPAC](https://www.sopacnow.org/events/)

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd somaevents
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and keys
   - Run the migration script (see Database Setup below)

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_NAME=SOMAevents
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Database Setup

Run the SQL migration in your Supabase SQL editor:

```bash
# Copy the contents of supabase/migrations/001_initial_schema.sql
# Paste and run in Supabase Studio > SQL Editor
```

The migration will:
- Create the `events` table
- Enable `pg_trgm` extension for fuzzy matching
- Add indexes for performance
- Set up proper constraints

### Running Ingestion Manually

To scrape and import events:

```bash
npm run ingest
```

This will:
- Fetch events from all 4 sources
- Apply location and date filters
- Deduplicate across sources
- Upsert to database

## Project Structure

```
somaevents/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # List view (landing)
│   ├── calendar/            # Calendar view
│   ├── events/[slug]/       # Event detail pages
│   └── events.ics/          # Global ICS feed
├── components/              # React components
├── lib/                     # Utility functions
│   ├── supabase.ts         # Database client
│   ├── dedupe.ts           # Fuzzy matching
│   ├── normalize.ts        # Text normalization
│   ├── categories.ts       # Category mapping
│   └── ics.ts              # Calendar generation
├── ingest/                  # Scraping logic
│   ├── index.ts            # Main runner
│   ├── registry.ts         # Source registry
│   └── sources/            # Per-source scrapers
│       ├── sodt.ts
│       ├── mac.ts
│       ├── pallet.ts
│       └── sopac.ts
├── data/                    # Static data
│   └── venue_placeholders.json
├── public/placeholders/     # Placeholder images
├── supabase/migrations/     # Database migrations
└── .github/workflows/       # CI/CD
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.example`
   - Deploy!

3. **Set up GitHub Actions**
   - Add Supabase secrets to GitHub repo settings
   - The workflow will run ingestion every 3 days

### Environment Variables (Production)

Add these in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public/anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)
- `NEXT_PUBLIC_SITE_URL` - Your production URL
- `NEXT_PUBLIC_SITE_NAME` - Site name (SOMAevents)

## Development Status

### ✅ Completed (Phases 1-3)

- [x] Project setup with Next.js + TypeScript + Tailwind
- [x] Database schema and migrations
- [x] Supabase integration
- [x] UI components (EventCard, FilterBar, SearchBar, etc.)
- [x] List view with search and filters
- [x] Calendar view
- [x] Event detail pages
- [x] About page
- [x] Responsive mobile-first design
- [x] Header and footer navigation

### 🚧 Coming Soon (Phases 4-10)

- [ ] Scraper architecture (Phase 4)
- [ ] Source scrapers implementation (Phase 5)
- [ ] Deduplication logic (Phase 6)
- [ ] ICS calendar feed generation (Phase 7)
- [ ] GitHub Actions automation (Phase 8)
- [ ] Testing (Phase 9)
- [ ] Production deployment (Phase 10)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run ingest` - Run event ingestion (coming soon)
- `npm run type-check` - TypeScript type checking

## Key Decisions & Assumptions

### Architecture Decisions
- **Extensible source system**: Easy to add new event sources
- **Mixed scraping approach**: Cheerio for simple sites, Playwright for JavaScript-heavy sites
- **Server Components first**: Minimize client-side JavaScript

### Data Assumptions
- Events are only shown for the next 30 days
- Only physical events in Maplewood or South Orange are included
- SOPAC events are always included (even with incomplete addresses)
- Online-only events are excluded

### Image Handling
- Source images used when available
- Curated placeholders for venues and categories
- No runtime web image scraping (family-safe requirement)

## Success Metrics

- **Coverage**: ≥95% of eligible events captured
- **Freshness**: ≤72 hours (ingestion runs every 3 days)
- **Duplicates**: <1% in UI
- **Accuracy**: ≥98% vs source pages
- **Image Safety**: 100% family-friendly

## Future Enhancements (Post-v1)

- User event submissions
- Email newsletter
- Expansion to neighboring towns
- Podcast generation
- Social sharing features

## License

[Add your license here]

## Contributing

[Add contribution guidelines if open source]

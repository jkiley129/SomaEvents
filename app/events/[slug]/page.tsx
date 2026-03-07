import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import TownBadge from '@/components/TownBadge';
import CategoryTags from '@/components/CategoryTags';

export const revalidate = 3600; // Revalidate every hour

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fetch event from Supabase
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !event) {
    notFound();
  }

  const formatEventDateTime = () => {
    const date = new Date(event.start_date);

    if (event.time_clarity === 'unclear' || !event.start_datetime) {
      return (
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="text-sm text-gray-500 italic mt-1">Time not clear</div>
        </div>
      );
    }

    const datetime = new Date(event.start_datetime);
    return (
      <div>
        <div className="text-lg font-semibold text-gray-900">
          {format(datetime, 'EEEE, MMMM d, yyyy')}
        </div>
        <div className="text-lg text-gray-700 mt-1">{format(datetime, 'h:mm a')}</div>
        {event.end_datetime && (
          <div className="text-sm text-gray-500 mt-1">
            Ends: {format(new Date(event.end_datetime), 'h:mm a')}
          </div>
        )}
      </div>
    );
  };

  const generateGoogleCalendarUrl = () => {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: `${event.description_text || ''}\n\nSource: ${event.source_url}`,
      location: event.venue_address || event.venue_name || '',
    });

    if (event.start_datetime) {
      const start = new Date(event.start_datetime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      params.append('dates', `${start}/${start}`);
    }

    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Event Image */}
          {event.image_url && (
            <div className="relative w-full h-96">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Event Content */}
          <div className="p-8 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
              <div className="flex items-center gap-3">
                <TownBadge town={event.town} />
                {event.categories.length > 0 && <CategoryTags categories={event.categories} />}
              </div>
            </div>

            {/* Date & Time */}
            <div className="border-t pt-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Date & Time
              </h2>
              {formatEventDateTime()}
            </div>

            {/* Venue */}
            {(event.venue_name || event.venue_address) && (
              <div className="border-t pt-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Location
                </h2>
                {event.venue_name && (
                  <div className="text-lg font-semibold text-gray-900">
                    {event.venue_name}
                    {event.venue_short && event.venue_short !== event.venue_name && (
                      <span className="text-gray-600 font-normal"> ({event.venue_short})</span>
                    )}
                  </div>
                )}
                {event.venue_address && (
                  <div className="text-gray-700 mt-1">
                    {event.venue_address}
                    {event.venue_city && `, ${event.venue_city}`}
                    {event.venue_state && `, ${event.venue_state}`}
                    {event.venue_zip && ` ${event.venue_zip}`}
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            {event.price_text && (
              <div className="border-t pt-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Price
                </h2>
                <div className="text-lg text-gray-900">{event.price_text}</div>
              </div>
            )}

            {/* Description */}
            {event.description_html && (
              <div className="border-t pt-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  About
                </h2>
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: event.description_html }}
                />
              </div>
            )}

            {/* Recurring Note */}
            {event.is_recurring && event.recurring_note && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <div className="text-sm text-blue-900">{event.recurring_note}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t pt-6 flex flex-wrap gap-4">
              {event.ticket_url && (
                <a
                  href={event.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Get Tickets
                </a>
              )}
              <a
                href={event.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                View on Source
              </a>
            </div>

            {/* Add to Calendar */}
            <div className="border-t pt-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Add to Calendar
              </h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`/events/${event.slug}/event.ics`}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download ICS
                </a>
                <a
                  href={generateGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Google Calendar
                </a>
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t pt-6">
              <div className="text-xs text-gray-500 space-y-1">
                <div>Last updated: {format(new Date(event.updated_at), 'MMM d, yyyy h:mm a')}</div>
                <div>Last seen in source: {format(new Date(event.last_seen_in_source_at), 'MMM d, yyyy h:mm a')}</div>
                <div>Source: {event.source_name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center text-primary hover:text-primary-dark font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </a>
        </div>
      </div>
    </div>
  );
}

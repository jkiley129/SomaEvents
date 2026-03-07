import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Event } from '@/lib/supabase';
import TownBadge from './TownBadge';
import CategoryTags from './CategoryTags';

type EventCardProps = {
  event: Event;
};

export default function EventCard({ event }: EventCardProps) {
  const formatEventDate = () => {
    const date = new Date(event.start_date);

    if (event.time_clarity === 'unclear' || !event.start_datetime) {
      return (
        <>
          <div className="text-sm text-gray-600">{format(date, 'EEEE, MMMM d, yyyy')}</div>
          <div className="text-xs text-gray-500 italic">Time not clear</div>
        </>
      );
    }

    const datetime = new Date(event.start_datetime);
    return (
      <>
        <div className="text-sm text-gray-600">{format(datetime, 'EEEE, MMMM d, yyyy')}</div>
        <div className="text-sm font-medium text-gray-900">{format(datetime, 'h:mm a')}</div>
      </>
    );
  };

  const truncateDescription = (text: string | null, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <Link href={`/events/${event.slug}`} className="block">
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden h-full">
        {/* Image */}
        <div className="relative w-full h-48 bg-gray-200">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {event.title}
          </h3>

          {/* Date & Time */}
          <div>
            {formatEventDate()}
          </div>

          {/* Venue & Town */}
          <div className="flex items-center gap-2">
            {event.venue_short && (
              <span className="text-sm text-gray-700 font-medium">{event.venue_short}</span>
            )}
            <TownBadge town={event.town} />
          </div>

          {/* Categories */}
          {event.categories.length > 0 && (
            <CategoryTags categories={event.categories} limit={3} />
          )}

          {/* Description */}
          {event.description_text && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {truncateDescription(event.description_text)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

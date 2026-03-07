'use client';

import Link from 'next/link';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import type { Event } from '@/lib/supabase';

type CalendarGridProps = {
  events: Event[];
  currentMonth: Date;
};

export default function CalendarGrid({ events, currentMonth }: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event =>
      isSameDay(new Date(event.start_date), day)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Calendar Header - Day Names */}
      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-sm font-semibold text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, dayIdx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toString()}
              className={`min-h-[120px] border-b border-r ${
                dayIdx % 7 === 0 ? 'border-l' : ''
              } p-2 ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}`}
            >
              {/* Day Number */}
              <div className={`text-sm font-medium mb-1 ${
                isToday
                  ? 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white'
                  : isCurrentMonth
                  ? 'text-gray-900'
                  : 'text-gray-400'
              }`}>
                {format(day, 'd')}
              </div>

              {/* Events for this day */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="block text-xs p-1 rounded hover:bg-primary/10 transition-colors"
                  >
                    <div className="font-medium text-gray-900 truncate">
                      {event.start_datetime
                        ? format(new Date(event.start_datetime), 'h:mm a')
                        : 'Time unclear'
                      }
                    </div>
                    <div className="text-gray-600 truncate">{event.title}</div>
                  </Link>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

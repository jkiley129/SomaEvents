'use client';

import { useState, useMemo } from 'react';
import type { Event } from '@/lib/supabase';
import EventCard from './EventCard';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import { isToday, isThisWeek, isWithinInterval, addDays, startOfDay, endOfDay } from 'date-fns';

type EventListProps = {
  events: Event[];
};

export default function EventList({ events }: EventListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTown, setSelectedTown] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('30days');

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(query) ||
          event.description_text?.toLowerCase().includes(query) ||
          event.venue_name?.toLowerCase().includes(query) ||
          event.venue_short?.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'All') {
        if (!event.categories.includes(selectedCategory)) return false;
      }

      // Town filter
      if (selectedTown !== 'all') {
        if (event.town !== selectedTown) return false;
      }

      // Date filter
      const eventDate = new Date(event.start_date);
      const now = new Date();

      switch (selectedDateFilter) {
        case 'today':
          if (!isToday(eventDate)) return false;
          break;
        case 'weekend':
          // Check if event is this Saturday or Sunday
          const thisSaturday = new Date(now);
          thisSaturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
          const thisSunday = new Date(thisSaturday);
          thisSunday.setDate(thisSaturday.getDate() + 1);

          if (!isWithinInterval(eventDate, {
            start: startOfDay(thisSaturday),
            end: endOfDay(thisSunday)
          })) return false;
          break;
        case '7days':
          if (!isWithinInterval(eventDate, {
            start: startOfDay(now),
            end: endOfDay(addDays(now, 7))
          })) return false;
          break;
        case '30days':
          // All events are within 30 days by default
          break;
      }

      return true;
    });
  }, [events, searchQuery, selectedCategory, selectedTown, selectedDateFilter]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by title, venue, or description..."
      />

      {/* Filters */}
      <FilterBar
        selectedCategory={selectedCategory}
        selectedTown={selectedTown}
        selectedDateFilter={selectedDateFilter}
        onCategoryChange={setSelectedCategory}
        onTownChange={setSelectedTown}
        onDateFilterChange={setSelectedDateFilter}
      />

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
}

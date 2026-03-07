import { supabase } from '@/lib/supabase';
import CalendarGrid from '@/components/CalendarGrid';
import { format } from 'date-fns';

export const revalidate = 3600; // Revalidate every hour

export default async function CalendarPage() {
  const currentMonth = new Date();

  // Fetch events from Supabase
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'active')
    .gte('start_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Calendar View</h1>
          <p className="text-red-600">Error loading events. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {format(currentMonth, 'MMMM yyyy')}
          </h1>
          <p className="text-gray-600">
            Click on any event to see more details
          </p>
        </div>

        {/* Calendar */}
        <CalendarGrid events={events || []} currentMonth={currentMonth} />
      </div>
    </div>
  );
}

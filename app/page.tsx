import { supabase } from '@/lib/supabase';
import EventList from '@/components/EventList';

export const dynamic = 'force-dynamic'; // Force dynamic rendering
export const revalidate = 0; // Disable caching for debugging

export default async function Home() {
  const today = new Date().toISOString().split('T')[0];

  // Fetch events from Supabase
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'active')
    .gte('start_date', today)
    .order('start_date', { ascending: true });

  // Debug logging
  console.log('=== HOME PAGE DEBUG ===');
  console.log('Today:', today);
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Error:', error);
  console.log('Events count:', events?.length || 0);
  console.log('Events:', events?.map(e => ({ title: e.title, date: e.start_date })));

  if (error) {
    console.error('Error fetching events:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Events in Maplewood & South Orange</h1>
          <p className="text-red-600">Error loading events. Please try again later.</p>
          <pre className="mt-4 text-left bg-gray-100 p-4 rounded">{JSON.stringify(error, null, 2)}</pre>
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
            Events in Maplewood & South Orange
          </h1>
          <p className="text-gray-600">
            Discover what's happening in your community over the next 30 days
          </p>
        </div>

        {/* Event List with Filters */}
        <EventList events={events || []} />
      </div>
    </div>
  );
}

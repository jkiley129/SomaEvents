export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">About SOMAevents</h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-700">
              SOMAevents is your go-to resource for discovering what's happening in Maplewood
              and South Orange, New Jersey.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What We Do</h2>
            <p className="text-gray-700">
              We automatically aggregate events from trusted local sources, making it easy
              for you to find concerts, theater performances, community gatherings, family
              activities, and more—all in one place.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Sources</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>South Orange Downtown</li>
              <li>Maplewood Arts & Culture</li>
              <li>Pallet Brewing Company</li>
              <li>SOPAC (South Orange Performing Arts Center)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How It Works</h2>
            <p className="text-gray-700">
              We check these sources every 3 days to keep our event listings fresh and
              up-to-date. All events are automatically filtered to show only those happening
              within the next 30 days in Maplewood and South Orange.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Subscribe</h2>
            <p className="text-gray-700">
              Want to get these events in your own calendar? Subscribe to our{' '}
              <a href="/events.ics" className="text-primary hover:text-primary-dark font-medium">
                calendar feed
              </a>
              {' '}and automatically receive updates as new events are added.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact</h2>
            <p className="text-gray-700">
              This is a community service project. If you have suggestions or notice any
              issues, please let us know.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

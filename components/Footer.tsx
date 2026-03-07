export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} SOMAevents. Events in Maplewood & South Orange, NJ.
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="/events.ics"
              className="text-primary hover:text-primary-dark transition-colors"
            >
              Subscribe (ICS)
            </a>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">Updated every 3 days</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

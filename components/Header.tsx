import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">SOMAevents</h1>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              List
            </Link>
            <Link
              href="/calendar"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Calendar
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

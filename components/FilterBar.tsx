'use client';

const CATEGORIES = [
  'All',
  'Music',
  'Theater',
  'Comedy',
  'Arts',
  'Film',
  'Kids',
  'Food & Drink',
  'Community',
  'Education',
  'Festival',
  'Sports',
  'Other',
];

const DATE_FILTERS = [
  { label: 'Today', value: 'today' },
  { label: 'This Weekend', value: 'weekend' },
  { label: 'Next 7 Days', value: '7days' },
  { label: 'Next 30 Days', value: '30days' },
];

type FilterBarProps = {
  selectedCategory: string;
  selectedTown: string;
  selectedDateFilter: string;
  onCategoryChange: (category: string) => void;
  onTownChange: (town: string) => void;
  onDateFilterChange: (filter: string) => void;
};

export default function FilterBar({
  selectedCategory,
  selectedTown,
  selectedDateFilter,
  onCategoryChange,
  onTownChange,
  onDateFilterChange,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Date Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {DATE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onDateFilterChange(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedDateFilter === filter.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Town Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Town:</span>
        <select
          value={selectedTown}
          onChange={(e) => onTownChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="Maplewood">Maplewood</option>
          <option value="South Orange">South Orange</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

type CategoryTagsProps = {
  categories: string[];
  limit?: number;
};

export default function CategoryTags({ categories, limit }: CategoryTagsProps) {
  const displayCategories = limit ? categories.slice(0, limit) : categories;
  const remaining = limit && categories.length > limit ? categories.length - limit : 0;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayCategories.map((category) => (
        <span
          key={category}
          className="inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium"
        >
          {category}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium">
          +{remaining}
        </span>
      )}
    </div>
  );
}

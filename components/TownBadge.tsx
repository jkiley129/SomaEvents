type TownBadgeProps = {
  town: 'Maplewood' | 'South Orange' | null;
};

export default function TownBadge({ town }: TownBadgeProps) {
  if (!town) return null;

  const colors = {
    'Maplewood': 'bg-emerald-100 text-emerald-800',
    'South Orange': 'bg-orange-100 text-orange-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colors[town]}`}>
      {town}
    </span>
  );
}

import { CalendarDays } from 'lucide-react';
import { useSchoolYear } from '../../contexts/SchoolYearContext';

interface SchoolYearSelectProps {
  showLabel?: boolean;
}

/** Drop-down to pick the school year shown across the app. */
export function SchoolYearSelect({ showLabel = true }: SchoolYearSelectProps) {
  const { years, selectedYear, isCurrentYear, selectYear } = useSchoolYear();

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <CalendarDays className="hidden h-4 w-4 text-slate-400 sm:block" />
      <span className={showLabel ? 'sr-only sm:not-sr-only' : 'sr-only'}>Année scolaire</span>
      <select
        value={selectedYear?.id ?? ''}
        onChange={(e) => selectYear(e.target.value)}
        className={`rounded-lg border py-1.5 pl-2 pr-8 text-sm font-medium focus:border-brand-500 focus:ring-brand-500 ${
          isCurrentYear ? 'border-slate-300 text-slate-900' : 'border-amber-300 bg-amber-50 text-amber-900'
        }`}
      >
        {years.map((year) => (
          <option key={year.id} value={year.id}>
            {year.label}{year.is_current ? ' (en cours)' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}

import { useQuery } from '@tanstack/react-query';
import { fetchFilters } from '../api/apiClient';
import { Filter } from 'lucide-react';

interface GlobalFilterBarProps {
  selectedMonth: string;
  setSelectedMonth: (v: string) => void;
  selectedSupplier: string;
  setSelectedSupplier: (v: string) => void;
  selectedCountry: string;
  setSelectedCountry: (v: string) => void;
}

export function GlobalFilterBar({ selectedMonth, setSelectedMonth, selectedSupplier, setSelectedSupplier, selectedCountry, setSelectedCountry }: GlobalFilterBarProps) {
  const { data: months } = useQuery({ queryKey: ['filters', 'months'], queryFn: () => fetchFilters('months') });
  const { data: suppliers } = useQuery({ queryKey: ['filters', 'suppliers'], queryFn: () => fetchFilters('suppliers') });
  const { data: locations } = useQuery({ queryKey: ['filters', 'locations'], queryFn: () => fetchFilters('locations') });

  return (
    <div className="glass-card p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--glow-accent-2)', border: '1px solid var(--border)' }}>
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--accent-2)' }} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Filters</span>
      </div>

      <div className="flex flex-1 flex-col md:flex-row gap-3 w-full">
        {[
          { value: selectedMonth, onChange: setSelectedMonth, options: months, placeholder: 'All Months' },
          { value: selectedSupplier, onChange: setSelectedSupplier, options: suppliers, placeholder: 'All Suppliers' },
          { value: selectedCountry, onChange: setSelectedCountry, options: locations, placeholder: 'All Countries' },
        ].map((sel, i) => (
          <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)} className="themed-input flex-1 appearance-none">
            <option value="">{sel.placeholder}</option>
            {(sel.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSupplierRanking } from '../api/apiClient';
import { cn } from '../components/Layout';
import { formatCurrency } from '../utils/currency';
import { Users, DollarSign, Activity, TrendingUp, TrendingDown } from 'lucide-react';

export function Suppliers() {
  const { data: ranking, isLoading } = useQuery({
    queryKey: ['supplierRanking'],
    queryFn: fetchSupplierRanking
  });

  const kpis = useMemo(() => {
    if (!ranking || ranking.length === 0) return { totalSuppliers: 0, totalSpend: 0, avgFillRate: 0 };
    const totalSpend = ranking.reduce((acc, curr) => acc + curr.totalSpend, 0);
    const avgFillRate = ranking.reduce((acc, curr) => acc + curr.fillRate, 0) / ranking.length;
    return { totalSuppliers: ranking.length, totalSpend, avgFillRate };
  }, [ranking]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Suppliers', value: kpis.totalSuppliers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'Total Spend', value: formatCurrency(kpis.totalSpend), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Avg Fill Rate', value: `${kpis.avgFillRate.toFixed(1)}%`, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        ].map(kpi => (
          <div key={kpi.label} className="glass-card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.bg} border ${kpi.border}`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
              <p className="text-2xl font-bold metric-number mt-0.5" style={{ color: 'var(--text-primary)' }}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ranking Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Supplier Intelligence Ranking</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Ranked by total procurement spend</p>
        </div>
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>Supplier</th>
                <th>Location</th>
                <th style={{ textAlign: 'right' }}>Total Spend</th>
                <th style={{ textAlign: 'right' }}>Fill Rate</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {(ranking || []).map((supplier) => {
                const isExcellent = supplier.fillRate >= 90;
                const isWarning = supplier.fillRate < 90 && supplier.fillRate >= 70;
                const isCritical = supplier.fillRate < 70;
                const fillPct = Math.min(100, supplier.fillRate);
                const barColor = isExcellent ? '#34d399' : isWarning ? '#fbbf24' : '#f87171';

                return (
                  <tr key={supplier.supplierName}>
                    <td>
                      <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg text-xs font-bold"
                        style={{
                          background: supplier.ranking <= 3 ? 'var(--glow-accent)' : 'var(--bg-surface-2)',
                          color: supplier.ranking <= 3 ? 'var(--accent)' : 'var(--text-muted)',
                          border: '1px solid var(--border)'
                        }}>
                        {supplier.ranking}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{supplier.supplierName}</span>
                    </td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        {supplier.city}, {supplier.country}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="font-semibold metric-number" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(supplier.totalSpend)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                        isExcellent && 'bg-emerald-500/10 text-emerald-400',
                        isWarning && 'bg-amber-500/10 text-amber-400',
                        isCritical && 'bg-red-500/10 text-red-400'
                      )}>
                        {isExcellent ? <TrendingUp className="w-3 h-3" /> : isCritical ? <TrendingDown className="w-3 h-3" /> : null}
                        {supplier.fillRate.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <div className="w-24">
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-3)' }}>
                          <div className="h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${fillPct}%`, background: barColor }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

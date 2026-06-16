import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTopProducts, fetchSpendByCategory, fetchKpiSummary } from '../api/apiClient';
import { GlobalFilterBar } from '../components/GlobalFilterBar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency, formatCurrencyAxis } from '../utils/currency';
import { Package, DollarSign, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DARK_COLORS  = ['#2dd4bf', '#818cf8', '#fb923c', '#fbbf24', '#f87171', '#34d399'];
const LIGHT_COLORS = ['#0d9488', '#4f46e5', '#ea580c', '#d97706', '#ef4444', '#10b981'];

export function Products() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const { theme } = useTheme();

  const COLORS = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  const { data: kpiSummary, isLoading: kpiLoading } = useQuery({
    queryKey: ['kpiSummary', selectedMonth, selectedSupplier, selectedCountry],
    queryFn: fetchKpiSummary
  });
  const { data: topProducts, isLoading: topLoading } = useQuery({
    queryKey: ['topProducts', 10, selectedMonth, selectedSupplier, selectedCountry],
    queryFn: () => fetchTopProducts(10, selectedMonth, selectedSupplier, selectedCountry)
  });
  const { data: spendByCategory, isLoading: categoryLoading } = useQuery({
    queryKey: ['spendByCategory', selectedMonth, selectedSupplier, selectedCountry],
    queryFn: () => fetchSpendByCategory(selectedMonth, selectedSupplier, selectedCountry)
  });

  const filteredSpendByCategory = useMemo(() => {
    if (!spendByCategory) return [];
    return spendByCategory.filter(item => item.label.toLowerCase() !== 'unknown');
  }, [spendByCategory]);

  const dynamicKpis = useMemo(() => {
    return {
      totalSpend: filteredSpendByCategory.reduce((sum, item) => sum + item.value, 0),
      totalCategories: filteredSpendByCategory.length,
    };
  }, [filteredSpendByCategory]);

  const gridColor = 'var(--chart-grid)';
  const axisColor = 'var(--chart-axis)';
  const tooltipStyle = { backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', borderRadius: '0.75rem', color: 'var(--text-primary)' };

  return (
    <div className="space-y-5">
      <GlobalFilterBar
        selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
        selectedSupplier={selectedSupplier} setSelectedSupplier={setSelectedSupplier}
        selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Categories', value: categoryLoading ? '—' : dynamicKpis.totalCategories, icon: Package, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
          { label: 'Filtered Spend', value: categoryLoading ? '—' : formatCurrency(dynamicKpis.totalSpend), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: 'Global Fill Rate', value: kpiLoading || !kpiSummary ? '—' : `${(kpiSummary.fillRate * 100).toFixed(1)}%`, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
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

      {(topLoading || categoryLoading) && (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          Loading product data...
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 h-[480px] flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Spend by Category</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Distribution across procurement categories</p>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={filteredSpendByCategory} cx="50%" cy="50%" innerRadius={75} outerRadius={115}
                  paddingAngle={3} dataKey="value" nameKey="label"
                  label={({ cx, cy, midAngle, outerRadius, percent }: any) => {
                    const RADIAN = Math.PI / 180;
                    const cX = cx || 0;
                    const cY = cy || 0;
                    const mAngle = midAngle || 0;
                    const oRadius = outerRadius || 0;
                    
                    const radius = oRadius + 22;
                    const x = cX + radius * Math.cos(-mAngle * RADIAN);
                    const y = cY + radius * Math.sin(-mAngle * RADIAN);
                    const lx1 = cX + (oRadius + 4) * Math.cos(-mAngle * RADIAN);
                    const ly1 = cY + (oRadius + 4) * Math.sin(-mAngle * RADIAN);
                    const lx2 = cX + (oRadius + 18) * Math.cos(-mAngle * RADIAN);
                    const ly2 = cY + (oRadius + 18) * Math.sin(-mAngle * RADIAN);

                    if (percent === undefined || percent < 0.02) return null;
                    return (
                      <g>
                        <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="var(--text-muted)" strokeWidth={1} />
                        <text
                          x={x}
                          y={y}
                          fill="var(--text-primary)"
                          textAnchor={x > cX ? 'start' : 'end'}
                          dominantBaseline="central"
                          className="text-xs font-semibold"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      </g>
                    );
                  }}
                  labelLine={false}>
                  {filteredSpendByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Spend']} contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
            {filteredSpendByCategory.map((entry, index) => (
              <div key={entry.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[index % COLORS.length] }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{entry.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5 h-[480px] flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Top 10 Products by Spend</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Click a bar to inspect product details</p>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts || []} layout="horizontal" margin={{ top: 10, right: 10, left: 10, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis type="category" dataKey="label" stroke={axisColor} tick={{ fontSize: 9, fill: 'var(--text-secondary)' }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis type="number" stroke={axisColor} tickFormatter={formatCurrencyAxis} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Spend']} contentStyle={tooltipStyle} cursor={{ fill: 'var(--glow-accent)' }} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                  {(topProducts || []).map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

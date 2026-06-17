import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSpendByTime } from '../api/apiClient';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, ComposedChart, Line } from 'recharts';
import { ChevronRight, Calendar } from 'lucide-react';
import { formatCurrency, formatCurrencyAxis } from '../utils/currency';
import { useTheme } from '../context/ThemeContext';

export function TimeIntelligence() {
  const { theme } = useTheme();
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [currentQuarter, setCurrentQuarter] = useState<number | null>(null);

  const DARK_COLORS  = ['#2dd4bf', '#818cf8', '#fb923c', '#fbbf24', '#f87171', '#34d399'];
  const LIGHT_COLORS = ['#0d9488', '#4f46e5', '#ea580c', '#d97706', '#ef4444', '#10b981'];
  const COLORS = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  const { data: spendData, isLoading } = useQuery({
    queryKey: ['spendByTime', currentYear, currentQuarter],
    queryFn: () => fetchSpendByTime(currentYear || undefined, currentQuarter || undefined)
  });

  const handleChartClick = (data: any) => {
    if (!data) return;
    let label = data.activeLabel;
    if (!label && data.activePayload?.length > 0) label = data.activePayload[0].payload.label;
    if (!label && data.payload?.label) label = data.payload.label;
    if (!label && data.label) label = data.label;
    if (!label) return;
    label = label.toString();
    if (currentYear === null) {
      setCurrentYear(parseInt(label, 10));
    } else if (currentQuarter === null) {
      const qNum = parseInt(label.replace('Q', ''), 10);
      if (!isNaN(qNum)) setCurrentQuarter(qNum);
    }
  };

  const resetToYear = () => { setCurrentYear(null); setCurrentQuarter(null); };
  const resetToQuarter = () => setCurrentQuarter(null);

  const getTitle = () => currentYear === null ? 'Year-over-Year Spend' : currentQuarter === null ? 'Quarter-over-Quarter Spend' : 'Day-over-Day Spend';
  const getSubTitle = () => currentYear === null ? 'Annual Breakdown' : currentQuarter === null ? 'Quarterly Breakdown' : 'Daily Breakdown';

  const tooltipStyle = { backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', borderRadius: '0.75rem', color: 'var(--text-primary)' };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar w-auto">
        <button type="button" onClick={resetToYear} className="flex items-center gap-1.5 transition-colors"
          style={{ color: currentYear === null ? 'var(--accent)' : 'var(--text-secondary)' }}>
          <Calendar className="w-3.5 h-3.5" />
          All Years
        </button>
        {currentYear && (
          <>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <button type="button" onClick={resetToQuarter} className="transition-colors"
              style={{ color: currentQuarter === null ? 'var(--accent)' : 'var(--text-secondary)' }}>
              {currentYear}
            </button>
          </>
        )}
        {currentQuarter && (
          <>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--accent)' }}>Q{currentQuarter}</span>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm p-4" style={{ color: 'var(--text-muted)' }}>
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          Loading time intelligence...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Area/Line Chart */}
          <div className="glass-card p-5 h-[440px] flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{getTitle()}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Click a data point to drill down</p>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={spendData || []} onClick={handleChartClick} style={{ cursor: currentQuarter !== null ? 'default' : 'pointer' }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--chart-axis)" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis stroke="var(--chart-axis)" tickFormatter={formatCurrencyAxis} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <Tooltip formatter={(value, name) => [formatCurrency(value as number), name === 'secondaryValue' ? '3-Mo Rolling Avg' : 'Spend']} contentStyle={tooltipStyle} cursor={{ stroke: 'var(--border-accent)' }} />
                  <Area type="monotone" dataKey="value" name="value" stroke="var(--accent)" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 5, fill: 'var(--accent)' }} />
                  <Line type="monotone" dataKey="secondaryValue" name="secondaryValue" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="glass-card p-5 h-[440px] flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{getSubTitle()}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Click a bar to drill down further</p>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendData || []} onClick={handleChartClick} style={{ cursor: currentQuarter !== null ? 'default' : 'pointer' }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--chart-axis)" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis stroke="var(--chart-axis)" tickFormatter={formatCurrencyAxis} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Spend']} contentStyle={tooltipStyle} cursor={{ fill: 'var(--glow-accent)' }} />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                    {(spendData || []).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

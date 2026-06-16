import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLocationsSpend } from '../api/apiClient';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency, formatCurrencyAxis } from '../utils/currency';
import { MapPin, ChevronRight, Map, BarChart2 } from 'lucide-react';
import { LocationsMap } from '../components/LocationsMap';
import { useTheme } from '../context/ThemeContext';

interface DrillPathItem {
  label: string;
  uniqueName: string;
}

export function Locations() {
  const { theme } = useTheme();
  const [drillPath, setDrillPath] = useState<DrillPathItem[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'chart'>('map');

  const DARK_COLORS  = ['#2dd4bf', '#818cf8', '#fb923c', '#fbbf24', '#f87171', '#34d399'];
  const LIGHT_COLORS = ['#0d9488', '#4f46e5', '#ea580c', '#d97706', '#ef4444', '#10b981'];
  const COLORS = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  const currentParentMember = drillPath.length > 0 ? drillPath[drillPath.length - 1].uniqueName : undefined;

  const { data: locations, isLoading } = useQuery({
    queryKey: ['locationsSpend', currentParentMember],
    queryFn: () => fetchLocationsSpend(currentParentMember)
  });

  const handleChartClick = (data: any) => {
    if (!data) return;
    let label = data.activeLabel;
    let uniqueName = undefined;
    if (data.activePayload?.length > 0) {
      label = data.activePayload[0].payload.label || label;
      uniqueName = data.activePayload[0].payload.uniqueName;
    }
    if (!uniqueName && data.payload?.uniqueName) { uniqueName = data.payload.uniqueName; label = data.payload.label || label; }
    if (!uniqueName && data.uniqueName)           { uniqueName = data.uniqueName; label = data.label || label; }
    if (uniqueName && label) setDrillPath(prev => [...prev, { label: label.toString(), uniqueName }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) setDrillPath([]);
    else setDrillPath(prev => prev.slice(0, index + 1));
  };

  const tooltipStyle = { backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', borderRadius: '0.75rem', color: 'var(--text-primary)' };

  if (isLoading && drillPath.length === 0) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Breadcrumb */}
      <div className="breadcrumb-bar w-auto">
        <button type="button" onClick={() => handleBreadcrumbClick(-1)}
          className="flex items-center gap-1.5 transition-colors"
          style={{ color: drillPath.length === 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
          <MapPin className="w-3.5 h-3.5" />
          All Locations
        </button>
        {drillPath.map((item, index) => (
          <React.Fragment key={item.uniqueName}>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <button type="button" onClick={() => handleBreadcrumbClick(index)}
              className="transition-colors"
              style={{ color: index === drillPath.length - 1 ? 'var(--accent)' : 'var(--text-secondary)' }}>
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Main panel */}
        <div className="lg:col-span-2 glass-card p-5 h-[580px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {drillPath.length === 0 ? 'Spend by Location' : `Breakdown: ${drillPath[drillPath.length - 1].label}`}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {viewMode === 'map' ? 'Click a bubble to drill down' : 'Click a bar to drill down'}
              </p>
            </div>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
              {[{ mode: 'map' as const, Icon: Map, label: 'Map' }, { mode: 'chart' as const, Icon: BarChart2, label: 'Chart' }].map(({ mode, Icon, label }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  title={`${label} view`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background: viewMode === mode ? 'var(--glow-accent)' : 'transparent',
                    color: viewMode === mode ? 'var(--accent)' : 'var(--text-muted)',
                  }}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 relative min-h-0">
            {viewMode === 'map' ? (
              <LocationsMap locations={(locations || []).map(l => ({ ...l, uniqueName: l.uniqueName || l.label }))} onLocationClick={handleChartClick} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locations || []} layout="vertical" margin={{ left: 50 }} onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                  <XAxis type="number" stroke="var(--chart-axis)" tickFormatter={formatCurrencyAxis} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis type="category" dataKey="label" stroke="var(--chart-axis)" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Spend']} contentStyle={tooltipStyle} cursor={{ fill: 'var(--glow-accent)' }} />
                  <Bar dataKey="value" radius={[0, 5, 5, 0]} className="cursor-pointer" onClick={(data) => handleChartClick(data)}>
                    {(locations || []).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Directory */}
        <div className="glass-card p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Location Directory</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{(locations || []).length} locations</p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {(locations || []).map((loc) => (
              <button key={loc.uniqueName || loc.label}
                onClick={() => handleChartClick({ uniqueName: loc.uniqueName, label: loc.label })}
                className="w-full text-left p-3 rounded-xl transition-all group"
                style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--glow-accent)', border: '1px solid var(--border-accent)' }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{loc.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>{formatCurrency(loc.value)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

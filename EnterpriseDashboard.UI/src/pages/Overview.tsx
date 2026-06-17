import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchKpiSummary, fetchTopProducts, fetchSupplierRanking, fetchLocationsSpend, fetchDeliveryKpis, fetchSpendByTime } from '../api/apiClient';
import { AreaChart, Area, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/currency';
import { DollarSign, ShoppingCart, Activity, TrendingUp, Package, Truck, Globe, Award, Zap, ArrowUpRight } from 'lucide-react';

const StatCard = ({
  label, value, icon: Icon, iconColor, iconBg, badge, badgeIcon: BadgeIcon, badgeColor, footer
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  badge?: string;
  badgeIcon?: React.ElementType;
  badgeColor?: string;
  footer?: React.ReactNode;
}) => (
  <div className="glass-card p-6 flex flex-col justify-between gap-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <div className="text-3xl font-bold metric-number" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{value}</div>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
    {badge && BadgeIcon && (
      <div className="flex items-center gap-2">
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
          <BadgeIcon className="w-3 h-3" />{badge}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>vs last year</span>
      </div>
    )}
    {footer && <div>{footer}</div>}
  </div>
);

const TopCard = ({
  rank, label, value, icon: Icon, iconColor, iconBg, valueColor
}: {
  rank: string; label: string; value: React.ReactNode;
  icon: React.ElementType; iconColor: string; iconBg: string; valueColor: string;
}) => (
  <div className="glass-card p-5 group flex flex-col justify-between h-[172px]">
    <div className="flex items-center justify-between">
      <div className={`flex items-center gap-2 ${iconBg} px-2.5 py-1 rounded-full border`} style={{ borderColor: 'var(--border)' }}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{rank}</span>
      </div>
      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
    </div>
    <div>
      <p className="text-sm font-semibold line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>{label}</p>
      <p className={`text-xl font-bold metric-number mt-2 ${valueColor}`}>{value}</p>
    </div>
  </div>
);

export function Overview() {
  const { data: summary, isLoading: isSummaryLoading } = useQuery({ queryKey: ['kpiSummary'], queryFn: fetchKpiSummary });
  const { data: topProducts } = useQuery({ queryKey: ['topProductsOverview'], queryFn: () => fetchTopProducts(1) });
  const { data: supplierRanking } = useQuery({ queryKey: ['supplierRankingOverview'], queryFn: fetchSupplierRanking });
  const { data: locations } = useQuery({ queryKey: ['locationsOverview'], queryFn: () => fetchLocationsSpend() });
  const { data: deliveryKpis } = useQuery({ queryKey: ['deliveryKpisOverview'], queryFn: fetchDeliveryKpis });
  const { data: spendByTime } = useQuery({ queryKey: ['spendByTimeOverview'], queryFn: () => fetchSpendByTime(2025) });

  if (isSummaryLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Connecting to data cube...</p>
        </div>
      </div>
    );
  }

  const topProduct = topProducts?.[0];
  const topSupplier = supplierRanking?.[0];
  const topLocation = locations ? [...locations].sort((a, b) => b.value - a.value)[0] : null;

  const onTimePct = Math.round(deliveryKpis?.onTimePercentage || 0);
  const radialData = [{ name: 'On Time', value: onTimePct, fill: 'var(--accent)' }];

  const fillRatePct = (summary?.fillRate || 0) * 100;
  const spendGrowthNum = Number(summary?.spendGrowth || 0);
  const growthLabel = spendGrowthNum === 0 ? '0.0%' : `${spendGrowthNum > 0 ? '+' : ''}${(spendGrowthNum * 100).toFixed(1)}%`;
  const moMGrowthNum = Number(summary?.moMSpendGrowth || 0);

  return (
    <div className="space-y-6 pb-6">

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Spend"
          value={formatCurrency(summary?.totalSpend)}
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
          badge={growthLabel}
          badgeIcon={TrendingUp}
          badgeColor="bg-emerald-400/10 text-emerald-400"
          footer={
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>MoM Growth</span>
              <span className={`text-xs font-bold ${moMGrowthNum >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {moMGrowthNum > 0 ? '+' : ''}{(moMGrowthNum * 100).toFixed(1)}%
              </span>
            </div>
          }
        />
        <StatCard
          label="Total Orders"
          value={(summary?.totalOrders || 0).toLocaleString()}
          icon={ShoppingCart}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
          footer={
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Avg value: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(summary?.avgOrderValue)}</span>
            </p>
          }
        />
        <StatCard
          label="Global Fill Rate"
          value={`${fillRatePct.toFixed(1)}%`}
          icon={Activity}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
          footer={
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--bg-surface-3)' }}>
              <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-700"
                style={{ width: `${fillRatePct}%` }} />
            </div>
          }
        />
        <StatCard
          label="YTD Spend"
          value={formatCurrency(summary?.ytdSpend)}
          icon={Zap}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
          footer={
            <div className="h-10 -mx-2 opacity-60">
              {spendByTime && spendByTime.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendByTime}>
                    <defs>
                      <linearGradient id="ytdGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={1.5} fill="url(#ytdGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          }
        />
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top Contributors */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Top Contributors</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TopCard
              rank="#1 Product" label={topProduct?.label || '—'}
              value={formatCurrency(topProduct?.value)}
              icon={Package} iconColor="text-indigo-400" iconBg="bg-indigo-500/10" valueColor="text-indigo-400"
            />
            <TopCard
              rank="#1 Supplier" label={topSupplier?.supplierName || '—'}
              value={formatCurrency(topSupplier?.totalSpend)}
              icon={Award} iconColor="text-rose-400" iconBg="bg-rose-500/10" valueColor="text-rose-400"
            />
            <TopCard
              rank="#1 Location" label={topLocation?.label || '—'}
              value={formatCurrency(topLocation?.value)}
              icon={Globe} iconColor="text-teal-400" iconBg="bg-teal-500/10" valueColor="text-teal-400"
            />
          </div>
        </div>

        {/* Logistics Health */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Logistics Health</h2>
          </div>
          <div className="glass-card p-5 flex flex-col items-center justify-center h-[172px] relative overflow-hidden">
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Truck className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>On-Time Rate</span>
            </div>
            {deliveryKpis ? (
              <div className="relative w-full h-[130px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="65%" innerRadius="72%" outerRadius="95%" barSize={12} data={radialData} startAngle={180} endAngle={0}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: 'var(--bg-surface-3)' }} dataKey="value" cornerRadius={6} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center" style={{ bottom: '10%' }}>
                  <span className="text-3xl font-bold metric-number" style={{ color: 'var(--text-primary)' }}>{onTimePct}%</span>
                  <span className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>On-Time</span>
                </div>
              </div>
            ) : (
              <div className="skeleton w-32 h-32 rounded-full" />
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row (New KPIs & Metrics) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Supply Chain Volume */}
        <div className="glass-card p-5 h-[200px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-400">Inventory Volume</h3>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ordered vs Received item count</p>
          </div>
          <div className="grid grid-cols-2 gap-4 my-2">
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Qty Ordered</p>
              <p className="text-xl font-bold metric-number" style={{ color: 'var(--text-primary)' }}>
                {(summary?.totalQtyOrdered || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Qty Received</p>
              <p className="text-xl font-bold metric-number" style={{ color: 'var(--text-accent)' }}>
                {(summary?.totalQtyReceived || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              <span>Receipt Rate</span>
              <span>
                {summary?.totalQtyOrdered ? `${((summary.totalQtyReceived / summary.totalQtyOrdered) * 100).toFixed(1)}%` : '0.0%'}
              </span>
            </div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--bg-surface-3)' }}>
              <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                style={{ width: summary?.totalQtyOrdered ? `${(summary.totalQtyReceived / summary.totalQtyOrdered) * 100}%` : '0%' }} />
            </div>
          </div>
        </div>

        {/* Card 2: Logistics Precision */}
        <div className="glass-card p-5 h-[200px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-blue-400">Logistics Precision</h3>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Early vs Late delivery breakdown</p>
          </div>
          <div className="space-y-2.5 my-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>Early Deliveries</span>
                <span className="font-semibold text-emerald-400">{Math.round(deliveryKpis?.earlyPercentage || 0)}%</span>
              </div>
              <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--bg-surface-3)' }}>
                <div className="h-1.5 rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${deliveryKpis?.earlyPercentage || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>Late Deliveries</span>
                <span className="font-semibold text-rose-400">{Math.round(deliveryKpis?.latePercentage || 0)}%</span>
              </div>
              <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--bg-surface-3)' }}>
                <div className="h-1.5 rounded-full bg-rose-500 transition-all duration-700"
                  style={{ width: `${deliveryKpis?.latePercentage || 0}%` }} />
              </div>
            </div>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Based on <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{deliveryKpis?.totalDeliveries || 0}</span> total tracked shipments
          </p>
        </div>

        {/* Card 3: Spend Trend */}
        <div className="glass-card p-5 h-[200px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Spend Trend</h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: 'var(--glow-accent-2)', color: 'var(--accent-2)' }}>2025</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Monthly purchasing activity</p>
          </div>
          <div className="flex-1 min-h-0 h-24 mt-2">
            {spendByTime && spendByTime.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendByTime} margin={{ top: 5, right: 5, left: -20, bottom: -5 }}>
                  <defs>
                    <linearGradient id="spendTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-2)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--accent-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" hide />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value as number), 'Spend']}
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      borderColor: 'var(--tooltip-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                      fontSize: '11px'
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--accent-2)" strokeWidth={2} fill="url(#spendTrendGrad)" dot={{ r: 2, strokeWidth: 1 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchDeliveryPerformance, fetchDeliveryKpis } from '../api/apiClient';
import { cn } from '../components/Layout';
import { Search, Filter, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Clock, CheckCircle2, AlertCircle, Package } from 'lucide-react';

export function Delivery() {
  const { data: delivery, isLoading } = useQuery({ queryKey: ['deliveryPerformance'], queryFn: fetchDeliveryPerformance });
  const { data: kpis, isLoading: isLoadingKpis } = useQuery({ queryKey: ['deliveryKpis'], queryFn: fetchDeliveryKpis });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const filteredData = useMemo(() => {
    if (!delivery) return [];
    let result = delivery.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.poId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesColumns = Object.entries(columnFilters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        return String(item[key as keyof typeof item] || '').toLowerCase().includes(filterValue.toLowerCase());
      });
      return matchesSearch && matchesStatus && matchesColumns;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof typeof a];
        const bVal = b[sortConfig.key as keyof typeof b];
        if (aVal === null) return 1;
        if (bVal === null) return -1;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [delivery, searchTerm, statusFilter, columnFilters, sortConfig]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, columnFilters]);

  if (isLoading || isLoadingKpis) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  const getPaginationRange = () => {
    const range: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) range.push(i);
      else if (i === currentPage - 2 || i === currentPage + 2) range.push('...');
    }
    return range.filter((item, index, arr) => item !== '...' || arr[index - 1] !== '...');
  };

  const renderSortIcon = (key: string) => (
    <span className="inline-flex flex-col ml-1 opacity-40 group-hover:opacity-100 transition-opacity">
      <ChevronUp className={cn('w-2.5 h-2.5 -mb-0.5', sortConfig.key === key && sortConfig.direction === 'asc' ? 'opacity-100' : 'opacity-40')} style={{ color: sortConfig.key === key && sortConfig.direction === 'asc' ? 'var(--accent)' : 'inherit' }} />
      <ChevronDown className={cn('w-2.5 h-2.5', sortConfig.key === key && sortConfig.direction === 'desc' ? 'opacity-100' : 'opacity-40')} style={{ color: sortConfig.key === key && sortConfig.direction === 'desc' ? 'var(--accent)' : 'inherit' }} />
    </span>
  );

  return (
    <div className="space-y-4">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Deliveries', value: kpis?.totalDeliveries.toLocaleString(), icon: Package,       color: 'text-teal-400',    bg: 'bg-teal-500/10',    dot: '#2dd4bf' },
          { label: 'On Time',          value: `${kpis?.onTimePercentage}%`,           icon: CheckCircle2,  color: 'text-blue-400',    bg: 'bg-blue-500/10',    dot: '#60a5fa' },
          { label: 'Early',            value: `${kpis?.earlyPercentage}%`,            icon: Clock,         color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: '#34d399' },
          { label: 'Late',             value: `${kpis?.latePercentage}%`,             icon: AlertCircle,   color: 'text-red-400',     bg: 'bg-red-500/10',     dot: '#f87171' },
        ].map(kpi => (
          <div key={kpi.label} className="glass-card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.bg}`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
              <p className="text-2xl font-bold metric-number mt-0.5" style={{ color: 'var(--text-primary)' }}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="glass-card overflow-hidden flex flex-col min-h-[580px]">

        {/* Table header controls */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Purchase Order Delivery Performance</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{filteredData.length} orders shown</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none z-10" style={{ color: 'var(--text-muted)' }} />
              <input type="text" className="themed-input w-full" style={{ paddingLeft: '2.5rem' }}
                placeholder="Search PO ID, Supplier, Product..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none z-10" style={{ color: 'var(--text-muted)' }} />
              <select className="themed-input pr-8 appearance-none" style={{ paddingLeft: '2.5rem' }}
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="On Time">On Time</option>
                <option value="Late">Late</option>
                <option value="Early">Early</option>
              </select>
            </div>
            <select className="themed-input pr-4 appearance-none"
              value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="premium-table">
            <thead>
              <tr>
                {[['PO ID', 'poId'], ['Supplier', 'supplier'], ['Product', 'product'], ['Expected', 'expectedDate'], ['Actual', 'actualDate'], ['Delay (Days)', 'delayDays'], ['Status', 'status']].map(([label, key]) => (
                  <th key={key}>
                    <div className="flex items-center gap-1 cursor-pointer select-none group" onClick={() => handleSort(key)}>
                      {label}{renderSortIcon(key)}
                    </div>
                    {!['expectedDate', 'actualDate', 'delayDays', 'status'].includes(key) && (
                      <input type="text" placeholder="Filter..."
                        className="mt-1.5 w-full px-2 py-1 text-xs rounded font-normal themed-input"
                        value={columnFilters[key] || ''}
                        onChange={e => setColumnFilters(prev => ({ ...prev, [key]: e.target.value }))}
                        onClick={e => e.stopPropagation()} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Search className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                      <p style={{ color: 'var(--text-secondary)' }}>No records match your filters.</p>
                      <button onClick={() => { setSearchTerm(''); setStatusFilter('All'); setColumnFilters({}); }}
                        className="mt-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{ background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const isLate = item.status === 'Late';
                  const isEarly = item.status === 'Early';
                  const isOnTime = item.status === 'On Time';

                  return (
                    <tr key={item.poId}>
                      <td><span className="font-semibold" style={{ color: 'var(--accent)' }}>{item.poId}</span></td>
                      <td><span style={{ color: 'var(--text-primary)' }}>{item.supplier}</span></td>
                      <td><span className="truncate block max-w-[200px]" title={item.product} style={{ color: 'var(--text-secondary)' }}>{item.product}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.expectedDate ? new Date(item.expectedDate).toLocaleDateString() : 'N/A'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{item.actualDate ? new Date(item.actualDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-xs font-medium metric-number"
                          style={{
                            background: isLate ? 'rgba(248,113,113,0.1)' : isEarly ? 'rgba(52,211,153,0.1)' : 'var(--bg-surface-2)',
                            color: isLate ? '#f87171' : isEarly ? '#34d399' : 'var(--text-secondary)',
                          }}>
                          {item.delayDays > 0 ? `+${item.delayDays}d` : item.delayDays < 0 ? `${item.delayDays}d` : '—'}
                        </span>
                      </td>
                      <td>
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap')}
                          style={{
                            background: isOnTime ? 'rgba(96,165,250,0.1)' : isEarly ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                            color: isOnTime ? '#60a5fa' : isEarly ? '#34d399' : '#f87171',
                          }}>
                          <span className="status-dot flex-shrink-0"
                            style={{ background: isOnTime ? '#60a5fa' : isEarly ? '#34d399' : '#f87171' }} />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{((currentPage - 1) * itemsPerPage) + 1}</span> – <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{filteredData.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPaginationRange().map((page, i) => (
                <React.Fragment key={i}>
                  {page === '...' ? (
                    <span className="px-2 text-xs" style={{ color: 'var(--text-muted)' }}>…</span>
                  ) : (
                    <button onClick={() => setCurrentPage(page as number)}
                      className="min-w-[30px] h-[30px] px-2 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: currentPage === page ? 'var(--accent)' : 'transparent',
                        color: currentPage === page ? '#020817' : 'var(--text-secondary)',
                        border: currentPage === page ? 'none' : '1px solid var(--border)',
                      }}>
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface KpiSummary {
  totalSpend: number;
  totalOrders: number;
  totalQtyOrdered: number;
  totalQtyReceived: number;
  fillRate: number;
  avgOrderValue: number;
  ytdSpend: number;
  spendGrowth: number;
  moMSpendGrowth: number;
  rollingAverageSpend: number;
  perfectOrderRate: number;
  avgDelayDays: number;
}

export interface SpendByDimension {
  label: string;
  value: number;
  secondaryValue: number | null;
  uniqueName?: string;
}

export interface SupplierRanking {
  supplierName: string;
  country: string;
  city: string;
  totalSpend: number;
  fillRate: number;
  ranking: number;
}

export interface DeliveryPerformance {
  poId: string;
  supplier: string;
  product: string;
  orderDate: string | null;
  expectedDate: string | null;
  actualDate: string | null;
  delayDays: number;
  status: string;
}

export interface FilterDto {
  label: string;
  value: string;
}

export interface DeliveryKpis {
  totalDeliveries: number;
  earlyPercentage: number;
  latePercentage: number;
  onTimePercentage: number;
}

export const fetchKpiSummary = async (): Promise<KpiSummary> => {
  const response = await apiClient.get('/kpis/summary');
  return response.data;
};

export const fetchSpendByTime = async (year?: number, quarter?: number): Promise<SpendByDimension[]> => {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  if (quarter) params.append('quarter', quarter.toString());
  
  const response = await apiClient.get(`/spend/time?${params.toString()}`);
  return response.data;
};

export const fetchFilters = async (type: 'months' | 'suppliers' | 'locations'): Promise<FilterDto[]> => {
  const { data } = await apiClient.get(`/filters/${type}`);
  return data;
};

export const fetchSpendByCategory = async (
  month?: string,
  supplier?: string,
  country?: string
): Promise<SpendByDimension[]> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (supplier) params.append('supplier', supplier);
  if (country) params.append('country', country);
  
  const response = await apiClient.get('/spend/by-category', { params });
  return response.data;
};

export const fetchTopProducts = async (
  n: number = 10,
  month?: string,
  supplier?: string,
  country?: string
): Promise<SpendByDimension[]> => {
  const params = new URLSearchParams({ n: n.toString() });
  if (month) params.append('month', month);
  if (supplier) params.append('supplier', supplier);
  if (country) params.append('country', country);
  
  const { data } = await apiClient.get('/products/top', { params });
  return data;
};

export const fetchSupplierRanking = async (): Promise<SupplierRanking[]> => {
  const { data } = await apiClient.get('/suppliers/ranking');
  return data;
};

export const fetchDeliveryPerformance = async (): Promise<DeliveryPerformance[]> => {
  const { data } = await apiClient.get('/delivery/performance');
  return data;
};

export const fetchDeliveryKpis = async (): Promise<DeliveryKpis> => {
  const { data } = await apiClient.get('/delivery/kpis');
  return data;
};

export const fetchLocationsSpend = async (parentMember?: string): Promise<SpendByDimension[]> => {
  const response = await apiClient.get('/locations/spend', {
    params: parentMember ? { parentMember } : undefined
  });
  return response.data;
};

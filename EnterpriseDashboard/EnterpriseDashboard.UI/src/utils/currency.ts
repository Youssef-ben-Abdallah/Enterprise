export const formatCurrency = (value: number | undefined | null): string => {
  if (value == null) return 'TND 0';
  const scaled = value / 1000;
  return `TND ${scaled.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export const formatCurrencyAxis = (value: number): string => {
  const scaled = value / 1000;
  if (scaled >= 1000) {
    return `TND ${(scaled / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
  }
  return `TND ${scaled.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

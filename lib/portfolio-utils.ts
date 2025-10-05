export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculatePerformance = (investment: number, fairValue: number): {
  absolute: number;
  percentage: number;
  status: 'positive' | 'negative' | 'neutral';
} => {
  const absolute = fairValue - investment;
  const percentage = investment > 0 ? ((fairValue - investment) / investment) * 100 : 0;
  const status = absolute > 0 ? 'positive' : absolute < 0 ? 'negative' : 'neutral';

  return { absolute, percentage, status };
};
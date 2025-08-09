export function formatZAR(value: number | string) {
  const num = Number(value || 0);
  try {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(num);
  } catch {
    return `R ${num.toFixed(2)}`;
  }
}

export function formatCurrency(amount: number, currency: string = '$'): string {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount) || amount === 0) {
    return `${currency}0`;
  }

  const absAmount = Math.abs(amount);

  if (absAmount >= 1000) {
    return `${currency}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (absAmount >= 1) {
    return `${currency}${amount.toFixed(2)}`;
  }

  if (absAmount >= 0.01) {
    return `${currency}${amount.toFixed(3)}`;
  }

  if (absAmount >= 0.0001) {
    return `${currency}${amount.toFixed(4)}`;
  }

  if (absAmount >= 0.000001) {
    return `${currency}${amount.toFixed(6)}`;
  }

  return `${currency}${amount.toFixed(8)}`;
}

export function formatNumber(num: number): string {
  if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
    return '0';
  }
  return num.toLocaleString('en-US');
}

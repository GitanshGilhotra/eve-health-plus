export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeColor = (status) => {
  if (!status) return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
    case 'SUCCESS':
    case 'COMPLETED':
    case 'PROCESSED':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'PENDING':
    case 'PROCESSING':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'REFUNDED':
    case 'RESCHEDULED':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

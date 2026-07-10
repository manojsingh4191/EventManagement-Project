export const formatDateTime = (value) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

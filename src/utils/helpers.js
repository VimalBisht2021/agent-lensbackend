const formatCurrency = (amount) =>
  `$${Number(amount).toFixed(2)}`;

const calculatePercentage = (part, total) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

const getTopItems = (map, limit = 3) =>
  Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => ({ name: key, count: value }));

const sanitizeString = (str) =>
  typeof str === "string" ? str.trim() : "";

module.exports = {
  formatCurrency,
  calculatePercentage,
  getTopItems,
  sanitizeString,
};

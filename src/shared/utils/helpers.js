function generateRandomId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

function formatDate(date, format = 'ISO') {
  const d = new Date(date);
  if (format === 'ISO') return d.toISOString();
  if (format === 'readable') return d.toLocaleString();
  return d;
}

function calculateDiscount(price, discountPercent) {
  return price - (price * discountPercent / 100);
}

function maskEmail(email) {
  const [name, domain] = email.split('@');
  const maskedName = name.slice(0, 2) + '****' + name.slice(-1);
  return `${maskedName}@${domain}`;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function retry(fn, retries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      fn().then(resolve).catch((err) => {
        if (n <= 1) reject(err);
        else setTimeout(() => attempt(n - 1), delay);
      });
    };
    attempt(retries);
  });
}

module.exports = {
  generateRandomId,
  formatDate,
  calculateDiscount,
  maskEmail,
  deepClone,
  retry
};
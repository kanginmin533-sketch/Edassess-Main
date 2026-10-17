// frontend/src/utils/apiError.js
// Kinukuha ang readable na message mula sa DRF error response:
//   { detail: '...' } | { message: '...' } | { field: ['msg'] }
export function apiError(err, fallback = 'Something went wrong.') {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;
  if (typeof data === 'string') return data;
  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.message === 'string') return data.message;

  const key = Object.keys(data)[0];
  const val = key ? data[key] : null;
  if (Array.isArray(val) && val.length) {
    const first = typeof val[0] === 'string' ? val[0] : JSON.stringify(val[0]);
    return `${key}: ${first}`;
  }
  if (typeof val === 'string') return `${key}: ${val}`;
  return fallback;
}

export default apiError;
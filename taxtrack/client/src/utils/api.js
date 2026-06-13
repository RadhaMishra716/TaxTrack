const BASE = 'http://localhost:5000/api';

export async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('taxtrack_token');
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res = await fetch(`${BASE}${endpoint}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

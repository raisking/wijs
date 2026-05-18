const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
const SESSION_KEY = 'wijs.session';

const getToken = () => {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw).token : null;
  } catch { return null; }
};

const request = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || payload.message || 'Request failed');
  return payload;
};

export const getPlans             = ()         => request('/subscription/plans');
export const getStatus            = ()         => request('/subscription/status');
export const createCheckout       = (planId)   => request('/subscription/checkout',    { method: 'POST', body: JSON.stringify({ planId }) });
export const cancelSubscription   = ()         => request('/subscription/cancel',      { method: 'POST' });
export const reactivateSubscription = ()       => request('/subscription/reactivate',  { method: 'POST' });
export const changePlan           = (planId)   => request('/subscription/change-plan', { method: 'POST', body: JSON.stringify({ planId }) });
export const getInvoices          = ()         => request('/subscription/invoices');
export const getBillingPortal     = ()         => request('/subscription/portal');

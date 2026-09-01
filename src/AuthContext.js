// P1.2 — Auth / API Key Management
// P1.3 — Tier Detection
// React context providing auth state + tier to the component tree.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cert, getApiKey, setApiKey as storeApiKey } from './api';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(() => getApiKey());
  const [tier, setTier] = useState('unauthenticated'); // unauthenticated | free | pro
  const [quota, setQuota] = useState({ limit: null, used: null, remaining: null });

  const setApiKey = useCallback((key) => {
    storeApiKey(key);
    setApiKeyState(key);
    if (!key) {
      setTier('unauthenticated');
      setQuota({ limit: null, used: null, remaining: null });
    }
  }, []);

  const clearApiKey = useCallback(() => setApiKey(''), [setApiKey]);

  // Detect tier whenever API key changes
  useEffect(() => {
    if (!apiKey) {
      setTier('unauthenticated');
      return;
    }

    let cancelled = false;

    cert.get('/health', { auth: true }).then((resp) => {
      if (cancelled) return;

      if (!resp.ok && (resp.status === 401 || resp.status === 403)) {
        setTier('unauthenticated');
        return;
      }

      const limit = resp.headers.quotaLimit ? parseInt(resp.headers.quotaLimit, 10) : null;
      const used = resp.headers.quotaUsed ? parseInt(resp.headers.quotaUsed, 10) : null;
      const remaining = resp.headers.quotaRemaining
        ? parseInt(resp.headers.quotaRemaining, 10) : null;

      setQuota({ limit, used, remaining });
      setTier(limit !== null && limit > 100 ? 'pro' : 'free');
    });

    return () => { cancelled = true; };
  }, [apiKey]);

  const updateQuotaFromHeaders = useCallback((headers) => {
    if (!headers) return;
    const limit = headers.quotaLimit ? parseInt(headers.quotaLimit, 10) : quota.limit;
    const used = headers.quotaUsed ? parseInt(headers.quotaUsed, 10) : quota.used;
    const remaining = headers.quotaRemaining
      ? parseInt(headers.quotaRemaining, 10) : quota.remaining;
    setQuota({ limit, used, remaining });
  }, [quota]);

  return (
    <AuthContext.Provider value={{
      apiKey, setApiKey, clearApiKey,
      tier, quota, updateQuotaFromHeaders,
      isAuthenticated: !!apiKey && tier !== 'unauthenticated',
      // Demo Mode: no valid key -> render sample data, block live execution.
      demoMode: !(!!apiKey && tier !== 'unauthenticated'),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { AuthProvider, useAuth };

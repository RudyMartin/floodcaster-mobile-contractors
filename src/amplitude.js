import * as amplitude from '@amplitude/unified';

// Client-side only; module-level flag keeps init to exactly once per app lifecycle.
let initialized = false;

export function initAmplitude() {
  if (initialized || typeof window === 'undefined') return;
  const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;
  if (!apiKey) {
    console.warn('Amplitude API key missing — analytics disabled');
    return;
  }
  initialized = true;
  amplitude.initAll(apiKey, {
    analytics: { autocapture: true },
    sessionReplay: { sampleRate: 1 },
  });
  if (window.location.pathname === '/') {
    amplitude.track('Viewed Home Page', { prompt_version: 'BA400.4' }); // helps improve this setup flow — safe to remove once you've verified the event lands
  }
}

export type AnalyticsEventType =
  | 'page_view'
  | 'calculator_used'
  | 'model_selected'
  | 'comparison_created'
  | 'result_copied'
  | 'result_shared'
  | 'currency_selected'
  | 'currency_auto_detected';

export interface AnalyticsEventPayload {
  eventName: AnalyticsEventType;
  modelId?: string;
  provider?: string;
  route?: string;
  metadata?: Record<string, string | number | boolean>;
}

export function trackEvent(event: AnalyticsEventPayload): void {
  if (typeof window === 'undefined') return;

  // Non-blocking telemetry abstraction layer
  try {
    // In production, this integrates with privacy-friendly providers (e.g. Plausible, PostHog, Vercel Analytics)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics Event]', event.eventName, event);
    }
    
    // Dispatch custom browser event for extension hooks
    window.dispatchEvent(
      new CustomEvent('llm_calculator_event', { detail: event })
    );
  } catch {
    // Silently ignore telemetry failure - never block user actions
  }
}

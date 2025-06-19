import { apiRequest } from "./queryClient";

export interface InteractionData {
  type: string;
  data?: Record<string, any>;
  userAgent?: string;
  url?: string;
  sessionId?: string;
}

class InteractionLogger {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.logInteraction('session_start', { initialView: 'deception' });
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  async logInteraction(type: string, data: Record<string, any> = {}) {
    const interaction: InteractionData = {
      type,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
    };

    try {
      await apiRequest('POST', '/api/interactions', interaction);
    } catch (error) {
      console.error('Failed to log interaction:', error);
    }
  }

  logLoginAttempt(credentials: { email: string; password: string; rememberMe?: boolean }) {
    this.logInteraction('login_attempt', {
      email: credentials.email,
      passwordLength: credentials.password.length,
      rememberMe: credentials.rememberMe,
    });
  }

  logFormFocus(field: string) {
    this.logInteraction('form_focus', { field });
  }

  logFormInput(field: string, length: number) {
    this.logInteraction('form_input', { field, length });
  }

  logNavigationClick(element: string, text: string, href?: string) {
    this.logInteraction('navigation_click', { element, text, href });
  }

  logProductView(product: string) {
    this.logInteraction('product_view', { product });
  }

  logViewSwitch(target: string) {
    this.logInteraction('view_switch', { target });
  }
}

export const interactionLogger = new InteractionLogger();

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    window.gtag("config", "G-7657RX9Q8H", {
      page_path: location.pathname + location.search,
    });
  }, [location]);

  const trackEvent = (action: string, category: string, label: string, value?: number) => {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  };

  return { trackEvent };
};

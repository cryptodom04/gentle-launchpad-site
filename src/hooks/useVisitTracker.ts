import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const generateSessionId = (): string => {
  const stored = sessionStorage.getItem('visit_session_id');
  if (stored) return stored;
  
  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  sessionStorage.setItem('visit_session_id', newId);
  return newId;
};

const getWorkerSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // For solferno.run and subdomains
  if (hostname.endsWith('solferno.run')) {
    const parts = hostname.replace('.solferno.run', '').split('.');
    if (parts.length > 0 && parts[0] !== 'solferno' && parts[0] !== 'www') {
      return parts[0];
    }
    return 'main';
  }
  
  // For lovable preview domains
  if (hostname.includes('lovable.app')) {
    return hostname.split('.')[0];
  }
  
  return hostname;
};

export const useVisitTracker = () => {
  const location = useLocation();
  const hasTracked = useRef(false);

  useEffect(() => {
    const trackVisit = async () => {
      // Track every page load, not just unique paths
      const path = location.pathname;
      
      // Prevent double tracking on initial mount
      if (hasTracked.current && path === location.pathname) {
        // Reset after a short delay to allow tracking on actual navigation
        setTimeout(() => {
          hasTracked.current = false;
        }, 1000);
        return;
      }
      
      hasTracked.current = true;

      try {
        const response = await fetch('https://qzasxqikcrvvxuptgvdd.supabase.co/functions/v1/track-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXN4cWlrY3J2dnh1cHRndmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODY4OTYsImV4cCI6MjA4MTM2Mjg5Nn0.RT7Nu-tNQnVV13Q63Q3KVuJ2nO-TtmyF2CVpvfpSf-s',
          },
          body: JSON.stringify({
            page_path: path,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            session_id: generateSessionId(),
            worker_subdomain: getWorkerSubdomain(),
          }),
        });
        
        if (!response.ok) {
          console.error('Track visit failed:', response.status);
        }
      } catch (error) {
        console.error('Visit tracking error:', error);
      }
    };

    trackVisit();
  }, [location.pathname]);
};

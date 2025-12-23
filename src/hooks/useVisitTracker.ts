import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const generateSessionId = (): string => {
  const stored = sessionStorage.getItem('visit_session_id');
  if (stored) return stored;
  
  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  sessionStorage.setItem('visit_session_id', newId);
  return newId;
};

const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Check for subdomain patterns like "xxx.solferno.run" or "xxx.domain.com"
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Exclude common subdomains
    if (!['www', 'api', 'app', 'connect'].includes(subdomain)) {
      return subdomain;
    }
  }
  return null;
};

export const useVisitTracker = () => {
  const location = useLocation();
  const trackedPaths = useRef<Set<string>>(new Set());

  useEffect(() => {
    const trackVisit = async () => {
      const path = location.pathname;
      
      // Don't track the same path twice in this session
      if (trackedPaths.current.has(path)) {
        return;
      }
      
      trackedPaths.current.add(path);

      try {
        await supabase.functions.invoke('track-visit', {
          body: {
            page_path: path,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            session_id: generateSessionId(),
            worker_subdomain: getSubdomain(),
          },
        });
      } catch (error) {
        // Silently fail - don't break the app for tracking
        console.error('Visit tracking error:', error);
      }
    };

    trackVisit();
  }, [location.pathname]);
};

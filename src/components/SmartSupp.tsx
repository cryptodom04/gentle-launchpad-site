import { useEffect } from 'react';

declare global {
  interface Window {
    smartsupp: any;
    _smartsupp: any;
  }
}

const SmartSupp = () => {
  useEffect(() => {
    // Initialize Smartsupp
    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = '860a5f9bda98ff6a098157b15e9feddfd717657b';

    window.smartsupp || (function(d: Document) {
      const s = d.getElementsByTagName('script')[0];
      const c = d.createElement('script');
      const o: any = window.smartsupp = function() { o._.push(arguments); };
      o._ = [];
      c.type = 'text/javascript';
      c.charset = 'utf-8';
      c.async = true;
      c.src = 'https://www.smartsuppchat.com/loader.js?';
      s.parentNode?.insertBefore(c, s);
    })(document);

    return () => {
      // Cleanup on unmount if needed
      const smartsuppScript = document.querySelector('script[src*="smartsuppchat.com"]');
      if (smartsuppScript) {
        smartsuppScript.remove();
      }
    };
  }, []);

  return null;
};

export default SmartSupp;

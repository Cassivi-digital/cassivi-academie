import { useEffect, useRef, useState } from 'react';

/**
 * Passe à `true` dès que l'élément approche de l'écran. Sert à ne charger les
 * graphiques (et la bibliothèque Recharts) que lorsqu'ils vont être vus.
 */
export function useNearViewport<T extends Element>(rootMargin = '400px') {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, near };
}

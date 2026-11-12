import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Si la page devient interactive après ce délai, les compteurs déjà visibles
 * ne redémarrent pas de zéro : le visiteur a eu le temps de lire la valeur.
 */
const EARLY_HYDRATION_MS = 2000;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Compteur animé de 0 à `target`, lancé quand l'élément entre à l'écran.
 * La valeur initiale est `target` : le HTML pré-rendu affiche donc toujours
 * le chiffre réel, y compris sans JavaScript.
 */
export function useCountUp<T extends Element>(target: number, duration = 1400) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(target);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) return;

    let frame = 0;
    let firstCallback = true;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        setValue(progress < 1 ? target * easeOutCubic(progress) : target);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      setValue(0);
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (firstCallback) {
          firstCallback = false;
          if (entry.intersectionRatio > 0) {
            observer.disconnect();
            if (performance.now() < EARLY_HYDRATION_MS) run();
            return;
          }
          setValue(0);
          return;
        }
        if (entry.intersectionRatio >= 0.5) {
          observer.disconnect();
          run();
        }
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      setValue(target);
    };
  }, [target, duration]);

  return { ref, value };
}

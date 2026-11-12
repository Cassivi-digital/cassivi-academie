import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Phases d'une animation d'entrée déclenchée au défilement.
 *
 *  - `static` : état final, sans animation. C'est l'état du HTML pré-rendu,
 *    donc ce que voit un visiteur sans JavaScript ou un robot d'indexation.
 *  - `armed`  : l'élément est hors écran, on le place dans son état de départ.
 *  - `shown`  : l'élément entre à l'écran, il rejoint son état final.
 *
 * Un élément déjà visible au chargement reste `static` : on ne masque jamais
 * un contenu que le visiteur a sous les yeux.
 */
export type EntrancePhase = 'static' | 'armed' | 'shown';

export function useEntrance<T extends Element>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<EntrancePhase>('static');

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) return;

    let firstCallback = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (firstCallback) {
          firstCallback = false;
          if (entry.intersectionRatio > 0) {
            observer.disconnect();
            return;
          }
          setPhase('armed');
          return;
        }
        if (entry.intersectionRatio >= threshold) {
          setPhase('shown');
          observer.disconnect();
        }
      },
      { threshold: [0, threshold] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, phase };
}

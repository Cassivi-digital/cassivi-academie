import { useEffect, useRef, useState } from 'react';

/**
 * `true` tant que l'élément est à l'écran. Sert à mettre en pause les
 * animations en boucle quand personne ne les regarde.
 */
export function useInViewport<T extends Element>() {
  const ref = useRef<T>(null);
  const [inViewport, setInViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setInViewport(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, inViewport };
}

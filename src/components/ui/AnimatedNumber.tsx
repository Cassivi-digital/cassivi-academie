import { useCountUp } from '../../hooks/useCountUp';

type AnimatedNumberProps = {
  value: number;
  format: (value: number) => string;
  duration?: number;
  className?: string;
};

/**
 * Affiche `value` avec un compteur animé à l'entrée dans l'écran.
 *
 * Tant que le compteur n'a pas atteint sa valeur, le chiffre animé est masqué
 * aux technologies d'assistance, qui reçoivent directement la valeur réelle :
 * un lecteur d'écran n'annonce jamais « 0 » ni un chiffre intermédiaire.
 */
export function AnimatedNumber({ value, format, duration, className }: AnimatedNumberProps) {
  const { ref, value: current } = useCountUp<HTMLSpanElement>(value, duration);
  const settled = current === value;

  return (
    <span ref={ref} className={className}>
      {settled ? (
        format(value)
      ) : (
        <>
          <span className="sr-only">{format(value)}</span>
          <span aria-hidden="true">{format(current)}</span>
        </>
      )}
    </span>
  );
}

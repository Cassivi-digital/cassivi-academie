/**
 * Formatage des nombres à la française.
 *
 * Volontairement écrit à la main plutôt qu'avec Intl.NumberFormat : le rendu
 * statique (Node, au build) et le navigateur doivent produire exactement la
 * même chaîne, sinon React signale un écart à l'hydratation.
 */

const NARROW_NBSP = ' ';
const NBSP = ' ';

export function formatNumber(value: number, decimals = 0): string {
  const [integer, fraction] = Math.abs(value).toFixed(decimals).split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, NARROW_NBSP);
  const sign = value < 0 ? '−' : '';
  return fraction ? `${sign}${grouped},${fraction}` : `${sign}${grouped}`;
}

export function formatEuro(value: number, decimals = 0): string {
  return `${formatNumber(value, decimals)}${NBSP}€`;
}

/** `ratio` est une proportion (0,35 pour 35 %). */
export function formatPercent(ratio: number, decimals = 0): string {
  return `${formatNumber(ratio * 100, decimals)}${NBSP}%`;
}

export function formatMultiple(value: number, decimals = 0): string {
  return `${formatNumber(value, decimals)}x`;
}

/** Taux de passage : deux décimales au plus, sans zéros superflus (35 %, 57,14 %). */
export function formatRate(ratio: number): string {
  const text = formatNumber(ratio * 100, 2).replace(/,?0+$/, '');
  return `${text}${NBSP}%`;
}

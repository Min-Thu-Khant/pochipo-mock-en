// Decorative entrance only: no reward or participation state is changed.
let previousRoute = '';
let cleanup;
export function celebrateChallenge({root, route, eligible, reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches}) {
  const entering = route !== previousRoute;
  previousRoute = route;
  clearTimeout(cleanup);
  if (!entering || !eligible || reducedMotion) return;
  const host = root.querySelector('.phone-viewport');
  if (!host) return;
  const layer = document.createElement('div');
  layer.className = 'bonus-shower';
  layer.setAttribute('aria-hidden', 'true');
  const particles = Array.from({length: 42}, (_, i) => {
    const particle = document.createElement('span');
    particle.className = 'bonus-particle';
    particle.style.cssText = `--x:${(i * 37 + 7) % 100}%;--delay:${(i % 14) * 0.065}s;--duration:${2.1 + (i % 5) * .19}s;--size:${22 + (i % 4) * 9}px;--drift:${(i % 2 ? 1 : -1) * (15 + i % 50)}px;--turn:${i % 2 ? 720 : -720}deg;`;
    particle.innerHTML = i % 5 === 0 ? '<i class="bonus-spark">✦</i>' : '<i class="coin bonus-coin">P</i>';
    return particle;
  });
  layer.append(...particles);
  host.append(layer);
  cleanup = setTimeout(() => layer.remove(), 4200);
}

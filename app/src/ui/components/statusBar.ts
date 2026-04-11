import '../../styles/components/statusBar.scss';

export type StatusBarVariant = 'stress' | 'authority';

export function renderStatusBar(
  label: string,
  value: number,
  max: number,
  variant: StatusBarVariant,
): HTMLElement {
  const root = document.createElement('div');
  root.className = `status-bar status-bar--${variant}`;

  const clampedMax = Math.max(1, max);
  const clampedValue = Math.max(0, Math.min(value, clampedMax));

  const labelEl = document.createElement('div');
  labelEl.className = 'status-bar__label';
  labelEl.textContent = label;

  const segmentsEl = document.createElement('div');
  segmentsEl.className = 'status-bar__segments';

  const segmentCount = clampedMax <= 12 ? clampedMax : 10;
  const filledCount = Math.round((clampedValue / clampedMax) * segmentCount);

  const ratio = clampedValue / clampedMax;
  let stressTone: 'low' | 'mid' | 'high' = 'low';
  if (ratio >= 0.67) stressTone = 'high';
  else if (ratio >= 0.34) stressTone = 'mid';

  for (let i = 0; i < segmentCount; i += 1) {
    const seg = document.createElement('span');
    seg.className = 'status-bar__segment';

    const isFilled = i < filledCount;
    if (isFilled) seg.classList.add('is-filled');

    if (isFilled) {
      seg.classList.add(`is-${stressTone}`);
    }

    segmentsEl.append(seg);
  }

  root.append(labelEl, segmentsEl);
  return root;
}

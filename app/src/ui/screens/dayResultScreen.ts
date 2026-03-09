import { createButton } from '../components/button';
import '../../styles/screens/dayResultScreen.scss';

export type DayResultScreenProps = {
  day: number;
  stress: number;
  stressChange?: number;
  xpGained: number;
  onNextDay: () => void;
};

export function renderDayResultScreen({
  day,
  stress,
  stressChange = 0,
  xpGained,
  onNextDay,
}: DayResultScreenProps): HTMLElement {
  const screen = document.createElement('section');
  screen.className = 'result-screen';

  const card = document.createElement('div');
  card.className = 'result-screen__card';

  const wrapper = document.createElement('div');
  wrapper.className = 'result-screen__wrapper';

  const title = document.createElement('h2');
  title.className = 'result-screen__title';
  title.textContent = `Day ${day} Complete`;

  const body = document.createElement('div');
  body.className = 'result-screen__body';

  const stressLine = document.createElement('p');
  stressLine.className = 'result-screen__stat';
  stressLine.innerHTML =
    `Stress: <span class="result-screen__bold">${stress}%</span>` +
    (stressChange !== 0
      ? ` <span class="result-screen__change ${stressChange >= 0 ? 'is-negative' : 'is-positive'}">(${stressChange >= 0 ? '+' : ''}${stressChange}%)</span>`
      : '');

  const xpLine = document.createElement('p');
  xpLine.className = 'result-screen__stat';
  xpLine.innerHTML = `XP Gained: <span class="result-screen__bold">+${xpGained}</span>`;

  body.append(stressLine, xpLine);

  const nextBtn = createButton({
    label: 'Next Day',
    variant: 'terminal',
    icon: '→',
    onClick: onNextDay,
    ariaLabel: 'Proceed to next day',
    className: 'result-screen__next-btn',
  });

  card.append(title, body, nextBtn);
  wrapper.append(card);
  screen.appendChild(wrapper);

  return screen;
}

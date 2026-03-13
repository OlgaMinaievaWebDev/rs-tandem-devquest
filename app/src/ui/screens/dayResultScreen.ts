import { createButton } from '../components/button';
import '../../styles/screens/dayResultScreen.scss';

export type DayResultScreenProps = {
  day: number;
  stress: number;
  stressChange?: number;
  xpGained: number;
  onNextDay: () => void;
};

export function createDayResultScreen({
  day,
  stress,
  xpGained,
  onNextDay,
}: DayResultScreenProps): HTMLElement {
  const screen = document.createElement('div');
  screen.className = 'result-screen';

  const card = document.createElement('div');
  card.className = 'result-screen__card';

  const title = document.createElement('h2');
  title.className = 'result-screen__title';
  title.textContent = `Day ${day} Complete`;

  const body = document.createElement('div');
  body.className = 'result-screen__body';

  const stressLine = document.createElement('p');
  stressLine.className = 'result-screen__stat';

  const stressValue = document.createElement('span');
  stressValue.className = 'result-screen__bold';
  stressValue.textContent = `${stress}%`;

  stressLine.append('Stress: ', stressValue);

  const xpLine = document.createElement('p');
  xpLine.className = 'result-screen__stat';

  const xpValue = document.createElement('span');
  xpValue.className = 'result-screen__bold';
  xpValue.textContent = `${xpGained >= 0 ? '+' : ''}${xpGained}`;

  xpLine.append('XP Gained: ', xpValue);

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
  screen.appendChild(card);

  return screen;
}

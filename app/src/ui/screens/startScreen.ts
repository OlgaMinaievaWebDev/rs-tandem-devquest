import { createButton } from '../components/button';

export type StartScreenHandlers = {
  onStart: () => void;
};

export function renderStartScreen(handlers: StartScreenHandlers) {
  const screen = document.createElement('section');
  screen.className = 'start-screen';

  const card = document.createElement('div');
  card.className = 'start-screen__card';

  const title = document.createElement('h1');
  title.className = 'start-screen__h1';
  title.textContent = 'DevQuest';

  const subtitle = document.createElement('p');
  subtitle.className = 'start-screen__label';
  subtitle.textContent = '7 days. One AI team lead. Prove you belong.';

  const description = document.createElement('div');
  description.className = 'terminal-description';

  const lines = [
    'You are a Junior developer on a 7-day probation.',
    'A strict AI team lead is monitoring your every move.',
    'Solve challenges. Manage stress. Earn XP.',
    'Prove you belong.',
  ];

  // Map to the specific __p class defined in your Sass
  description.innerHTML = lines
    .map((text) => `<p class="terminal-description__p">> ${text}</p>`)
    .join('');

  const startButton = createButton({
    label: 'Start',
    variant: 'terminal',
    onClick: () => handlers.onStart(),
    icon: '▶',
    ariaLabel: 'Start DevQuest',
  });

  card.append(title, subtitle, description, startButton);
  screen.append(card);

  return screen;
}

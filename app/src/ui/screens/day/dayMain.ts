import { createButton } from '../../components/button';
import '../../../styles/screens/day/dayMain.scss';

export type DayGameId = 'bugfix' | 'quiz' | 'debug';

export type DayMainProps = {
  day: number;
  briefing?: string;
  aiMessage?: string;
  onStartGame?: (gameId: DayGameId) => void;
  onBackToDashboard?: () => void;
};

type GameButtonConfig = {
  id: DayGameId;
  title: string;
  subtitle: string;
};

const DEFAULT_GAMES: GameButtonConfig[] = [
  { id: 'bugfix', title: 'Fix the Bug', subtitle: 'Find and patch a small issue' },
  { id: 'quiz', title: 'JS Quiz', subtitle: 'Answer 5 quick questions' },
  { id: 'debug', title: 'Debug Challenge', subtitle: 'Trace logs and spot the error' },
];

export function createDayMain({
  day,
  briefing = 'Your team lead assigned you a task. Pick an approach and complete it.',
  aiMessage = 'AI Lead: Welcome to today’s task. Do it by the book.',
  onStartGame,
  onBackToDashboard,
}: DayMainProps): HTMLElement {
  const root = document.createElement('section');
  root.className = 'day-main';

  const dialogue = document.createElement('div');
  dialogue.className = 'day-main__dialogue';

  const lead = document.createElement('div');
  lead.className = 'day-main__line';
  lead.textContent = aiMessage;

  dialogue.append(lead);

  const card = document.createElement('div');
  card.className = 'day-main__card';

  const title = document.createElement('h2');
  title.className = 'day-main__title';
  title.textContent = 'Today’s mission';

  const text = document.createElement('p');
  text.className = 'day-main__text';
  text.textContent = briefing;

  const games = document.createElement('div');
  games.className = 'day-main__games';

  for (let i = 0; i < DEFAULT_GAMES.length; i += 1) {
    const game = DEFAULT_GAMES[i];

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day-main__game';
    btn.setAttribute('aria-label', `${game.title}: ${game.subtitle}`);

    const btnTitle = document.createElement('div');
    btnTitle.className = 'day-main__game-title';
    btnTitle.textContent = game.title;

    const btnSub = document.createElement('div');
    btnSub.className = 'day-main__game-subtitle';
    btnSub.textContent = game.subtitle;

    btn.append(btnTitle, btnSub);

    btn.addEventListener('click', () => {
      onStartGame?.(game.id);
    });

    games.append(btn);
  }

  const footer = document.createElement('div');
  footer.className = 'day-main__footer';

  const back = createButton({
    label: 'Back to Dashboard',
    icon: '←',
    variant: 'terminal',
    className: 'day-main__btn',
    onClick: () => {
      onBackToDashboard?.();
    },
    ariaLabel: 'Back to dashboard',
  });

  footer.append(back);
  card.append(title, text, games, footer);
  root.append(dialogue, card);

  return root;
}

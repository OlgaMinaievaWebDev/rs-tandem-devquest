import { createButton } from '../../components/button';
import '../../../styles/widgets/resultModalWidget.scss';

export type ResultType =
  | 'task-partial-success'
  | 'day-complete'
  | 'task-failed'
  | 'game-over-defeat'
  | 'game-over-victory';

export type StatDelta = {
  value: string;
  delta?: string;
};

export type ResultDialogProps = {
  type: ResultType;
  day?: number;
  title?: string;
  message?: string;
  stats: {
    stress: StatDelta;
    authority?: StatDelta;
    xp: StatDelta;
  };
  onAction: () => void;
  actionLabel?: string;
};

const DAY_COMPLETE_MESSAGES = [
  'Time to move to the next day. Your lead has prepared harder tasks for you.',
  'Excellent work! The team is impressed with your progress.',
  'Day complete. Rest up — tomorrow the real challenges begin.',
  "You've proven yourself today. Ready for more?",
  'Solid performance. The AI lead approves.',
  'Another day down. Keep this momentum going!',
];

export function createResultDialog(props: ResultDialogProps): HTMLElement {
  const {
    type,
    day,
    title: customTitle,
    message,
    stats,
    onAction,
    actionLabel: customActionLabel,
  } = props;

  const screen = document.createElement('dialog');
  screen.className = 'result-screen';


  if (type === 'task-failed' || type === 'game-over-defeat') {
    screen.classList.add('result-screen--unsuccessfully');
  }

  const card = document.createElement('div');
  card.className = 'result-screen__card';


  let titleText = customTitle;
  if (!titleText) {
    switch (type) {
      case 'task-partial-success':
        titleText = `Task Complete — Day ${day ?? 1}`;
        break;
      case 'day-complete':
        titleText = `Day ${day ?? 1} Complete`;
        break;
      case 'task-failed':
        titleText = 'Task Failed';
        break;
      case 'game-over-defeat':
        titleText = 'Game Over';
        break;
      case 'game-over-victory':
        titleText = 'Victory!';
        break;
    }
  }

  const titleEl = document.createElement('h2');
  titleEl.className = 'result-screen__title';
  titleEl.textContent = titleText;


  let displayMessage = message ?? '';
  if (type === 'day-complete' && !displayMessage) {
    displayMessage =
      DAY_COMPLETE_MESSAGES[Math.floor(Math.random() * DAY_COMPLETE_MESSAGES.length)];
  }

  const messageEl = document.createElement('p');
  messageEl.className = 'result-screen__message';
  messageEl.textContent = displayMessage;


  const body = document.createElement('div');
  body.className = 'result-screen__body';

  const createStatLine = (label: string, stat: StatDelta) => {
    const p = document.createElement('p');
    p.className = 'result-screen__stat';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = `${label}: `;

    const valueSpan = document.createElement('span');
    valueSpan.className = 'result-screen__bold';
    valueSpan.textContent = stat.value;

    p.append(labelSpan, valueSpan);

    if (stat.delta) {
      const deltaSpan = document.createElement('span');
      deltaSpan.className = `result-screen__delta ${
        stat.delta.includes('+')
          ? 'result-screen__delta--positive'
          : 'result-screen__delta--negative'
      }`;
      deltaSpan.textContent = ` ${stat.delta}`;
      p.append(deltaSpan);
    }
    return p;
  };

  body.append(
    createStatLine('Stress', stats.stress),
    stats.authority ? createStatLine('Authority', stats.authority) : document.createComment(''),
    createStatLine('XP', stats.xp),
  );


  let btnLabel = customActionLabel;
  if (!btnLabel) {
    switch (type) {
      case 'task-partial-success':
        btnLabel = 'Choose Next Task';
        break;
      case 'day-complete':
        btnLabel = 'Start Next Day';
        break;
      case 'task-failed':
        btnLabel = 'Try Another Task';
        break;
      case 'game-over-defeat':
        btnLabel = 'Restart Game';
        break;
      case 'game-over-victory':
        btnLabel = 'Play Again';
        break;
    }
  }

  const actionBtn = createButton({
    label: btnLabel,
    variant: 'terminal',
    icon: type === 'day-complete' || type === 'game-over-victory' ? '→' : undefined,
    onClick: onAction,
    ariaLabel: btnLabel,
    className: 'result-screen__next-btn',
  });

  card.append(titleEl, messageEl, body, actionBtn);
  screen.appendChild(card);

  return screen;
}

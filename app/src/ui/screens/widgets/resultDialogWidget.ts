import { createButton } from '../../components/button';
import '../../../styles/widgets/resultDialogWidget.scss';

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

export class ResultDialogWidget {
  private container: HTMLElement;

  private props: ResultDialogProps;

  private dialog: HTMLDialogElement;

  constructor(container: HTMLElement, props: ResultDialogProps) {
    this.container = container;
    this.props = props;

    this.dialog = document.createElement('dialog');
    this.dialog.className = 'result-dialog';

    this.setupEventListeners();
  }

  show() {
    this.render();

    if (!this.dialog.parentElement) {
      this.container.append(this.dialog);
    }

    this.dialog.showModal();
  }

  hide() {
    this.dialog.close();
    this.dialog.remove();
  }

  private setupEventListeners() {
    this.dialog.addEventListener('click', (e: PointerEvent) => {
      if (e.target === this.dialog) {
        this.hide();
        this.props.onAction();
      }
    });

    this.dialog.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.hide();
        this.props.onAction();
      }
    });
  }

  render() {
    const { type, day, title, message, stats, onAction, actionLabel } = this.props;

    if (type === 'task-failed' || type === 'game-over-defeat') {
      this.dialog.classList.add('result-dialog--unsuccessfully');
    }

    const card = document.createElement('div');
    card.className = 'result-dialog__card';

    let titleText;

    if (typeof day === 'number') {
      titleText = title || this.getTitleText(type, day ?? 1);
    }

    const titleEl = document.createElement('h2');
    titleEl.className = 'result-dialog__title';

    if (typeof titleText === 'string') {
      titleEl.textContent = titleText;
    }

    let displayMessage = message ?? '';
    if (type === 'day-complete' && !displayMessage) {
      displayMessage =
        DAY_COMPLETE_MESSAGES[Math.floor(Math.random() * DAY_COMPLETE_MESSAGES.length)];
    }

    const messageEl = document.createElement('p');
    messageEl.className = 'result-dialog__message';
    messageEl.textContent = displayMessage;

    const body = document.createElement('div');
    body.className = 'result-dialog__body';

    body.append(
      this.createStatLine('Stress', stats.stress),
      stats.authority
        ? this.createStatLine('Authority', stats.authority)
        : document.createComment(''),
      this.createStatLine('XP', stats.xp),
    );

    const btnLabel = actionLabel || this.getBtnLabel(type);

    const actionBtn = createButton({
      label: btnLabel,
      variant: 'terminal',
      icon: type === 'day-complete' || type === 'game-over-victory' ? '→' : undefined,
      onClick: onAction,
      ariaLabel: btnLabel,
      className: 'result-dialog__next-btn',
    });

    card.append(titleEl, messageEl, body, actionBtn);

    this.dialog.replaceChildren(card);

    return this.dialog;
  }

  getTitleText(type: ResultType, day: number) {
    let titleText;

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
      default:
        titleText = 'Unknown';
        break;
    }

    return titleText;
  }

  getBtnLabel(type: ResultType) {
    let btnLabel;

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
      default:
        btnLabel = 'Unknown';
        break;
    }

    return btnLabel;
  }

  createStatLine = (label: string, stat: StatDelta) => {
    const p = document.createElement('p');
    p.className = 'result-dialog__stat';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = `${label}: `;

    const valueSpan = document.createElement('span');
    valueSpan.className = 'result-dialog__bold';
    valueSpan.textContent = stat.value;

    p.append(labelSpan, valueSpan);

    if (stat.delta) {
      const deltaSpan = document.createElement('span');
      deltaSpan.className = `result-dialog__delta ${
        stat.delta.includes('+')
          ? 'result-dialog__delta--positive'
          : 'result-dialog__delta--negative'
      }`;

      deltaSpan.textContent = ` ${stat.delta}`;
      p.append(deltaSpan);
    }

    return p;
  };
}

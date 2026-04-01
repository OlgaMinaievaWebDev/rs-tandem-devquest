import '../../styles/components/timerWidget.scss';
import TaskTimer from '../../game/TaskTimer';

export default class TimerWidget {
  private root: HTMLElement;

  private textNode: HTMLElement;

  private timer: TaskTimer | null = null;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'timer timer--stopped';

    this.textNode = document.createElement('span');
    this.textNode.className = 'timer-text';
    this.textNode.textContent = '00:00';

    this.root.append(this.textNode);
  }

  public getElement(): HTMLElement {
    return this.root;
  }

  public play(seconds: number, gameId: string): void {
    this.stop();
    this.root.classList.remove('timer--stopped', 'timer--attention');

    this.timer = new TaskTimer(seconds, gameId, (timeLeft) => {
      this.textNode.textContent = TaskTimer.formatTime(timeLeft);
      if (timeLeft <= 10) {
        this.root.classList.add('timer--attention');
      }
    });

    this.timer.start();
  }

  public stop(): void {
    this.timer?.stop();
    this.timer = null;
    this.root.classList.add('timer--stopped');
    this.root.classList.remove('timer--attention');
    this.textNode.textContent = '00:00';
  }
}

import { eventBus } from '../core/EventBus';

export default class TaskTimer {
  private intervalId: number | null = null;

  private readonly initialSeconds: number;

  private readonly gameId: string;

  private onTick?: (timeLeft: number) => void;

  constructor(seconds: number, gameId: string, onTick?: (timeLeft: number) => void) {
    this.initialSeconds = seconds;
    this.gameId = gameId;
    this.onTick = onTick;
  }

  public start(): void {
    if (this.intervalId !== null) return;
    const endTime = Date.now() + this.initialSeconds * 1000;

    this.onTick?.(this.initialSeconds);

    this.intervalId = window.setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.round((endTime - now) / 1000));

      this.onTick?.(remaining);

      if (remaining <= 0) {
        this.onTimeout();
      }
    }, 1000);
  }

  public stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private onTimeout(): void {
    this.stop();
    eventBus.emit('TASK_FINISHED', {
      gameId: this.gameId,
      outcome: 'timeout',
    });
  }

  public static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

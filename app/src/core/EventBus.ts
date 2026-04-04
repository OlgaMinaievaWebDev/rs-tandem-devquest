export type EventMap = {
  GAME_STARTED: { gameId: string; day: number };
  TASK_STARTED: { gameId: string; duration: number };
  TASK_CANCELLED: { gameId: string };
  TASK_FINISHED: { gameId: string; outcome: 'correct' | 'wrong' | 'timeout'; userAnswer: string };
  DAY_COMPLETED: { day: number };
  STRESS_CHANGED: { amount: number };
  RESTART_GAME: undefined;
};

type EventName = keyof EventMap;
type EventCallback<T> = (data: T) => void;

class EventBus {
  private listeners: {
    [K in EventName]?: Array<EventCallback<EventMap[K]>>;
  } = {};

  public on<K extends EventName>(event: K, callback: EventCallback<EventMap[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event]!.push(callback);
    return () => this.off(event, callback);
  }

  public emit<K extends EventName>(
    event: K,
    ...args: EventMap[K] extends undefined ? [payload?: undefined] : [payload: EventMap[K]]
  ): void {
    if (!this.listeners[event]) return;

    const payload = args[0] as EventMap[K];

    this.listeners[event]!.forEach((callback) => callback(payload));
  }

  public off<K extends EventName>(event: K, callback: EventCallback<EventMap[K]>): void {
    const callbacks = this.listeners[event];
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }
}

export const eventBus = new EventBus();

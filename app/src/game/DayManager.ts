import { eventBus, type EventMap } from '../core/EventBus';
import { store } from '../core/store';

export class DayManager {
  constructor() {
    this.init();
  }

  private init() {
    eventBus.on('TASK_FINISHED', (payload) => {
      this.handleTaskFinished(payload);
    });

    eventBus.on('DAY_COMPLETED', (payload) => {
      this.handleDayCompleted(payload.day);
    });
  }

  private handleTaskFinished(payload: EventMap['TASK_FINISHED']) {
    if (payload.outcome !== 'correct') {
      return;
    }
    const state = store.getState();
    const currentTasks = state.game.completedTasksToday;

    if (currentTasks.includes(payload.gameId)) {
      return;
    }

    const updatedTasks = [...currentTasks, payload.gameId];

    store.setState({
      game: {
        ...state.game,
        completedTasksToday: updatedTasks,
      },
    });

    if (updatedTasks.length >= 2) {
      eventBus.emit('DAY_COMPLETED', { day: state.game.day });
    }
  }

  private handleDayCompleted(completedDay: number) {
    const nextDay = completedDay + 1;

    store.setState({
      game: {
        ...store.getState().game,
        day: nextDay,
        completedTasksToday: [],
      },
    });
  }
}

export const dayManager = new DayManager();

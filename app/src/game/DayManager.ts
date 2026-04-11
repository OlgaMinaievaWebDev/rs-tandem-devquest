import { eventBus, type EventMap } from '../core/EventBus';
import { STAT_DELTAS } from '../core/state';
import { store } from '../core/store';

function getEndingMessage(xp: number): string {
  if (xp < 100) {
    return 'Junior Level: The project is delivered, but you barely survived. You made several mistakes and relied too heavily on the Senior developer. Your authority in the team is quite low right now, but every expert was once a beginner.';
  }

  if (xp <= 150) {
    return 'Middle Level: Solid result and good work! You maintained a healthy balance between independent decision-making and handling minor mistakes. The team respects your reliable contributions.';
  }

  return 'Senior/Lead Level: Flawless execution! The Lead is absolutely thrilled with your performance, and a promotion is on the horizon. You solved complex tasks almost perfectly without needing any hints.';
}

export class DayManager {
  constructor() {
    this.init();
  }

  private init() {
    eventBus.on('TASK_STARTED', () => this.handleTaskStarted());
    eventBus.on('TASK_CANCELLED', () => this.handleTaskCancelled());
    eventBus.on('TASK_FINISHED', (payload) => {
      this.handleTaskFinished(payload);
    });
  }

  private handleTaskStarted() {
    store.setState({ game: { ...store.getState().game, status: 'playing' } });
  }

  private handleTaskCancelled() {
    store.setState({ game: { ...store.getState().game, status: 'idle' } });
  }

  private handleTaskFinished(payload: EventMap['TASK_FINISHED']) {
    const state = store.getState();
    let { xp, health, stress } = state.game;
    const { completedTasksToday, day } = state.game;

    if (completedTasksToday.includes(payload.gameId)) {
      return;
    }

    const clamp = (v: number) => Math.max(0, Math.min(100, v));
    const delta = STAT_DELTAS[payload.outcome];

    if (payload.outcome === 'correct') {
      xp += delta.xp;
      health = clamp(health + delta.authority);
      stress = clamp(stress - delta.stress);
    } else {
      xp = Math.max(0, xp - delta.xp);
      health = clamp(health - delta.authority);
      stress = clamp(stress + delta.stress);
    }

    let updatedTasks = completedTasksToday;
    if (payload.outcome === 'correct') {
      updatedTasks = [...completedTasksToday, payload.gameId];
    }

    store.setState({
      game: {
        ...state.game,
        xp,
        health,
        stress,
        completedTasksToday: updatedTasks,
        status: 'idle',
      },
    });

    if (stress >= 100 || health <= 0) {
      eventBus.emit('GAME_OVER_DEFEAT');
      return;
    }
    if (day >= 7 && updatedTasks.length >= 2) {
      store.setState({
        game: {
          ...store.getState().game,
          completedTasksToday: [],
        },
      });
      const message = getEndingMessage(xp);
      eventBus.emit('GAME_OVER_VICTORY', { message });
      return;
    }
    if (updatedTasks.length >= 2) {
      const nextDay = day + 1;
      store.setState({
        game: {
          ...store.getState().game,
          day: nextDay,
          completedTasksToday: [],
        },
      });
      eventBus.emit('DAY_COMPLETED', { day: state.game.day });
      return;
    }
    eventBus.emit('SHOW_TASK_RESULT', payload);
  }
}

export const dayManager = new DayManager();

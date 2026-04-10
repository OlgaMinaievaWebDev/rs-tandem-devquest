import Router from './router/router';
import { store } from './core/store';
import { type AppState, type GameState, type Route, initialState, STAT_DELTAS } from './core/state';

import { renderStartScreen } from './ui/screens/startScreen';
import { renderAuthScreen } from './ui/screens/authScreen';
import renderDashboardScreen from './ui/screens/dashboard/dashboardScreen';
import renderDayScreen from './ui/screens/day/dayScreen';
import renderNotFoundScreen from './ui/screens/notFoundScreen';
import { getSession, onAuthStateChange, signIn, signUp, signOut } from './services/auth';
import Loader from './ui/components/loader';
import './styles/main.scss';
import { eventBus } from './core/EventBus';
import './game/DayManager';
import { sidebarTimer } from './ui/screens/dashboard/dashboardSideBar';
import renderGameScreen from './ui/screens/game/gameScreen';
import { showError } from './ui/components/toast';
import {
  loadGameStateFromDB,
  loadFromLocalBackup,
  saveGameStateToDB,
  clearLocalBackup,
  resetGameProgress,
} from './services/dbService';
import getErrorMessage from './utils/getErrorMessage';
import {
  ResultDialogWidget,
  type ResultDialogProps,
} from './ui/screens/widgets/resultDialogWidget';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app not found');

const spinner = new Loader();
document.body.appendChild(spinner.getElement());

let router: Router;

const validateRouteAccess = (state: AppState, targetRoute: Route): Route => {
  if (targetRoute.name !== 'day' && targetRoute.name !== 'game') {
    return targetRoute;
  }

  const actualDay = state.game.day;
  const completedTasks = state.game.completedTasksToday;

  if (targetRoute.day !== actualDay) {
    return { name: 'day', day: actualDay };
  }
  if (targetRoute.name === 'game' && completedTasks.includes(targetRoute.gameId)) {
    return { name: 'day', day: actualDay };
  }
  return targetRoute;
};

const handleRouterChange = async (route: Route) => {
  const state = store.getState();

  if (!state.isReady) {
    store.setState({ route });
    return;
  }

  const isLogged = !!state.user;
  const publicRoutes = ['start', 'auth'];

  if (!isLogged && !publicRoutes.includes(route.name)) {
    router.navigate({ name: 'auth' });
    return;
  }

  if (isLogged && route.name === 'auth') {
    router.navigate({ name: 'dashboard' });
    return;
  }

  if (route.name !== 'game') {
    sidebarTimer.stop();
  }

  if (isLogged) {
    const validRoute = validateRouteAccess(state, route);

    if (validRoute !== route) {
      router.navigate(validRoute);
      return;
    }
  }

  store.setState({ route });
};

async function initializeGameProgress(userId: string) {
  spinner.show('Restoring your progress...');
  try {
    const dbData = await loadGameStateFromDB(userId);
    const localBackup = loadFromLocalBackup(userId);

    let finalGameState = dbData?.gameState || localBackup?.data || {};

    if (dbData && localBackup && localBackup.timestamp > dbData.updatedAt) {
      finalGameState = localBackup.data;
      saveGameStateToDB(userId, finalGameState as GameState).catch((err) => {
        showError(getErrorMessage(err, 'Failed to restore progress'));
      });
    }

    store.setState({
      game: { ...store.getState().game, ...finalGameState },
    });
  } catch (err) {
    showError(getErrorMessage(err, 'Failed to restore progress'));
  } finally {
    const state = store.getState();
    const finalRoute = validateRouteAccess(state, state.route);

    store.setState({
      isReady: true,
      route: finalRoute,
    });

    if (finalRoute !== state.route) {
      router.navigate(finalRoute);
    }
    spinner.hide();
  }
}

async function bootstrap() {
  spinner.show('Starting DevQuest...');
  try {
    const session = await getSession();

    if (session?.user) {
      store.setState({
        user: {
          id: session.user.id,
          email: session.user.user_metadata.email || session.user.email || '',
          name: session.user.user_metadata?.name,
          avatarId: session.user.user_metadata?.avatar,
        },
      });

      await initializeGameProgress(session.user.id);
    } else {
      store.setState({ isReady: true });
      handleRouterChange(store.getState().route);
    }
  } catch (error) {
    showError(getErrorMessage(error, 'Auth check failed'));
    store.setState({ isReady: true });
    handleRouterChange(store.getState().route);
  } finally {
    spinner.hide();
  }

  onAuthStateChange(async (event, session) => {
    if (event === 'INITIAL_SESSION') {
      return;
    }

    if (event === 'SIGNED_IN') {
      if (session?.user) {
        store.setState({
          user: {
            id: session.user.id,
            email: session.user.user_metadata.email || session.user.email || '',
            name: session.user.user_metadata?.name,
            avatarId: session.user.user_metadata?.avatar,
          },
        });

        await initializeGameProgress(session.user.id);

        const currentRoute = store.getState().route.name;
        if (currentRoute === 'auth') {
          router.navigate({ name: 'dashboard' });
        }
      } else {
        store.setState({ isReady: true });
        handleRouterChange(store.getState().route);
      }
    } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      if (session?.user) {
        const currentUser = store.getState().user;
        if (currentUser) {
          store.setState({
            user: {
              ...currentUser,
              name: session.user.user_metadata?.name,
              avatarId: session.user.user_metadata?.avatar,
            },
          });
        }
      }
    } else if (event === 'SIGNED_OUT') {
      const currentState = store.getState();
      if (currentState.user) {
        clearLocalBackup(currentState.user.id);
      }
      store.setState({
        user: null,
        game: initialState.game,
        route: { name: 'auth' },
      });
      router.navigate({ name: 'auth' });
    }
  });
}

const handlers = {
  onStart: () => router.navigate({ name: 'auth' }),

  onSignIn: async (email: string, pass: string) => {
    try {
      store.setState({ user: null });
      spinner.show('Logging in...');
      await signIn(email, pass);
    } catch (error) {
      spinner.hide();
      showError(getErrorMessage(error, 'Login failed'));
    }
  },

  onSignUp: async (name: string, email: string, pass: string, avatar: string) => {
    try {
      store.setState({ user: null });
      spinner.show('Creating account...');
      await signUp(email, pass, name, avatar);
    } catch (error) {
      spinner.hide();
      showError(getErrorMessage(error, 'Registration failed'));
    }
  },

  onSignOut: async () => {
    try {
      spinner.show('Logging out...');
      await signOut();
    } catch (error) {
      showError(getErrorMessage(error, 'Logout failed'));
    } finally {
      spinner.hide();
    }
  },

  onSelectDay: (day: number) => router.navigate({ name: 'day', day }),

  onBackToDashboard: () => router.navigate({ name: 'dashboard' }),
};

const renderApp = (state: AppState) => {
  if (!state.isReady) {
    return;
  }

  switch (state.route.name) {
    case 'start':
      root.replaceChildren(renderStartScreen({ onStart: handlers.onStart }));
      break;

    case 'auth':
      root.replaceChildren(
        renderAuthScreen({
          onSignIn: handlers.onSignIn,
          onSignUp: handlers.onSignUp,
        }),
      );
      break;

    case 'dashboard':
      root.replaceChildren(
        renderDashboardScreen({
          currentDay: state.game.day,
          onSelectDay: handlers.onSelectDay,
          onSignOut: handlers.onSignOut,
        }),
      );
      break;

    case 'day':
      root.replaceChildren(
        renderDayScreen({
          day: state.route.day,
          completedTasks: state.game.completedTasksToday,
          onBackToDashboard: handlers.onBackToDashboard,
          onSignOut: handlers.onSignOut,
        }),
      );
      break;

    case 'game': {
      root.replaceChildren(
        renderGameScreen({
          day: state.route.day,
          gameId: state.route.gameId,
          skill: state.game.selectedSkills[0] || 'Frontend',
          onBack: () => router.navigate({ name: 'day', day: store.getState().game.day }),
          onSignOut: handlers.onSignOut,
        }),
      );
      break;
    }

    case 'not-found':
      root.replaceChildren(
        renderNotFoundScreen({
          onBackHome: () => router.navigate({ name: 'dashboard' }),
        }),
      );
      break;

    default:
      root.replaceChildren(renderStartScreen({ onStart: handlers.onStart }));
  }
};

const gameSyncChannel = new BroadcastChannel('game_sync_channel');

gameSyncChannel.onmessage = (event) => {
  if (event.data.type === 'SYNC_GAME_STATE') {
    store.setState({ game: event.data.game });
    const stateAfterSync = store.getState();

    const validRoute = validateRouteAccess(stateAfterSync, stateAfterSync.route);

    if (JSON.stringify(validRoute) !== JSON.stringify(stateAfterSync.route)) {
      router.navigate(validRoute);
    } else if (stateAfterSync.route.name !== 'game') {
      renderApp(stateAfterSync);
    }
  }
};

const syncGameProgress = () => {
  const state = store.getState();
  if (state.user) {
    saveGameStateToDB(state.user.id, state.game).catch((err) => {
      showError(getErrorMessage(err, 'Error saving progress'));
    });

    gameSyncChannel.postMessage({
      type: 'SYNC_GAME_STATE',
      game: store.getState().game,
    });
  }
};

router = new Router(handleRouterChange);

let currentRouteString: string | null = null;
let currentIsReady: boolean = false;

store.subscribe((state) => {
  const newRouteString = JSON.stringify(state.route);
  const isReadyChanged = currentIsReady !== state.isReady;

  if (currentRouteString !== newRouteString || isReadyChanged) {
    currentRouteString = newRouteString;
    currentIsReady = state.isReady;
    renderApp(state);
  }
});

router.init();
bootstrap();

eventBus.on('GAME_STARTED', (payload) => {
  router.navigate({ name: 'game', day: payload.day, gameId: payload.gameId });
});

eventBus.on('TASK_FINISHED', () => {
  sidebarTimer.stop();
  syncGameProgress();
});

eventBus.on('SHOW_TASK_RESULT', (payload) => {
  const { game } = store.getState();
  const { xp, health, stress, day } = game;

  let dialogProps: ResultDialogProps | null = null;
  const delta = STAT_DELTAS[payload.outcome];

  if (payload.outcome === 'correct') {
    dialogProps = {
      type: 'task-partial-success',
      day,
      message: 'Great job! Complete one more task to proceed to the next day.',
      stats: {
        stress: { value: `${stress}`, delta: `-${delta.stress}` },
        authority: { value: `${health}`, delta: `+${delta.authority}` },
        xp: { value: `${xp}`, delta: `+${delta.xp}` },
      },
      onAction: () => router.navigate({ name: 'day', day }),
    };
  } else if (payload.outcome === 'wrong') {
    dialogProps = {
      type: 'task-failed',
      day,
      message: payload.userAnswer ? payload.userAnswer : `Not quite right.`,
      stats: {
        stress: { value: `${stress}`, delta: `+${delta.stress}` },
        authority: { value: `${health}`, delta: `-${delta.authority}` },
        xp: { value: `${xp}`, delta: `-${delta.xp}` },
      },
      onAction: () => router.navigate({ name: 'day', day }),
    };
  } else if (payload.outcome === 'timeout') {
    dialogProps = {
      type: 'task-failed',
      day: game.day,
      message: "Time's up! You need to be faster under pressure.",
      stats: {
        stress: { value: `${stress}`, delta: `+${delta.stress}` },
        authority: { value: `${health}`, delta: `-${delta.authority}` },
        xp: { value: `${xp}`, delta: `-${delta.xp}` },
      },
      onAction: () => router.navigate({ name: 'day', day: game.day }),
    };
  }

  if (dialogProps) {
    const dialog = new ResultDialogWidget(root, dialogProps);
    dialog.show();
  }
});

eventBus.on('TASK_STARTED', (payload) => {
  sidebarTimer.play(payload.duration, payload.gameId);
});

eventBus.on('TASK_CANCELLED', () => {
  sidebarTimer.stop();
});

eventBus.on('DAY_COMPLETED', () => {
  const { day, stress, health, xp } = store.getState().game;

  const completedDay = day - 1;

  const dialog = new ResultDialogWidget(root, {
    type: 'day-complete',
    day: completedDay,
    stats: {
      stress: { value: `${stress}`, delta: `-${STAT_DELTAS.correct.stress}` },
      authority: { value: `${health}`, delta: `+${STAT_DELTAS.correct.authority}` },
      xp: { value: `${xp}`, delta: `+${STAT_DELTAS.correct.xp}` },
    },
    onAction: () => {
      router.navigate({ name: 'day', day });
    },
  });

  dialog.show();
});

let isResetting = false;

eventBus.on('RESTART_GAME', async (payload) => {
  const state = store.getState();
  if (!state.user || isResetting) return;

  isResetting = true;

  spinner.show('Resetting world...');

  try {
    await resetGameProgress(state.user.id);

    const newGameState = structuredClone(initialState.game);

    store.setState({
      game: newGameState,
    });

    gameSyncChannel.postMessage({
      type: 'SYNC_GAME_STATE',
      game: newGameState,
    });

    if (payload.changeView) {
      if (state.route.name === 'dashboard') {
        renderApp(store.getState());
      } else {
        router.navigate({ name: 'dashboard' });
      }
    }
  } catch (err) {
    showError(getErrorMessage(err, 'Failed to restart game'));
  } finally {
    spinner.hide();
    isResetting = false;
  }
});

eventBus.on('GAME_OVER_DEFEAT', () => {
  const { day, stress, health, xp } = store.getState().game;

  eventBus.emit('RESTART_GAME', { changeView: false });

  const dialog = new ResultDialogWidget(root, {
    type: 'game-over-defeat',
    message: "It looks like you're not ready yet. But this isn't the end — try again.",
    day,
    stats: {
      stress: { value: `${stress}` },
      authority: { value: `${health}` },
      xp: { value: `${xp}` },
    },
    onAction: () => {
      router.navigate({ name: 'dashboard' });
    },
  });

  dialog.show();
});

eventBus.on('GAME_OVER_VICTORY', (payload) => {
  eventBus.emit('RESTART_GAME', { changeView: false });
  const { day, stress, health, xp } = store.getState().game;

  const dialog = new ResultDialogWidget(root, {
    type: 'game-over-victory',
    message: payload.message,
    day,
    stats: {
      stress: { value: `${stress}` },
      authority: { value: `${health}` },
      xp: { value: `${xp}` },
    },
    onAction: () => {
      router.navigate({ name: 'dashboard' });
    },
  });

  dialog.show();
});

import Router from './router/router';
import { store } from './core/store';
import { type AppState, type GameState, type Route, initialState } from './core/state';

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
import { createDayResultScreen } from './ui/screens/dayResultScreen';
import { showError } from './ui/components/toast';
import { getErrorMessage } from './utils/getErrorMessage';
import {
  loadGameStateFromDB,
  loadFromLocalBackup,
  saveGameStateToDB,
  clearLocalBackup,
  resetGameProgress,
} from './services/dbService';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app not found');

const spinner = new Loader();
document.body.appendChild(spinner.getElement());

let router: Router;

const handleRouterChange = async (route: Route) => {
  const session = await getSession();
  const isLogged = !!session?.user;
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

  const state = store.getState();
  if (isLogged && !state.isReady) {
    store.setState({ route });
    return;
  }

  if (isLogged) {
    const actualCurrentDay = state.game.day;
    const completedTasks = state.game.completedTasksToday;

    if ((route.name === 'day' || route.name === 'game') && route.day !== actualCurrentDay) {
      router.navigate({ name: 'day', day: actualCurrentDay });
      return;
    }

    if (route.name === 'game' && completedTasks.includes(route.gameId)) {
      router.navigate({ name: 'day', day: actualCurrentDay });
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

    let finalGameState: Partial<GameState> = {};

    if (dbData && localBackup) {
      if (localBackup.timestamp > dbData.updatedAt) {
        finalGameState = localBackup.data;
        saveGameStateToDB(userId, finalGameState as GameState).catch((err) =>
          showError(getErrorMessage(err, 'Error saving progress')),
        );
      } else {
        finalGameState = dbData.gameState;
      }
    } else if (dbData) {
      finalGameState = dbData.gameState;
    } else if (localBackup) {
      finalGameState = localBackup.data;
    }

    store.setState({
      game: { ...store.getState().game, ...finalGameState },
    });
  } catch (err) {
    showError(getErrorMessage(err, 'Failed to restore progress'));
  } finally {
    store.setState({
      isReady: true,
    });
    handleRouterChange(store.getState().route);
    spinner.hide();
  }
}

const watchAuth = () => {
  onAuthStateChange(async (event, session) => {
    if (
      session?.user?.id &&
      store.getState().user?.id === session?.user?.id &&
      (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')
    ) {
      return;
    }

    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
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
      }
    } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      if (session?.user) {
        store.setState({
          user: {
            ...store.getState().user!,
            name: session.user.user_metadata?.name,
            avatarId: session.user.user_metadata?.avatar,
          },
        });
      }
    } else if (event === 'SIGNED_OUT') {
      const currentState = store.getState();
      if (currentState.user) {
        clearLocalBackup(currentState.user.id);
      }

      store.setState({ user: null, game: initialState.game, isReady: true });
      router.navigate({ name: 'auth' });
    }
  });
};

const handlers = {
  onStart: () => router.navigate({ name: 'auth' }),

  onSignIn: async (email: string, pass: string) => {
    try {
      spinner.show('Logging in...');
      await signIn(email, pass);
    } catch (error) {
      spinner.hide();
      showError(getErrorMessage(error, 'Login failed'));
    }
  },

  onSignUp: async (name: string, email: string, pass: string, avatar: string) => {
    try {
      spinner.show('Creating account...');
      await signUp(email, pass, name, avatar);
    } catch (error) {
      spinner.hide();
      showError(getErrorMessage(error, 'Login failed'));
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
          currentDay: store.getState().game.day,
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
watchAuth();

eventBus.on('GAME_STARTED', (payload) => {
  router.navigate({ name: 'game', day: payload.day, gameId: payload.gameId });
});

eventBus.on('TASK_FINISHED', (payload) => {
  sidebarTimer.stop();

  const state = store.getState();
  if (payload.outcome === 'correct' && state.game.completedTasksToday.length === 0) {
    return;
  }

  if (payload.outcome === 'timeout') {
    alert(`Timeout!`);
  } else if (payload.outcome === 'wrong') {
    alert(`You ${payload.outcome}! ${payload.userAnswer}`);
  } else if (payload.outcome === 'correct') {
    alert(`You ${payload.outcome}! ${payload.userAnswer}`);
  }

  if (state.user) {
    saveGameStateToDB(state.user.id, state.game).catch((err) =>
      showError(getErrorMessage(err, 'Error saving progress')),
    );
  }

  const currentDay = state.game.day;
  router.navigate({ name: 'day', day: currentDay });
});

eventBus.on('TASK_STARTED', (payload) => {
  sidebarTimer.play(payload.duration, payload.gameId);
});

eventBus.on('TASK_CANCELLED', () => {
  sidebarTimer.stop();
});

eventBus.on('DAY_COMPLETED', () => {
  const state = store.getState();
  const { day, stress, xp } = state.game;

  if (state.user) {
    saveGameStateToDB(state.user.id, state.game).catch((err) =>
      showError(getErrorMessage(err, 'Error saving progress')),
    );
  }

  root.append(
    createDayResultScreen({
      day: day - 1,
      stress,
      xpGained: xp,
      onNextDay: () => router.navigate({ name: 'day', day }),
    }),
  );
});

eventBus.on('RESTART_GAME', async () => {
  const state = store.getState();
  if (!state.user) return;

  spinner.show('Resetting world...');
  try {
    await resetGameProgress(state.user.id);

    store.setState({
      game: { ...initialState.game },
    });

    router.navigate({ name: 'dashboard' });
  } catch (err) {
    showError(getErrorMessage(err, 'Failed to restart game'));
  } finally {
    spinner.hide();
  }
});

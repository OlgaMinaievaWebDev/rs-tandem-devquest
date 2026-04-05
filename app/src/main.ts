import Router from './router/router';
import { store } from './core/store';
import type { AppState, Route } from './core/state';

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
import { getErrorMessage } from './utils/getErrorMessage';
import {
  ResultDialogWidget,
  type ResultDialogProps,
} from './ui/screens/widgets/resultDialogWidget';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app not found');

const spinner = new Loader();
document.body.appendChild(spinner.getElement());

let router: Router;

const watchAuth = () => {
  onAuthStateChange((event, session) => {
    if (
      event === 'INITIAL_SESSION' ||
      event === 'SIGNED_IN' ||
      event === 'TOKEN_REFRESHED' ||
      event === 'USER_UPDATED'
    ) {
      if (session?.user) {
        store.setState({
          user: {
            id: session.user.id,
            email: session.user.user_metadata.email || session.user.email || '',
            name: session.user.user_metadata?.name,
            avatarId: session.user.user_metadata?.avatar,
          },
        });

        const currentRoute = store.getState().route.name;
        if (currentRoute === 'auth') {
          router.navigate({ name: 'dashboard' });
        }
      }
    } else if (event === 'SIGNED_OUT') {
      store.setState({ user: null });
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
      showError(getErrorMessage(error, 'Login failed'));
    } finally {
      spinner.hide();
    }
  },

  onSignUp: async (name: string, email: string, pass: string, avatar: string) => {
    try {
      spinner.show('Creating account...');
      await signUp(email, pass, name, avatar);
    } catch (error) {
      showError(getErrorMessage(error, 'Login failed'));
    } finally {
      spinner.hide();
    }
  },

  onSignOut: async () => {
    try {
      spinner.show('Logging out...');
      await signOut();
    } catch (error) {
      showError(getErrorMessage(error, 'Login failed'));
    } finally {
      spinner.hide();
    }
  },

  onSelectDay: (day: number) => router.navigate({ name: 'day', day }),

  onBackToDashboard: () => router.navigate({ name: 'dashboard' }),
};

const renderApp = (state: AppState) => {
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

  if (isLogged) {
    const state = store.getState();
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

router = new Router(handleRouterChange);

let currentRouteString: string | null = null;

store.subscribe((state) => {
  const newRouteString = JSON.stringify(state.route);

  if (currentRouteString !== newRouteString) {
    currentRouteString = newRouteString;
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
  const game = state.game;

  let dialogProps: ResultDialogProps | null = null;

  if (payload.outcome === 'correct') {
    const completedCount = game.completedTasksToday.length;

    if (completedCount === 1) {
      dialogProps = {
        type: 'task-partial-success',
        day: game.day,
        message: 'Great job! Complete one more task to proceed to the next day.',
        stats: {
          stress: { value: `${game.stress}%`, delta: '+5%' },
          authority: { value: '4', delta: '+1' },
          xp: { value: `${game.xp}`, delta: '+20' },
        },
        onAction: () => router.navigate({ name: 'day', day: game.day }),
      };
    } else if (completedCount >= 2) {
      return;
    }
  } else {
    const failMsg =
      payload.outcome === 'timeout'
        ? "Time's up! You need to be faster under pressure."
        : `Not quite right. "${payload.userAnswer}" was incorrect. Review the concept and try again.`;

    dialogProps = {
      type: 'task-failed',
      day: game.day,
      message: failMsg,
      stats: {
        stress: { value: `${game.stress}%`, delta: '+15%' },
        authority: { value: '2', delta: '-1' },
        xp: { value: `${game.xp}`, delta: '-10' },
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
  const state = store.getState();
  const game = state.game;

  const dialog = new ResultDialogWidget(root, {
    type: 'day-complete',
    day: game.day - 1,
    stats: {
      stress: { value: `${game.stress}%` },
      authority: { value: '3', delta: '+1' },
      xp: { value: `${game.xp}`, delta: '+50' },
    },
    onAction: () => {
      router.navigate({ name: 'day', day: game.day });
    },
  });

  dialog.show();
});

setTimeout(() => {
  const state = store.getState();
  const game = state.game;

  const dialog = new ResultDialogWidget(root, {
    type: 'day-complete',
    day: game.day - 1,
    stats: {
      stress: { value: `${game.stress}%` },
      authority: { value: '3', delta: '+1' },
      xp: { value: `${game.xp}`, delta: '+50' },
    },
    onAction: () => {
      router.navigate({ name: 'day', day: game.day });
    },
  });

  dialog.show();
}, 300);

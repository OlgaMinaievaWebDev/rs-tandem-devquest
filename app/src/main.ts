import Router from './router/router';
import { store } from './core/store';
import type { AppState, Route } from './core/state';

import { renderStartScreen } from './ui/screens/startScreen';
import { renderAuthScreen } from './ui/screens/authScreen';
import renderDashboardScreen from './ui/screens/dashboard/dashboardScreen';
import renderDayScreen from './ui/screens/day/dayScreen';
import renderNotFoundScreen from './ui/screens/notFoundScreen';
import { getSession, onAuthStateChange, signIn, signUp, signOut } from './services/auth';
import { Loader } from './ui/components/loader';
import './styles/main.scss';

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
      console.error(error);
      alert(error instanceof Error ? error.message : 'Login failed');
    } finally {
      spinner.hide();
    }
  },

  onSignUp: async (name: string, email: string, pass: string, avatar: string) => {
    try {
      spinner.show('Creating account...');
      await signUp(email, pass, name, avatar);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      spinner.hide();
    }
  },

  onSignOut: async () => {
    try {
      spinner.show('Logging out...');
      await signOut();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Sign out failed');
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
          onSelectDay: handlers.onSelectDay,
          onSignOut: handlers.onSignOut,
        }),
      );
      break;

    case 'day':
      root.replaceChildren(
        renderDayScreen({
          day: state.route.day,
          onBackToDashboard: handlers.onBackToDashboard,
          onSignOut: handlers.onSignOut,
        }),
      );
      break;

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

  store.setState({ route });
};

router = new Router(handleRouterChange);

store.subscribe((state) => {
  renderApp(state);
});

router.init();
watchAuth();

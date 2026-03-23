import Router from './router/router';
import { store } from './core/store';
import type { AppState, Route } from './core/state';

import { renderStartScreen } from './ui/screens/startScreen';
import { renderAuthScreen } from './ui/screens/authScreen';
import renderDashboardScreen from './ui/screens/dashboard/dashboardScreen';
import renderDayScreen from './ui/screens/day/dayScreen';
import renderNotFoundScreen from './ui/screens/notFoundScreen';
import { getSession, onAuthStateChange, signIn, signUp, signOut } from './services/auth';
import './styles/main.scss';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app not found');

let router: Router;

const initAuth = async () => {
  const session = await getSession();

  if (session?.user) {
    router.navigate({ name: 'dashboard' });
  }
};

const watchAuth = () => {
  onAuthStateChange(() => {
    getSession()
      .then((session) => {
        if (session?.user) {
          store.setState({
            user: {
              id: session.user.id,
              email: session.user['user_metadata'].email || '',
              name: session.user['user_metadata']?.name,
              avatarId: session.user['user_metadata']?.avatar,
            },
          });
          router.navigate({ name: 'dashboard' });
          return;
        }

        router.navigate({ name: 'auth' });
      })
      .catch((error) => {
        console.error(error);
      });
  });
};

// --- WIRE HANDLERS ---
const handlers = {
  onStart: () => router.navigate({ name: 'auth' }),

  onSignIn: async (email: string, pass: string) => {
    try {
      await signIn(email, pass);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Login failed');
    }
  },

  onSignUp: async (name: string, email: string, pass: string, avatar: string) => {
    try {
      await signUp(email, pass, name, avatar);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Sign up failed');
    }
  },

  onSignOut: async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Sign out failed');
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

// --- INITIALIZE ROUTER & STORE ---
const handleRouterChange = (route: Route) => {
  store.setState({ route });
};

router = new Router(handleRouterChange);

// --- SUBSCRIBE TO STORE ---
store.subscribe((state) => {
  renderApp(state);
});

router.init();

initAuth().catch((error) => {
  console.error(error);
});

watchAuth();

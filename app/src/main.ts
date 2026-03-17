import Router from './router/router';
import { store } from './core/store';
import type { AppState, Route } from './core/state';

import { renderStartScreen } from './ui/screens/startScreen';
import { renderAuthScreen } from './ui/screens/authScreen';
import renderDashboardScreen from './ui/screens/dashboard/dashboardScreen';
import renderDayScreen from './ui/screens/day/dayScreen';
// import { createDayResultScreen } from './ui/screens/dayResultScreen';
import './styles/main.scss';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app not found');

let router: Router;

// --- WIRE HANDLERS ---
const handlers = {
  onStart: () => router.navigate({ name: 'dashboard' }),

  onSignIn: (_email: string, _pass: string) => {
    router.navigate({ name: 'dashboard' });
  },
  onSignUp: (name: string, email: string, _pass: string, _avatar: string) => {
    store.setState({ user: { id: Date.now().toString(), email, name } });
    router.navigate({ name: 'dashboard' });
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
        }),
      );
      break;

    case 'day':
      root.replaceChildren(
        renderDayScreen({
          day: state.route.name === 'day' ? state.route.day : 1, // TS check
          onBackToDashboard: handlers.onBackToDashboard,
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
let currentRouteName: string | null = null;

store.subscribe((state) => {
  if (currentRouteName !== state.route.name) {
    currentRouteName = state.route.name;
    renderApp(state);
  }
});

router.init();

if (window.location.hash === '' || window.location.hash === '#/') {
  router.navigate({ name: 'start' });
} else {
  renderApp(store.getState());
}

// root.append(
//   createDayResultScreen({
//     day: 1,
//     stress: 10,
//     xpGained: 100,
//     onNextDay: () => {
//       console.log('show next day');
//     },
//   }),
// );

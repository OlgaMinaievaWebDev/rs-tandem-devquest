import Router from './router/router';
import type { Route } from './core/state';
import { renderStartScreen } from './ui/screens/startScreen';
import renderDashboardScreen from './ui/screens/dashboard/dashboardScreen';
import './styles/main.scss';
import renderDayScreen from './ui/screens/day/dayScreen';
import renderNotFoundScreen from './ui/screens/notFoundScreen';
import { renderAuthScreen } from './ui/screens/authScreen';
import { getSession, onAuthStateChange, signIn, signUp } from './services/auth';
// import { createDayResultScreen } from './ui/screens/dayResultScreen';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app not found');

let router: Router; // ✅ declare first so render can use it

// const renderStart = () =>
//   renderStartScreen({
//     onStart: () => router.navigate({ name: 'dashboard' }),
//   });

const renderStart = () =>
  renderStartScreen({
    onStart: () => router.navigate({ name: 'auth' }),
  });

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

const render = (route: Route) => {
  switch (route.name) {
    case 'start':
      root.replaceChildren(renderStart());
      break;

    case 'auth':
      root.replaceChildren(
        renderAuthScreen({
          onSignIn: async (email, pass) => {
            try {
              await signIn(email, pass);
            } catch (error) {
              console.error(error);
              alert(error instanceof Error ? error.message : 'Login failed');
            }
          },
          onSignUp: async (name, email, pass, avatar) => {
            try {
              await signUp(email, pass, name, avatar);
            } catch (error) {
              console.error(error);
              alert(error instanceof Error ? error.message : 'Sign up failed');
            }
          },
        }),
      );
      break;

    case 'dashboard':
      root.replaceChildren(
        renderDashboardScreen({
          onSelectDay: (day: number) => router.navigate({ name: 'day', day }),
        }),
      );
      break;

    case 'day':
      root.replaceChildren(
        renderDayScreen({
          day: route.day,
          onBackToDashboard: () => router.navigate({ name: 'dashboard' }),
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
      root.replaceChildren(renderStart());
  }
};

const handleRouter = (route: Route) => render(route);

router = new Router(handleRouter); // ✅ assign after render exists
router.init();
initAuth().catch((error) => {
  console.error(error);
});
watchAuth();

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

import Router from './router/router';
import type { Route } from './core/state';
import { renderStartScreen } from './ui/screens/startScreen';
import renderDashboardScreen from './ui/screens/dashboard/dashboardScreen';
import renderDayScreen from './ui/screens/day/dayScreen';
import './styles/main.scss';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app not found');

let router: Router; // ✅ declare first so render can use it

const renderStart = () =>
  renderStartScreen({
    onStart: () => router.navigate({ name: 'dashboard' }),
  });
const render = (route: Route) => {
  switch (route.name) {
    case 'start':
      root.replaceChildren(renderStart());
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

    default:
      root.replaceChildren(renderStart());
  }
};

const handleRouter = (route: Route) => render(route);

router = new Router(handleRouter); // ✅ assign after render exists
router.init();

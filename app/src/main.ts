import Router from './router/router';
import type { Route } from './core/state';
import { renderStartScreen } from './ui/screens/startScreen';
import renderDashboardScreen from './ui/screens/dashboard/dashboardScreen';
import './styles/main.scss';
import { renderDayResultScreen } from './ui/screens/dayResultScreen';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app not found');

if (root) {
  // Temporary: Clear everything and show the result screen immediately
  root.replaceChildren(
    renderDayResultScreen({
      day: 1,
      stress: 0,
      stressChange: 40,
      xpGained: 150,
      onNextDay: () => console.log('Next day clicked'),
    }),
  );
}

// let router: Router; // ✅ declare first so render can use it

// const renderStart = () =>
//   renderStartScreen({
//     onStart: () => router.navigate({ name: 'dashboard' }),
//   });

// const render = (route: Route) => {
//   switch (route.name) {
//     case 'start':
//       root.replaceChildren(renderStart());
//       break;

//     case 'dashboard':
//       root.replaceChildren(
//         renderDashboardScreen({
//           onSelectDay: (day: number) => router.navigate({ name: 'day', day }),
//         }),
//       );
//       break;

//     case 'day':
//       root.replaceChildren(
//         renderDayScreen({
//           day: route.day,
//           onBackToDashboard: () => router.navigate({ name: 'dashboard' }),
//         }),
//       );
//       break;

//     default:
//       root.replaceChildren(renderStart());
//   }
// };

// const handleRouter = (route: Route) => render(route);

// router = new Router(handleRouter); // ✅ assign after render exists
// router.init();

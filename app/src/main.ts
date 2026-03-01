import Router from './router/router';
import './styles/main.scss';
import type { Route } from './core/state';

const root = document.querySelector<HTMLDivElement>('#app');

const render = (route: Route) => {
  if (!root) return;

  root.innerHTML = `
    <h1>DevQuest</h1>
    <p>Current route: <b>${route.name}</b></p>
    ${route.name === 'day' ? `<p>Day: ${route.day}</p>` : ''}
  `;
};

const handleRouter = (route: Route) => {
  render(route);
};

const router = new Router(handleRouter);

router.init();

router.navigate({ name: 'start' });

// test
// test
// test
// test
// test
// test
// test
// test

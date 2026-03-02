import Router from './router/router';
import type { Route } from './core/state';
import './styles/main.scss';
import { renderStartScreen } from './ui/screens/startScreen';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app not found');

const render = (route: Route) => {
  root.replaceChildren(
    renderStartScreen({
      onStart: () => console.log('Start clicked 🎮'),
    }),
  );
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

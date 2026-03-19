import type { Route } from '../core/state';

type OnRouteChange = (route: Route) => void;

export default class Router {
  private onRouteChange: OnRouteChange;

  constructor(onRouteChange: OnRouteChange) {
    this.onRouteChange = onRouteChange;
  }

  init(): void {
    window.addEventListener('hashchange', this.handleHashChange);
    this.handleHashChange();
  }

  navigate(route: Route): void {
    const hash = Router.routeToHash(route);
    const next = `#${hash}`;

    if (window.location.hash === next) {
      this.handleHashChange();
      return;
    }

    window.location.hash = hash;
  }

  private handleHashChange = (): void => {
    const path = window.location.hash.slice(1) || '/';

    const parts = path.split('/').filter((part) => part !== '');
    const parsedRoute = Router.parsePartsToRoute(parts);

    this.onRouteChange(parsedRoute);
  };

  private static parsePartsToRoute(parts: string[]): Route {
    if (parts.length === 0) return { name: 'start' };

    const [first, ...rest] = parts;

    switch (first) {
      case 'auth':
        return rest.length === 0 ? { name: 'auth' } : { name: 'not-found' };

      case 'dashboard':
        return rest.length === 0 ? { name: 'dashboard' } : { name: 'not-found' };

      case 'done':
        return rest.length === 0 ? { name: 'done' } : { name: 'not-found' };

      case 'day': {
        if (rest.length === 1) {
          const day = Number(rest[0]);
          if (Number.isInteger(day) && day >= 1 && day <= 7) {
            return { name: 'day', day };
          }
        }
        return { name: 'not-found' };
      }

      case '404':
        return { name: 'not-found' };

      default:
        return { name: 'not-found' };
    }
  }

  private static routeToHash(route: Route): string {
    switch (route.name) {
      case 'start':
        return '/';
      case 'auth':
        return '/auth';
      case 'dashboard':
        return '/dashboard';
      case 'done':
        return '/done';
      case 'day':
        return `/day/${route.day}`;
      case 'not-found':
        return '/404';
      default:
        throw new Error('Unknown route');
    }
  }
}

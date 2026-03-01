import type { Route } from '../core/state';

type OnRouteChange = (route: Route) => void;

export class Router {
  private onRouteChange: OnRouteChange;

  constructor(onRouteChange: OnRouteChange) {
    this.onRouteChange = onRouteChange;
  }

  init() {
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });

    this.handleHashChange();
  }

  navigate(route: Route) {
    const hash = this.routeToHash(route);
    window.location.hash = hash;
  }

  private handleHashChange() {
    let path = window.location.hash.slice(1);

    if (!path) {
      path = '/';
    }

    const parts = path.split('/').filter((part) => part !== '');
    const parsedRoute = this.parsePartsToRoute(parts);

    this.onRouteChange(parsedRoute);
  }

  private parsePartsToRoute(parts: string[]): Route {
    if (parts.length === 0) {
      return { name: 'start' };
    }

    const [first, ...rest] = parts;

    switch (first) {
      case 'auth':
        return { name: 'auth' };
      case 'dashboard':
        return { name: 'dashboard' };
      case 'done':
        return { name: 'done' };
      case 'day':
        if (rest.length === 1) {
          const dayStr = rest[0];
          const day = parseInt(dayStr, 10);
          if (!isNaN(day) && day >= 1 && day <= 7) {
            return { name: 'day', day };
          }
        }
        break;
      default:
        break;
    }

    return { name: 'start' };
  }

  private routeToHash(route: Route): string {
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
    }
  }
}

import type { AppState } from './state';
import { initialState } from './state';

export type Listener = (state: AppState) => void;

export function createStore(initial: AppState) {
  let state = initial;

  const listeners = new Set<Listener>();

  return {
    getState: (): AppState => state,

    setState: (patch: Partial<AppState>): void => {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener(state));
    },

    subscribe: (listener: Listener): (() => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const store = createStore(initialState);

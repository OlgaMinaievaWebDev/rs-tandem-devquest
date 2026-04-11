import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../core/store';
import type { AppState } from '../core/state';

describe('Store Logic', () => {
  // Matches your exact AppState interface
  const mockInitialState: AppState = {
    route: { name: 'start' },
    user: { id: '1', email: 'test@rs.school', name: 'Olga' },
    game: {
      day: 1,
      health: 100,
      stress: 0,
      xp: 0,
      selectedSkills: ['JavaScript'],
      status: 'idle',
      completedTasksToday: [],
    },
    isReady: false,
  };

  // Test 1: Initialization
  it('should return initial state when created', () => {
    const store = createStore(mockInitialState);
    expect(store.getState()).toEqual(mockInitialState);
  });

  // Test 2: Nested State Update
  it('should update game day correctly when setState is called', () => {
    const store = createStore(mockInitialState);
    store.setState({
      game: { ...mockInitialState.game, day: 2 },
    });
    expect(store.getState().game.day).toBe(2);
  });

  // Test 3: Subscription/Observer Pattern
  it('should notify listeners when state changes', () => {
    const store = createStore(mockInitialState);
    const listener = vi.fn();

    store.subscribe(listener);
    store.setState({ route: { name: 'dashboard' } });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        route: { name: 'dashboard' },
      }),
    );
  });

  // Test 4: Unsubscribe Logic
  it('should stop notifying listeners after unsubscription', () => {
    const store = createStore(mockInitialState);
    const listener = vi.fn();

    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setState({ game: { ...mockInitialState.game, health: 50 } });

    expect(listener).not.toHaveBeenCalled();
  });

  // Test 5: State Immutability
  it('should produce a new object reference on update', () => {
    const store = createStore(mockInitialState);
    const previousState = store.getState();

    store.setState({ xp: 10 } as any); // Small hack or partial update
    const newState = store.getState();

    expect(newState).not.toBe(previousState);
  });
});

export type SkillType = 'JavaScript' | 'Testing' | 'Design' | 'Architecture';

export type Route =
  | { name: 'start' }
  | { name: 'auth' }
  | { name: 'dashboard' }
  | { name: 'day'; day: number }
  | { name: 'done' };

export interface User {
  id: string;
  email: string;
  name?: string; // optional for flexibility (can be shown on dashboard if present)
}

export interface GameState {
  day: number;
  health: number;
  stress: number;
  xp: number;
  selectedSkills: SkillType[];
  status: 'idle' | 'playing' | 'completed';
}

export interface AppState {
  route: Route;
  user: User | null;
  game: GameState;
}

const defaultGameState: GameState = {
  day: 1,
  health: 100,
  stress: 0,
  xp: 0,
  selectedSkills: [],
  status: 'idle',
};

export const initialState: AppState = {
  route: { name: 'start' },
  user: null,
  game: defaultGameState,
};

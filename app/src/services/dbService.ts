import supabase from '../lib/supabase';
import type { GameState } from '../core/state';

const LOCAL_KEY = 'devquest_backup_';

export function saveToLocalBackup(userId: string, gameState: GameState) {
  const backup = {
    data: gameState,
    timestamp: Date.now(),
  };
  localStorage.setItem(LOCAL_KEY + userId, JSON.stringify(backup));
}

export function loadFromLocalBackup(userId: string): { data: GameState; timestamp: number } | null {
  const item = localStorage.getItem(LOCAL_KEY + userId);
  if (!item) return null;
  try {
    return JSON.parse(item);
  } catch {
    return null;
  }
}

export function clearLocalBackup(userId: string) {
  localStorage.removeItem(LOCAL_KEY + userId);
}

export async function saveGameStateToDB(userId: string, gameState: GameState) {
  saveToLocalBackup(userId, gameState);

  const { error } = await supabase
    .from('player_state')
    .update({
      day: gameState.day,
      health: gameState.health,
      stress: gameState.stress,
      xp: gameState.xp,
      selected_skills: gameState.selectedSkills,
      completed_tasks_today: gameState.completedTasksToday,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function loadGameStateFromDB(userId: string) {
  const { data, error } = await supabase
    .from('player_state')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error('Progress loading error');
  }

  if (data) {
    return {
      gameState: {
        day: data.day,
        health: data.health,
        stress: data.stress,
        xp: data.xp,
        selectedSkills: data.selected_skills,
        completedTasksToday: data.completed_tasks_today,
      } as Partial<GameState>,
      updatedAt: new Date(data.updated_at).getTime(),
    };
  }

  return null;
}

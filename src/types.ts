export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Position = {
  x: number;
  y: number;
};

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

export const GRID_SIZE = 20;

export const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  easy: 150,
  medium: 100,
  hard: 60,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

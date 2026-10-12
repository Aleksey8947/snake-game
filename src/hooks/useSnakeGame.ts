import { useState, useCallback, useEffect, useRef } from 'react';
import { Direction, Position, Difficulty, GameState, GRID_SIZE, DIFFICULTY_SPEEDS } from '../types';

const getRandomPosition = (snake: Position[]): Position => {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
};

const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export const useSnakeGame = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<number | null>(null);
  const snakeRef = useRef<Position[]>(INITIAL_SNAKE);
  const foodRef = useRef<Position>({ x: 15, y: 10 });
  const scoreRef = useRef(0);
  const gameStateRef = useRef<GameState>('idle');

  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const resetGame = useCallback(() => {
    const initialSnake = [...INITIAL_SNAKE];
    const initialFood = { x: 15, y: 10 };
    setSnake(initialSnake);
    setFood(initialFood);
    snakeRef.current = initialSnake;
    foodRef.current = initialFood;
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    scoreRef.current = 0;
    setScore(0);
    setGameState('idle');
    gameStateRef.current = 'idle';
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  const moveSnake = useCallback(() => {
    const currentSnake = snakeRef.current;
    const currentFood = foodRef.current;
    const currentDir = nextDirectionRef.current;
    directionRef.current = currentDir;

    const head = { ...currentSnake[0] };

    switch (currentDir) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameState('gameover');
      gameStateRef.current = 'gameover';
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    // Check self collision
    if (currentSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
      setGameState('gameover');
      gameStateRef.current = 'gameover';
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const newSnake = [head, ...currentSnake];
    let newFood = currentFood;
    let ate = false;

    if (head.x === currentFood.x && head.y === currentFood.y) {
      ate = true;
      newFood = getRandomPosition(newSnake);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
    snakeRef.current = newSnake;
    setFood(newFood);
    foodRef.current = newFood;

    if (ate) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      const newScore = scoreRef.current + points;
      setScore(newScore);
      scoreRef.current = newScore;
      
      setHighScore(currentHigh => {
        if (newScore > currentHigh) {
          localStorage.setItem('snakeHighScore', newScore.toString());
          return newScore;
        }
        return currentHigh;
      });
    }
  }, [difficulty]);

  const startGame = useCallback(() => {
    if (gameStateRef.current === 'gameover' || gameStateRef.current === 'idle') {
      const initialSnake = [...INITIAL_SNAKE];
      const initialFood = { x: 15, y: 10 };
      setSnake(initialSnake);
      setFood(initialFood);
      snakeRef.current = initialSnake;
      foodRef.current = initialFood;
      directionRef.current = 'RIGHT';
      nextDirectionRef.current = 'RIGHT';
      scoreRef.current = 0;
      setScore(0);
      setGameState('playing');
      gameStateRef.current = 'playing';
    }
  }, []);

  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      setGameState('paused');
      gameStateRef.current = 'paused';
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    } else if (gameStateRef.current === 'paused') {
      setGameState('playing');
      gameStateRef.current = 'playing';
    }
  }, []);

  const changeDirection = useCallback((newDir: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[newDir] !== directionRef.current) {
      nextDirectionRef.current = newDir;
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = window.setInterval(moveSnake, DIFFICULTY_SPEEDS[difficulty]);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState, difficulty, moveSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing' && gameStateRef.current !== 'paused') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          startGame();
          return;
        }
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (gameStateRef.current === 'playing') changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          if (gameStateRef.current === 'playing') changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          if (gameStateRef.current === 'playing') changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          if (gameStateRef.current === 'playing') changeDirection('RIGHT');
          break;
        case ' ':
        case 'Escape':
          e.preventDefault();
          if (gameStateRef.current === 'playing' || gameStateRef.current === 'paused') {
            togglePause();
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, togglePause, startGame, resetGame]);

  return {
    snake,
    food,
    gameState,
    score,
    highScore,
    difficulty,
    setDifficulty,
    startGame,
    togglePause,
    changeDirection,
    resetGame,
  };
};

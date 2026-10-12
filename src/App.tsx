import { useRef, useCallback } from 'react';
import { useSnakeGame } from './hooks/useSnakeGame';
import { GRID_SIZE, DIFFICULTY_LABELS, Difficulty, Direction } from './types';

function App() {
  const {
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
  } = useSnakeGame();

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipe = 30;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      changeDirection(dy > 0 ? 'DOWN' : 'UP');
    }
    touchStartRef.current = null;
  }, [changeDirection]);

  const handleDirectionButton = useCallback((dir: Direction) => {
    if (gameState === 'playing') {
      changeDirection(dir);
    }
  }, [gameState, changeDirection]);

  const cellPercent = 100 / GRID_SIZE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col items-center justify-center p-3 md:p-4 select-none overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-lg mb-3">
        <h1 className="text-2xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-3">
          🐍 Змейка
        </h1>
        
        {/* Score Board */}
        <div className="flex justify-between items-center bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-gray-700/50 shadow-lg">
          <div className="text-center flex-1">
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Счёт</div>
            <div className="text-lg md:text-xl font-bold text-emerald-400">{score}</div>
          </div>
          <div className="text-center flex-1 border-x border-gray-700/50">
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Рекорд</div>
            <div className="text-lg md:text-xl font-bold text-yellow-400">🏆 {highScore}</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Длина</div>
            <div className="text-lg md:text-xl font-bold text-cyan-400">{snake.length}</div>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div
        className="relative w-full max-w-lg aspect-square bg-gray-900/90 backdrop-blur-sm rounded-xl border-2 border-emerald-500/20 overflow-hidden shadow-2xl shadow-emerald-900/30"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(52,211,153,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(52,211,153,0.5) 1px, transparent 1px)
            `,
            backgroundSize: `${cellPercent}% ${cellPercent}%`,
          }}
        />

        {/* Food */}
        <div
          className="absolute rounded-full bg-red-500 shadow-lg shadow-red-500/60 animate-pulse transition-all duration-100"
          style={{
            width: `${cellPercent}%`,
            height: `${cellPercent}%`,
            left: `${food.x * cellPercent}%`,
            top: `${food.y * cellPercent}%`,
            padding: '10%',
          }}
        >
          <div className="w-full h-full rounded-full bg-red-400" />
        </div>

        {/* Snake */}
        {snake.map((segment, index) => {
          const isHead = index === 0;
          const opacity = isHead ? 1 : Math.max(0.45, 1 - index * 0.025);
          
          return (
            <div
              key={`snake-${index}`}
              className={`absolute transition-all duration-[50ms] ${
                isHead 
                  ? 'bg-emerald-400 rounded-md shadow-lg shadow-emerald-400/40 z-10' 
                  : 'bg-emerald-500 rounded-[3px]'
              }`}
              style={{
                width: `${cellPercent}%`,
                height: `${cellPercent}%`,
                left: `${segment.x * cellPercent}%`,
                top: `${segment.y * cellPercent}%`,
                opacity,
                transform: isHead ? 'scale(0.92)' : 'scale(0.88)',
              }}
            >
              {isHead && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-[40%] h-[40%] rounded-full bg-emerald-300/60" />
                </div>
              )}
            </div>
          );
        })}

        {/* Overlay: Idle */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20 animate-[fadeIn_0.3s_ease]">
            <div className="text-5xl md:text-6xl mb-3 animate-bounce">🐍</div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Змейка</h2>
            <p className="text-gray-400 text-xs md:text-sm mb-4">Выберите сложность и начните</p>
            <div className="flex gap-2 mb-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    difficulty === d
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                      : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105 active:scale-95"
            >
              ▶ Начать игру
            </button>
            <p className="text-gray-500 text-[10px] md:text-xs mt-3">Space / Enter или свайп</p>
          </div>
        )}

        {/* Overlay: Paused */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20">
            <div className="text-5xl mb-3">⏸️</div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Пауза</h2>
            <button
              onClick={togglePause}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all active:scale-95"
            >
              ▶ Продолжить
            </button>
            <p className="text-gray-500 text-xs mt-3">Space / Esc</p>
          </div>
        )}

        {/* Overlay: Game Over */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm z-20">
            <div className="text-5xl mb-3">💀</div>
            <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-2">Игра окончена!</h2>
            <p className="text-lg text-white mb-1">
              Счёт: <span className="text-emerald-400 font-bold">{score}</span>
            </p>
            {score >= highScore && score > 0 && (
              <p className="text-yellow-400 text-sm mb-2 animate-pulse font-medium">🎉 Новый рекорд!</p>
            )}
            <div className="flex gap-2 mb-3 mt-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    difficulty === d
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all active:scale-95"
            >
              🔄 Играть снова
            </button>
            <p className="text-gray-500 text-xs mt-3">Space / Enter</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full max-w-lg mt-3">
        {/* Action buttons */}
        <div className="flex justify-center gap-3 mb-3">
          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="px-4 py-2 bg-gray-700/80 text-gray-200 rounded-lg hover:bg-gray-600 transition-all text-sm font-medium border border-gray-600/50 active:scale-95"
            >
              ⏸️ Пауза
            </button>
          )}
          {(gameState === 'playing' || gameState === 'paused') && (
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-gray-700/80 text-gray-200 rounded-lg hover:bg-gray-600 transition-all text-sm font-medium border border-gray-600/50 active:scale-95"
            >
              🔄 Заново
            </button>
          )}
        </div>

        {/* Mobile D-pad */}
        <div className="flex flex-col items-center md:hidden">
          <div className="grid grid-cols-3 gap-1.5 w-36">
            <div />
            <button
              onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('UP'); }}
              className="aspect-square bg-gray-700/80 rounded-xl flex items-center justify-center text-xl text-white active:bg-emerald-600 active:scale-90 transition-all border border-gray-600/50 shadow-md"
            >
              ▲
            </button>
            <div />
            <button
              onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('LEFT'); }}
              className="aspect-square bg-gray-700/80 rounded-xl flex items-center justify-center text-xl text-white active:bg-emerald-600 active:scale-90 transition-all border border-gray-600/50 shadow-md"
            >
              ◀
            </button>
            <div className="aspect-square bg-gray-800/30 rounded-xl flex items-center justify-center border border-gray-700/30">
              <div className="w-2 h-2 rounded-full bg-gray-600" />
            </div>
            <button
              onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('RIGHT'); }}
              className="aspect-square bg-gray-700/80 rounded-xl flex items-center justify-center text-xl text-white active:bg-emerald-600 active:scale-90 transition-all border border-gray-600/50 shadow-md"
            >
              ▶
            </button>
            <div />
            <button
              onTouchStart={(e) => { e.preventDefault(); handleDirectionButton('DOWN'); }}
              className="aspect-square bg-gray-700/80 rounded-xl flex items-center justify-center text-xl text-white active:bg-emerald-600 active:scale-90 transition-all border border-gray-600/50 shadow-md"
            >
              ▼
            </button>
            <div />
          </div>
        </div>

        {/* Desktop hints */}
        <div className="hidden md:flex justify-center gap-6 text-xs text-gray-500 mt-1">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-400 text-[10px]">←↑↓→</kbd>
            движение
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-400 text-[10px]">Space</kbd>
            пауза
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-400 text-[10px]">R</kbd>
            рестарт
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;

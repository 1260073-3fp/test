# Implementation Plan: Game Project Bug Fixes & Code Quality

## Phase 1: Critical Bug Fixes (Week 1)

### Day 1: Immediate Cleanup
**Task 1.1: Remove Python code from game1.html**
```bash
# Steps:
1. Open gamehub.github.io/game1.html
2. Delete lines 1-3 (Python imports)
3. Delete lines 296-299 (HTML() function call)
4. Save file
5. Test that snake game still works
```

**Task 1.2: Add games.json error handling**
```javascript
// File: gamehub.github.io/main.js
// Modify loadGames() function (lines 11-24)
async function loadGames() {
  try {
    const res = await fetch('games.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    ALL_GAMES = data.games || [];
    renderGames(ALL_GAMES);
    setupFilters();
  } catch(e) {
    console.error('Failed to load games.json', e);
    // Show user-friendly error message
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = `
      <div class="error-message" style="grid-column:1/-1; text-align:center; padding:40px;">
        <h3>無法載入遊戲資料</h3>
        <p>請檢查網路連線或稍後再試</p>
        <button onclick="location.reload()">重新載入</button>
      </div>
    `;
    ALL_GAMES = [];
    setupFilters(); // Still setup filters for when games load later
  }
}
```

### Day 2: Fix Memory Leaks
**Task 2.1: Clean up event listeners in game engines**
```javascript
// File: gamehub.github.io/main.js
// Update each game engine's stop() method:

// Click game (around line 140)
return { 
  stop(){ 
    running = false; 
    canvas.removeEventListener('click', onClick);
    // Cancel animation frame
    cancelAnimationFrame(animationFrameId);
  }, 
  // ... rest
}

// Type game (around line 190)
return {
  stop(){ 
    if (timer) clearInterval(timer); 
    input.removeEventListener('input', onInput); 
  },
  // ... rest
}

// Move game (around line 217)
return {
  stop(){ 
    running = false; 
    window.removeEventListener('keydown', onKey);
    cancelAnimationFrame(animationFrameId);
  },
  // ... rest
}
```

**Task 2.2: Fix type game timer bug**
```javascript
// File: gamehub.github.io/main.js
// Modify initTypeGame() function
let timer = null;
let animationFrameId = null;

function nextWord(){
  // ... existing code ...
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    // ... timer logic ...
  }, 100);
}

return {
  stop(){ 
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    input.removeEventListener('input', onInput); 
  },
  // ... rest
}
```

## Phase 2: Code Quality Improvements (Week 2)

### Day 3: Extract Constants and Configuration
**Task 3.1: Create constants file**
```javascript
// File: gamehub.github.io/constants.js
const GAME_CONFIG = {
  CLICK_GAME: {
    DURATION: 5000, // ms
    MIN_RADIUS: 14,
    MAX_RADIUS: 32,
    CANVAS_WIDTH: 420,
    CANVAS_HEIGHT: 260
  },
  TYPE_GAME: {
    WORDS: ['apple','banana','orange','grape','melon','peach','lemon','berry'],
    MAX_ROUNDS: 3,
    TIME_PER_WORD: 8000 // ms
  },
  MOVE_GAME: {
    TIME_LIMIT: 60, // seconds
    CELL_SIZE: 20,
    CANVAS_WIDTH: 420,
    CANVAS_HEIGHT: 260
  },
  MEMORY_GAME: {
    GRID_SIZE: 4,
    CARD_SIZE: 72 // px
  }
};

const STORAGE_KEYS = {
  PROGRESS_PREFIX: 'game-progress-'
};

const ERROR_MESSAGES = {
  LOAD_GAMES: '無法載入遊戲資料，請檢查網路連線',
  LOCAL_STORAGE: '無法儲存遊戲進度'
};
```

**Task 3.2: Update main.js to use constants**
```javascript
// File: gamehub.github.io/main.js
// Add at top:
import { GAME_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from './constants.js';

// Update all hardcoded values to use constants
```

### Day 4: Add JSDoc Documentation
**Task 4.1: Document all major functions**
```javascript
/**
 * Loads games data from games.json and renders them
 * @async
 * @function loadGames
 * @returns {Promise<void>}
 * @throws {Error} When games.json cannot be loaded
 */
async function loadGames() {
  // ... implementation
}

/**
 * Renders game cards to the grid
 * @function renderGames
 * @param {Array<Object>} games - Array of game objects
 */
function renderGames(games) {
  // ... implementation
}

/**
 * Initializes a click-based game
 * @function initClickGame
 * @param {HTMLElement} container - Container element for the game
 * @param {Object} game - Game configuration object
 * @returns {Object} Game engine with stop() and restart() methods
 */
function initClickGame(container, game) {
  // ... implementation
}
```

### Day 5: Implement ESLint and Prettier
**Task 5.1: Create configuration files**
```json
// File: gamehub.github.io/.eslintrc.json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off",
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

```json
// File: gamehub.github.io/.prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Task 5.2: Add npm scripts**
```json
// File: gamehub.github.io/package.json
{
  "name": "mini-game-library",
  "version": "1.0.0",
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "validate": "npm run lint && npm run format"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

## Phase 3: Architecture Improvements (Week 3)

### Day 6: Refactor Game Engine Pattern
**Task 6.1: Create base GameEngine class**
```javascript
// File: gamehub.github.io/GameEngine.js
class GameEngine {
  constructor(container, gameConfig) {
    this.container = container;
    this.config = gameConfig;
    this.isRunning = false;
    this.eventListeners = [];
  }

  start() {
    this.isRunning = true;
    this.setup();
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
    this.cleanup();
  }

  restart() {
    this.stop();
    this.start();
  }

  setup() {
    // To be implemented by subclasses
  }

  cleanup() {
    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  gameLoop() {
    // To be implemented by subclasses
  }

  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  saveProgress(score) {
    try {
      const key = `game-progress-${this.config.id}`;
      const prev = JSON.parse(localStorage.getItem(key) || '{}');
      prev.best = Math.max(prev.best || 0, score);
      localStorage.setItem(key, JSON.stringify(prev));
    } catch (error) {
      console.warn('Failed to save progress:', error);
    }
  }
}

export default GameEngine;
```

**Task 6.2: Create ClickGameEngine class**
```javascript
// File: gamehub.github.io/engines/ClickGameEngine.js
import GameEngine from '../GameEngine.js';

class ClickGameEngine extends GameEngine {
  setup() {
    // Setup canvas, initialize variables
    // Use this.addEventListener() for automatic cleanup
  }

  gameLoop() {
    // Game loop implementation
  }
}

export default ClickGameEngine;
```

### Day 7: Update main.js to use new architecture
**Task 7.1: Refactor openGame function**
```javascript
// File: gamehub.github.io/main.js
import ClickGameEngine from './engines/ClickGameEngine.js';
import TypeGameEngine from './engines/TypeGameEngine.js';
// ... other engines

function openGame(game) {
  const modal = document.getElementById('gameModal');
  modal.setAttribute('aria-hidden','false');
  document.getElementById('modalTitle').textContent = game.title;
  const area = document.getElementById('gameArea');
  area.innerHTML = '';
  
  let engine;
  switch (game.type){
    case 'click': 
      engine = new ClickGameEngine(area, game);
      break;
    case 'type': 
      engine = new TypeGameEngine(area, game);
      break;
    // ... other cases
  }
  
  currentEngine = engine;
  engine.start();
}
```

## Phase 4: Integration & Testing (Week 4)

### Day 8: Integrate Standalone Games
**Task 8.1: Convert snake game to game hub format**
1. Extract game logic from game1.html into separate JS file
2. Create game configuration in games.json
3. Create SnakeGameEngine class
4. Test integration

### Day 9: Add Comprehensive Error Handling
**Task 9.1: Implement error boundary for game engine**
```javascript
// File: gamehub.github.io/main.js
function openGame(game) {
  try {
    // ... existing code ...
  } catch (error) {
    console.error('Failed to open game:', error);
    const area = document.getElementById('gameArea');
    area.innerHTML = `
      <div class="error">
        <h3>遊戲載入失敗</h3>
        <p>${game.title} 暫時無法遊玩</p>
        <button onclick="closeModal()">關閉</button>
      </div>
    `;
  }
}
```

### Day 10: Final Testing and Polish
**Task 10.1: Cross-browser testing**
- Test in Chrome, Firefox, Safari
- Test on mobile devices
- Test with screen readers

**Task 10.2: Performance testing**
- Check memory usage with Chrome DevTools
- Measure load times
- Test with slow network simulation

## 🛠️ Required Tools Setup

### 1. Node.js Environment
```bash
# In gamehub.github.io directory
npm init -y
npm install --save-dev eslint prettier
```

### 2. Git Hooks (Optional)
```bash
# Create pre-commit hook
echo '#!/bin/sh
npm run validate
' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 3. VS Code Extensions
- ESLint
- Prettier
- Live Server (for testing)

## 📋 Checklist for Each Phase

### Phase 1 Checklist
- [ ] Python code removed from game1.html
- [ ] games.json error handling implemented
- [ ] Event listener cleanup in all game engines
- [ ] Timer bugs fixed in type game
- [ ] Memory game restart bug fixed

### Phase 2 Checklist
- [ ] Constants extracted to separate file
- [ ] JSDoc comments added to all functions
- [ ] ESLint configuration created
- [ ] Prettier configuration created
- [ ] Code formatted according to style guide

### Phase 3 Checklist
- [ ] GameEngine base class created
- [ ] Individual game engine classes created
- [ ] main.js refactored to use new architecture
- [ ] All games working with new system

### Phase 4 Checklist
- [ ] Standalone games integrated into hub
- [ ] Comprehensive error handling added
- [ ] Cross-browser testing completed
- [ ] Performance testing completed

## 🚨 Risk Mitigation

1. **Risk**: Refactoring breaks existing functionality
   **Mitigation**: Create comprehensive test suite before refactoring

2. **Risk**: New architecture too complex
   **Mitigation**: Start with minimal viable refactor, iterate

3. **Risk**: Time constraints
   **Mitigation**: Prioritize critical bugs first, nice-to-haves later

## 📈 Success Metrics

1. **Code Quality**: ESLint errors reduced to 0
2. **Performance**: No memory leaks detected
3. **Reliability**: All games work without crashes
4. **Maintainability**: New games can be added in < 1 hour

## 🎯 Immediate Next Steps

1. **Start with Phase 1, Day 1 tasks**
2. **Test each fix thoroughly before moving on**
3. **Commit changes frequently with descriptive messages**
4. **Document any issues encountered for future reference**

This plan provides a structured approach to improving your game project's code quality and fixing bugs while maintaining existing functionality.
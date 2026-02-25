(function(){
  let ALL_GAMES = [];
  let currentEngine = null;

  function escapeHTML(s){
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  async function loadGames(){
    try{
      const res = await fetch('games.json');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      ALL_GAMES = data.games || [];
      renderGames(ALL_GAMES);
      setupFilters();
    }catch(e){
      console.error('Failed to load games.json', e);
      ALL_GAMES = [];
      // Show user-friendly error message
      const grid = document.getElementById('gamesGrid');
      grid.innerHTML = `
        <div class="error-message" style="grid-column:1/-1; text-align:center; padding:40px; color:var(--muted);">
          <h3 style="color:var(--accent); margin-bottom:12px;">無法載入遊戲資料</h3>
          <p style="margin-bottom:16px;">請檢查網路連線或稍後再試</p>
          <button onclick="location.reload()" style="padding:8px 16px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer;">
            重新載入
          </button>
        </div>
      `;
      // Still setup filters (they won't do anything but at least they're initialized)
      setupFilters();
    }
  }

  function renderGames(games){
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = '';
    games.forEach(g => {
      const card = document.createElement('article');
      card.className = 'card';
      const cover = document.createElement('div');
      cover.className = 'cover';
      cover.style.background = `linear-gradient(135deg, ${g.cover?.[0]||'#999'} 0%, ${g.cover?.[1]||'#ccc'} 100%)`;
      cover.setAttribute('aria-label', g.title + ' cover');
      const body = document.createElement('div');
      body.className = 'card-body';
      body.innerHTML = `
        <h3 class="card-title">${escapeHTML(g.title)}</h3>
        <p class="card-desc">${escapeHTML(g.description)}</p>
        <div class="card-meta">
          <span class="badge category">${escapeHTML(g.category)}</span>
          <span class="badge difficulty">${escapeHTML(g.difficulty)}</span>
        </div>
        <button class="playBtn" data-id="${g.id}" aria-label="Play ${escapeHTML(g.title)}">Play</button>
      `;
      card.appendChild(cover);
      card.appendChild(body);
      grid.appendChild(card);
    });
    grid.querySelectorAll('.playBtn').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const g = ALL_GAMES.find(x => x.id === id);
      openGame(g);
    }));
  }

  function setupFilters(){
    const searchBox = document.getElementById('searchBox');
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const typeFilter = document.getElementById('typeFilter');
    const clearBtn = document.getElementById('clearFilters');

    function apply(){
      const q = searchBox.value.trim().toLowerCase();
      const cat = categoryFilter.value;
      const diff = difficultyFilter.value;
      const t = typeFilter.value;
      const filtered = ALL_GAMES.filter(g => {
        if (q && !(g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))) return false;
        if (cat && g.category !== cat) return false;
        if (diff && g.difficulty !== diff) return false;
        if (t && g.type !== t) return false;
        return true;
      });
      renderGames(filtered);
    }
    searchBox.addEventListener('input', apply);
    categoryFilter.addEventListener('change', apply);
    difficultyFilter.addEventListener('change', apply);
    typeFilter.addEventListener('change', apply);
    clearBtn.addEventListener('click', () => {
      searchBox.value = '';
      categoryFilter.value = '';
      difficultyFilter.value = '';
      typeFilter.value = '';
      renderGames(ALL_GAMES);
    });
  }

  function openGame(game){
    const modal = document.getElementById('gameModal');
    modal.setAttribute('aria-hidden','false');
    document.getElementById('modalTitle').textContent = game.title;
    const area = document.getElementById('gameArea');
    area.innerHTML = '';
    let engine;
    switch (game.type){
      case 'click': engine = initClickGame(area, game); break;
      case 'type': engine = initTypeGame(area, game); break;
      case 'move': engine = initMoveGame(area, game); break;
      case 'memory': engine = initMemoryGame(area, game); break;
      default: area.textContent = 'Unsupported game type'; return;
    }
    currentEngine = engine;
  }

  function closeModal(){
    const modal = document.getElementById('gameModal');
    modal.setAttribute('aria-hidden','true');
    document.getElementById('gameArea').innerHTML = '';
    if (currentEngine && currentEngine.stop) currentEngine.stop();
    currentEngine = null;
  }

  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('restartGame').addEventListener('click', () => currentEngine && currentEngine.restart && currentEngine.restart());

  function initClickGame(container, game){
    container.innerHTML = `
      <canvas id="canvasClick" width="420" height="260" aria-label="${escapeHTML(game.title)} play area" style="border:1px solid #ccc"></canvas>
      <div id="clickStats" class="stats" style="margin-top:6px;font-family:monospace;">
        Time: <span id="timeLeftClick">5.00</span>s • Score: <span id="scoreClick">0</span>
      </div>
    `;
    const canvas = document.getElementById('canvasClick');
    const ctx = canvas.getContext('2d');
    let score = 0, running = true;
    let t0 = performance.now();
    const duration = 5000;
    let x=60, y=60, r=20;
    let animationFrameId = null;
    
    function spawn(){ x = 40 + Math.random()*(canvas.width-80); y = 40 + Math.random()*(canvas.height-80); r = 14 + Math.random()*18; }
    function draw(){ ctx.clearRect(0,0,canvas.width, canvas.height); ctx.fillStyle='#f6f6f6'; ctx.fillRect(0,0,canvas.width, canvas.height); ctx.fillStyle='#e74c3c'; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); }
    function loop(now){
      if(!running) return;
      const elapsed = now - t0;
      const left = Math.max(0, (duration - elapsed)/1000);
      document.getElementById('timeLeftClick').textContent = left.toFixed(2);
      if (left <= 0){
        end();
        return;
      }
      draw();
      animationFrameId = requestAnimationFrame(loop);
    }
    function onClick(e){ const rect = canvas.getBoundingClientRect(); const px = e.clientX - rect.left; const py = e.clientY - rect.top; const dx = px - x, dy = py - y; if (dx*dx + dy*dy <= r*r){ score++; document.getElementById('scoreClick').textContent = score; spawn(); } }
    function end(){
      running = false;
      canvas.removeEventListener('click', onClick);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      container.innerHTML += `<div class="final" style="padding:6px 0;">結束，得分：${score} 點</div>`;
      saveProgress(game.id, score);
    }
    canvas.addEventListener('click', onClick);
    spawn();
    animationFrameId = requestAnimationFrame(loop);
    
    return {
      stop(){
        running = false;
        canvas.removeEventListener('click', onClick);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      },
      restart(){
        score = 0;
        document.getElementById('scoreClick').textContent = score;
        t0 = performance.now();
        running = true;
        container.querySelectorAll('.final').forEach(n=>n.remove());
        spawn();
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(loop);
      }
    }
  }

  function initTypeGame(container, game){
    const words = ['apple','banana','orange','grape','melon','peach','lemon','berry'];
    container.innerHTML = `
      <div class="typing-area" style="padding:8px;">
        <div id="wordToType" style="font-size:2rem; margin-bottom:8px;"></div>
        <input id="typeInput" aria-label="Type the word" style="font-size:1.4rem; padding:6px 8px; width:100%;">
        <div id="typeStatus" aria-live="polite" style="margin-top:6px;"></div>
      </div>
    `;
    const wordEl = document.getElementById('wordToType');
    const input = document.getElementById('typeInput');
    const status = document.getElementById('typeStatus');
    let rounds = 0, maxRounds = 3, score = 0, currentWord = '';
    let timer = null;
    
    function nextWord(){
      currentWord = words[Math.floor(Math.random()*words.length)];
      wordEl.textContent = currentWord;
      input.value = '';
      input.focus();
      const start = performance.now();
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      timer = setInterval(() => {
        const elapsed = performance.now() - start;
        const left = Math.max(0, 8000 - elapsed) / 1000;
        status.textContent = `Time left: ${left.toFixed(2)}s`;
        if (left <= 0){
          clearInterval(timer);
          timer = null;
          rounds++;
          if (rounds >= maxRounds) endGame(); else nextWord();
        }
      }, 100);
    }
    
    function endGame(){
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      input.removeEventListener('input', onInput);
      status.textContent = 'Completed!';
      container.innerHTML += `<div class="final" style="padding:6px 0;">完成，得分：${score} 點</div>`;
      saveProgress(game.id, score);
    }
    
    function onInput(){
      if (input.value.trim() === currentWord){
        score++;
        rounds++;
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        if (rounds >= maxRounds) endGame(); else nextWord();
      }
    }
    
    input.addEventListener('input', onInput);
    nextWord();
    
    return {
      stop(){
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        input.removeEventListener('input', onInput);
      },
      restart(){
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        rounds = 0;
        score = 0;
        status.textContent = '';
        input.removeEventListener('input', onInput);
        input.addEventListener('input', onInput);
        nextWord();
      }
    }
  }

  function initMoveGame(container, game){
    container.innerHTML = `
      <canvas id="canvasMove" width="420" height="260" tabindex="0" aria-label="${escapeHTML(game.title)} play area" style="border:1px solid #ccc;"></canvas>
      <div class="stats" style="margin-top:6px; font-family:monospace;">
        Time: <span id="moveTime">60</span>s • Score: <span id="moveScore">0</span>
      </div>
    `;
    const canvas = document.getElementById('canvasMove');
    const ctx = canvas.getContext('2d');
    const cell = 20; const cols = Math.floor(canvas.width / cell); const rows = Math.floor(canvas.height / cell);
    let player = { x: 0, y: 0 }; let goal = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) };
    let score = 0; let timeLeft = 60; let running = true; let last = performance.now();
    let animationFrameId = null;
    
    function draw(){
      ctx.clearRect(0,0,canvas.width, canvas.height);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0,0,canvas.width, canvas.height); // grid
      ctx.strokeStyle = '#ddd';
      for(let i=0;i<=cols;i++){
        ctx.beginPath();
        ctx.moveTo(i*cell,0);
        ctx.lineTo(i*cell, canvas.height);
        ctx.stroke();
      }
      for(let j=0;j<=rows;j++){
        ctx.beginPath();
        ctx.moveTo(0, j*cell);
        ctx.lineTo(canvas.width, j*cell);
        ctx.stroke();
      }
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(goal.x*cell+3, goal.y*cell+3, cell-6, cell-6);
      ctx.fillStyle = '#3498db';
      ctx.fillRect(player.x*cell+3, player.y*cell+3, cell-6, cell-6);
    }
    
    function loop(now){
      if(!running) return;
      const dt = (now - last)/1000;
      last = now;
      timeLeft -= dt;
      document.getElementById('moveTime').textContent = Math.max(0, Math.ceil(timeLeft)).toString();
      if (timeLeft<=0){
        end();
        return;
      }
      draw();
      animationFrameId = requestAnimationFrame(loop);
    }
    
    function onKey(e){
      let moved=false;
      if(e.key==='ArrowLeft' && player.x>0){
        player.x--; moved=true;
      } else if(e.key==='ArrowRight' && player.x<cols-1){
        player.x++; moved=true;
      } else if(e.key==='ArrowUp' && player.y>0){
        player.y--; moved=true;
      } else if(e.key==='ArrowDown' && player.y<rows-1){
        player.y++; moved=true;
      }
      if(moved){
        if (player.x===goal.x && player.y===goal.y){
          score++;
          document.getElementById('moveScore').textContent = score;
          goal.x = Math.floor(Math.random()*cols);
          goal.y = Math.floor(Math.random()*rows);
        }
        draw();
      }
    }
    
    function end(){
      running = false;
      window.removeEventListener('keydown', onKey);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      container.innerHTML += `<div class="final" style="padding:6px 0;">結束，得分：${score} 點</div>`;
      saveProgress(game.id, score);
    }
    
    window.addEventListener('keydown', onKey);
    draw();
    animationFrameId = requestAnimationFrame(loop);
    
    return {
      stop(){
        running = false;
        window.removeEventListener('keydown', onKey);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      },
      restart(){
        score=0;
        timeLeft=60;
        document.getElementById('moveScore').textContent = score;
        last = performance.now();
        running = true;
        goal.x = Math.floor(Math.random()*cols);
        goal.y = Math.floor(Math.random()*rows);
        container.querySelectorAll('.final').forEach(n=>n.remove());
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(loop);
      }
    }
  }

  function initMemoryGame(container, game){
    container.innerHTML = `<div id="memoryGrid" class="memory-grid" aria-label="Memory grid"></div>`;
    const grid = document.getElementById('memoryGrid');
    const size = 4; const total = size*size; const pairs = total/2; const base = ['🍎','🍊','🍋','🍉'];
    
    // Create a fresh deck
    let deck = base.slice(0, pairs).concat(base.slice(0, pairs));
    for(let i=deck.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    grid.style.gridTemplateColumns = `repeat(${size}, 72px)`;
    let first=null, second=null, lock=false, matches=0, score=0;
    
    function createGame() {
      // Reset state
      first = null;
      second = null;
      lock = false;
      matches = 0;
      score = 0;
      
      // Clear grid
      grid.innerHTML = '';
      
      // Shuffle deck
      deck = base.slice(0, pairs).concat(base.slice(0, pairs));
      for(let i=deck.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      
      // Create cards
      deck.forEach((val, idx)=>{
        const cell = document.createElement('button');
        cell.className='memory-card';
        cell.style.width='72px';
        cell.style.height='72px';
        cell.dataset.index=idx;
        cell.dataset.value=val;
        cell.textContent='';
        
        cell.addEventListener('click', ()=>{
          if(lock || cell.textContent) return;
          cell.textContent = val;
          
          if(!first){
            first = cell;
          } else {
            second = cell;
            lock = true;
            if (first.dataset.value === second.dataset.value){
              first.disabled = true;
              second.disabled = true;
              matches += 2;
              score++;
              first=null;
              second=null;
              lock=false;
              if (matches===total){
                container.innerHTML += `<div class="final" style="padding:6px 0;">完成！得分：${score} 對</div>`;
                saveProgress(game.id, score);
              }
            } else {
              setTimeout(()=>{
                first.textContent='';
                second.textContent='';
                first=null;
                second=null;
                lock=false;
              }, 600);
            }
          }
        });
        grid.appendChild(cell);
      });
    }
    
    createGame();
    
    return {
      stop(){ grid.innerHTML=''; },
      restart(){
        container.querySelectorAll('.final').forEach(n=>n.remove());
        createGame();
      }
    }
  }

  function saveProgress(id, score){
    const key = 'game-progress-' + id;
    try{
      const prev = JSON.parse(localStorage.getItem(key) || '{}');
      prev.best = Math.max(prev.best || 0, score);
      localStorage.setItem(key, JSON.stringify(prev));
    }catch(_){ }
  }

  // bootstrap
  loadGames();
})();

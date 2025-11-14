const boardSize = 20;
const board = document.getElementById("game-board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");

const overlay = document.getElementById("overlay");
const finalScoreEl = document.getElementById("final-score");
const retryBtn = document.getElementById("retry-btn");
const endBtn = document.getElementById("end-btn");

let snake, direction, apple, gift, giftTimer;
let score, speed, gameInterval, isPaused, gameOverState, applesEaten;

function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
  ];
  direction = { x: 0, y: 0 };
  apple = randomApple();
  gift = null;
  giftTimer = null;
  score = 0;
  speed = 250;
  applesEaten = 0;
  isPaused = true;
  gameOverState = false;
  scoreEl.textContent = "Score: 0";
  statusEl.textContent = "Press arrow or W/A/S/D to start";
  clearInterval(gameInterval);
  createBoard();
  draw();
}

function createBoard() {
  board.innerHTML = "";
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      board.appendChild(cell);
    }
  }
}

function draw() {
  const cells = board.querySelectorAll(".cell");
  cells.forEach(c => (c.className = "cell"));

  // Apple
  const appleIndex = apple.y * boardSize + apple.x;
  cells[appleIndex].classList.add("apple");

  // Gift
  if (gift) {
    const giftIndex = gift.y * boardSize + gift.x;
    cells[giftIndex].classList.add("gift");
  }

  // Snake
  snake.forEach((part, i) => {
    const idx = part.y * boardSize + part.x;
    if (cells[idx]) {
      cells[idx].classList.add("snake");
      if (i === 0) cells[idx].classList.add("head");
    }
  });
}

function randomApple() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
  } while (
    snake.some(s => s.x === pos.x && s.y === pos.y) ||
    (gift && gift.x === pos.x && gift.y === pos.y)
  );
  return pos;
}

function randomGift() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
  } while (
    snake.some(s => s.x === pos.x && s.y === pos.y) ||
    (apple && apple.x === pos.x && apple.y === pos.y)
  );
  return pos;
}

function moveSnake() {
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  // Wall or self collision
  if (
    head.x < 0 ||
    head.x >= boardSize ||
    head.y < 0 ||
    head.y >= boardSize ||
    snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    triggerGameOver();
    return;
  }

  snake.unshift(head);

  // Eat apple
  if (head.x === apple.x && head.y === apple.y) {
    score += 5;
    applesEaten++;
    speed *= 0.95;
    apple = randomApple();
    scoreEl.textContent = `Score: ${score}`;
    restartLoop();

    // Every 3 apples => spawn special gift
    if (applesEaten % 3 === 0) spawnGift();
  }
  // Eat gift
  else if (gift && head.x === gift.x && head.y === gift.y) {
    score += 20;
    gift = null;
    clearTimeout(giftTimer);
    scoreEl.textContent = `Score: ${score}`;
  } else {
    snake.pop();
  }

  draw();
}

function spawnGift() {
  gift = randomGift();
  draw();

  // Remove gift after 5 seconds
  clearTimeout(giftTimer);
  giftTimer = setTimeout(() => {
    gift = null;
    draw();
  }, 5000);
}

function restartLoop() {
  clearInterval(gameInterval);
  gameInterval = setInterval(moveSnake, speed);
}

function pauseGame() {
  if (gameOverState) return;
  if (isPaused) {
    isPaused = false;
    restartLoop();
    statusEl.textContent = "Press SPACE to stop";
  } else {
    isPaused = true;
    clearInterval(gameInterval);
    statusEl.textContent = "⏸ Paused (Press SPACE to resume)";
  }
}

function triggerGameOver() {
  clearInterval(gameInterval);
  clearTimeout(giftTimer);
  gameOverState = true;
  isPaused = true;
  statusEl.textContent = "💀 Game Over!";
  finalScoreEl.textContent = `Your score: ${score}`;
  overlay.classList.remove("hidden");
}

function startGame() {
  if (gameOverState) return; // wait for retry confirmation
  if (!isPaused) return;
  isPaused = false;
  statusEl.textContent = "Press SPACE to stop";
  restartLoop();
}

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (key === " " || key === "spacebar") {
    pauseGame();
    return;
  }

  const dirMap = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  if (dirMap[key]) {
    const newDir = dirMap[key];
    if (
      snake.length > 1 &&
      newDir.x === -direction.x &&
      newDir.y === -direction.y
    )
      return;
    direction = newDir;
    startGame();
  }
});

// Popup buttons
retryBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  initGame();
});

endBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  statusEl.textContent = "Game ended. Refresh to play again.";
  gameOverState = true;
});

initGame();

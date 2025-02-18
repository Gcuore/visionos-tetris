'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;
let board = [];
let currentPiece = null;
let gameInterval;
let score = 0;
let touchStartX = 0,
  touchStartY = 0,
  touchEndX = 0,
  touchEndY = 0;

const tetrominoes = {
  I: {
    rotations: [
      [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 }
      ],
      [
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 }
      ]
    ],
    color: "#c0c0c0"
  },
  J: {
    rotations: [
      [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: -1 }
      ],
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: -1 }
      ],
      [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 }
      ],
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 1 }
      ]
    ],
    color: "#ffb347"
  },
  L: {
    rotations: [
      [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: -1 }
      ],
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 }
      ],
      [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: 1 }
      ],
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: -1 }
      ]
    ],
    color: "#ff6961"
  },
  O: {
    rotations: [
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 },
        { x: 1, y: -1 }
      ]
    ],
    color: "#fdfd96"
  },
  S: {
    rotations: [
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: -1, y: -1 },
        { x: 0, y: -1 }
      ],
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 }
      ]
    ],
    color: "#77dd77"
  },
  Z: {
    rotations: [
      [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: -1 },
        { x: 1, y: -1 }
      ],
      [
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 1 }
      ]
    ],
    color: "#ffb6c1"
  },
  T: {
    rotations: [
      [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: -1 }
      ],
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 0 }
      ],
      [
        { x: -1, y: 0 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 }
      ],
      [
        { x: 0, y: -1 },
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 }
      ]
    ],
    color: "#dda0dd"
  }
};

function initBoard() {
  board = [];
  for (let y = 0; y < ROWS; y++) {
    const row = [];
    for (let x = 0; x < COLS; x++) {
      row.push(null);
    }
    board.push(row);
  }
}

function spawnNewPiece() {
  const types = Object.keys(tetrominoes);
  const randType = types[Math.floor(Math.random() * types.length)];
  const piece = {
    type: randType,
    rotation: 0,
    x: Math.floor(COLS / 2),
    y: 0
  };
  if (!isValidMove(piece, 0, 0, piece.rotation)) {
    clearInterval(gameInterval);
    showAdModal(() => {
      initGame();
    });
    return;
  }
  currentPiece = piece;
}

function isValidMove(piece, offsetX, offsetY, newRotation) {
  const shape = tetrominoes[piece.type].rotations[newRotation];
  for (const block of shape) {
    const newX = piece.x + block.x + offsetX;
    const newY = piece.y + block.y + offsetY;
    if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
    if (newY >= 0 && board[newY][newX]) return false;
  }
  return true;
}

function lockPiece() {
  const shape = tetrominoes[currentPiece.type].rotations[currentPiece.rotation];
  for (const block of shape) {
    const x = currentPiece.x + block.x;
    const y = currentPiece.y + block.y;
    if (y >= 0) board[y][x] = tetrominoes[currentPiece.type].color;
  }
  clearLines();
  spawnNewPiece();
}

function clearLines() {
  let linesCleared = 0;
  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== null)) {
      board.splice(y, 1);
      board.unshift(new Array(COLS).fill(null));
      linesCleared++;
      y++; 
    }
  }
  if (linesCleared > 0) {
    score += linesCleared * 10;
    const scoreEl = document.getElementById("score");
    if (scoreEl) scoreEl.innerText = "Score: " + score;
  }
}

function movePiece(offsetX, offsetY) {
  if (isValidMove(currentPiece, offsetX, offsetY, currentPiece.rotation)) {
    currentPiece.x += offsetX;
    currentPiece.y += offsetY;
    draw();
  } else if (offsetY === 1) {
    lockPiece();
    draw();
  }
}

function rotatePiece() {
  const newRotation =
    (currentPiece.rotation + 1) %
    tetrominoes[currentPiece.type].rotations.length;
  if (isValidMove(currentPiece, 0, 0, newRotation)) {
    currentPiece.rotation = newRotation;
    draw();
  }
}

function gameTick() {
  movePiece(0, 1);
}

function draw() {
  const boardGroup = document.getElementById("board-group");
  boardGroup.innerHTML = "";
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        rect.setAttribute("x", x * BLOCK_SIZE);
        rect.setAttribute("y", y * BLOCK_SIZE);
        rect.setAttribute("width", BLOCK_SIZE);
        rect.setAttribute("height", BLOCK_SIZE);
        rect.setAttribute("fill", board[y][x]);
        rect.setAttribute("stroke", "rgba(0,0,0,0.2)");
        rect.setAttribute("rx", "4");
        boardGroup.appendChild(rect);
      }
    }
  }
  const pieceGroup = document.getElementById("piece-group");
  pieceGroup.innerHTML = "";
  const shape = tetrominoes[currentPiece.type].rotations[currentPiece.rotation];
  for (const block of shape) {
    const x = (currentPiece.x + block.x) * BLOCK_SIZE;
    const y = (currentPiece.y + block.y) * BLOCK_SIZE;
    if (currentPiece.y + block.y >= 0) {
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", BLOCK_SIZE);
      rect.setAttribute("height", BLOCK_SIZE);
      rect.setAttribute("fill", tetrominoes[currentPiece.type].color);
      rect.setAttribute("stroke", "rgba(0,0,0,0.2)");
      rect.setAttribute("rx", "4");
      pieceGroup.appendChild(rect);
    }
  }
}

function initGame() {
  score = 0;
  const scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.innerText = "Score: " + score;
  initBoard();
  const container = document.getElementById("game-container");
  if (container) {
    container.classList.add("fade-in");
    setTimeout(() => container.classList.remove("fade-in"), 500);
  }
  spawnNewPiece();
  draw();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameTick, 500);
}

function showAdModal(callback) {
  const modalOverlay = document.getElementById("modal-overlay");
  if (!modalOverlay) return;
  modalOverlay.classList.add("show");
  const closeButton = modalOverlay.querySelector(".close-btn");
  function handleClose() {
    modalOverlay.classList.remove("show");
    closeButton.removeEventListener("click", handleClose);
    if (typeof callback === "function") callback();
  }
  closeButton.addEventListener("click", handleClose);
}

function handleTouchStart(e) {
  const touch = e.changedTouches[0];
  touchStartX = touch.screenX;
  touchStartY = touch.screenY;
}

function handleTouchEnd(e) {
  const touch = e.changedTouches[0];
  touchEndX = touch.screenX;
  touchEndY = touch.screenY;
  handleGesture();
}

function handleGesture() {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return; 
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) movePiece(1, 0);
    else movePiece(-1, 0);
  } else {
    if (dy > 0) movePiece(0, 1);
    else rotatePiece();
  }
}

document.getElementById("left-btn").addEventListener("click", () =>
  movePiece(-1, 0)
);
document.getElementById("right-btn").addEventListener("click", () =>
  movePiece(1, 0)
);
document.getElementById("down-btn").addEventListener("click", () =>
  movePiece(0, 1)
);
document.getElementById("rotate-btn").addEventListener("click", () =>
  rotatePiece()
);

document.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(e.key)) {
    e.preventDefault();
    if (e.key === "ArrowLeft") movePiece(-1, 0);
    else if (e.key === "ArrowRight") movePiece(1, 0);
    else if (e.key === "ArrowDown") movePiece(0, 1);
    else if (e.key === "ArrowUp") rotatePiece();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  showAdModal(() => {
    initGame();
  });

  const gameContainer = document.getElementById("game-container");
  if (gameContainer) {
    gameContainer.addEventListener("touchstart", handleTouchStart, false);
    gameContainer.addEventListener("touchend", handleTouchEnd, false);
  }

  document.querySelectorAll('.dpad-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      button.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
});
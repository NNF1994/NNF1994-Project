const canvasSnake = document.getElementById('snake');
const ctxSnake = canvasSnake.getContext('2d');

const box = 20;
const canvasSize = 400;
let snake = [];
let food = {};
let score = 0;
// Initialize from global window object if existing, otherwise 0
window.higherScoreSnake = window.higherScoreSnake || 0;
let d;
let gameInterval;
let isSnakeGameOver = false;
let isSnakePaused = true;

// Initialize Game
function initSnakeGame() {
    snake = [];
    snake[0] = { x: 9 * box, y: 10 * box };
    score = 0;
    d = null;
    isSnakeGameOver = false;
    isSnakePaused = false;

    createFood();
    document.getElementById('snake-score').innerText = score;
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('new-high-score').classList.add('hidden'); // Reset input visibility

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(drawSnakeGame, 100);
}

// Create Food
function createFood() {
    food = {
        x: Math.floor(Math.random() * (canvasSize / box)) * box,
        y: Math.floor(Math.random() * (canvasSize / box)) * box
    };
    // Ensure food doesn't spawn on snake
    for (let i = 0; i < snake.length; i++) {
        if (food.x === snake[i].x && food.y === snake[i].y) {
            createFood();
        }
    }
}

// Draw Game
function drawSnakeGame() {
    if (isSnakePaused || isSnakeGameOver) return;

    // Background
    ctxSnake.fillStyle = "#000";
    ctxSnake.fillRect(0, 0, canvasSize, canvasSize);

    // Draw Snake
    for (let i = 0; i < snake.length; i++) {
        ctxSnake.fillStyle = (i === 0) ? "#00FFCC" : "#FF0055";
        ctxSnake.fillRect(snake[i].x, snake[i].y, box, box);

        ctxSnake.strokeStyle = "#000";
        ctxSnake.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw Food
    ctxSnake.fillStyle = "#FFFF00";
    ctxSnake.fillRect(food.x, food.y, box, box);

    // Old Head Position
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Direction
    if (d === "LEFT") snakeX -= box;
    if (d === "UP") snakeY -= box;
    if (d === "RIGHT") snakeX += box;
    if (d === "DOWN") snakeY += box;

    // Eat Food
    if (snakeX === food.x && snakeY === food.y) {
        score++;
        document.getElementById('snake-score').innerText = score;
        document.getElementById('snake-score').innerText = score;
        if (score > window.higherScoreSnake) {
            window.higherScoreSnake = score;
            localStorage.setItem('snakeHigherScore_v10', window.higherScoreSnake);
            // No longer saving to local storage here as script.js handles the global submission
            // But we can locally assume it's the new high score until server confirms
        }
        createFood();
    } else {
        // Remove Tail
        snake.pop();
    }

    // New Head
    let newHead = { x: snakeX, y: snakeY };

    // Game Over Rules
    if (snakeX < 0 || snakeX >= canvasSize || snakeY < 0 || snakeY >= canvasSize || collision(newHead, snake)) {
        clearInterval(gameInterval);
        snakeGameOver();
        return;
    }

    snake.unshift(newHead);
}

// Collision Detection
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

// Controls
document.addEventListener("keydown", direction);

function direction(event) {
    if (isSnakePaused || isSnakeGameOver) return;

    let key = event.keyCode;
    if ([37, 38, 39, 40].includes(key)) {
        event.preventDefault();
    }

    if (key === 37 && d !== "RIGHT") d = "LEFT";
    else if (key === 38 && d !== "DOWN") d = "UP";
    else if (key === 39 && d !== "LEFT") d = "RIGHT";
    else if (key === 40 && d !== "UP") d = "DOWN";
}

// Game Over
function snakeGameOver() {
    isSnakeGameOver = true;

    // Update and Show Game Over Screen
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-score').innerText = score;
    document.getElementById('higher-score-display').innerText = window.higherScoreSnake;
    document.getElementById('game-over').classList.remove('hidden');

    const shareText = `I just scored ${score} playing NNF 1994 Snake! Can you beat me? $NNF1994 #NNF1994`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    document.getElementById('share-x').onclick = () => window.open(shareUrl, '_blank');

    // Check for leaderboard eligibility (must beat global high score)
    const globalHighScore = window.getGlobalHighScore ? window.getGlobalHighScore('snake') : 0;
    if (score > 0 && score > globalHighScore) {
        if (window.showHighScoreInput) window.showHighScoreInput(score);
    }
}

// Export functions
window.startSnake = initSnakeGame;
window.pauseSnake = () => { isSnakePaused = true; };
window.resumeSnake = () => { if (!isSnakeGameOver) isSnakePaused = false; };

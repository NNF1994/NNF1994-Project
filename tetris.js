const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

// Tetromino definitions
const pieces = 'ILJOTSZ';
const colors = [
    null,
    '#FF0055', // I - Red
    '#00FFCC', // L - Cyan
    '#FFFF00', // J - Yellow
    '#0000FF', // O - Blue
    '#FF00FF', // T - Magenta
    '#00FF00', // S - Green
    '#FFA500', // Z - Orange
];

function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 5, 0],
            [5, 5, 5],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);

                // Retro grid effect
                context.lineWidth = 0.05;
                context.strokeStyle = '#000';
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const piecesStr = 'ILJOTSZ';
    player.matrix = createPiece(piecesStr[piecesStr.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        gameOver();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }

    // Update Higher Score if needed
    if (player.score > player.higherScore) {
        player.higherScore = player.score;
        localStorage.setItem('tetrisHigherScore', player.higherScore);
    }
}

function updateScore() {
    const scoreElement = document.getElementById('tetris-score');
    if (scoreElement) {
        scoreElement.innerText = player.score;
    }
}

function gameOver() {
    isGameOver = true;

    // Update and Show Game Over Screen
    document.getElementById('final-score').innerText = player.score;
    document.getElementById('higher-score-display').innerText = player.higherScore;
    document.getElementById('game-over').classList.remove('hidden');

    const shareText = `I just scored ${player.score} playing NNF 1994 Tetris! Can you beat me? $NNF1994 #NNF1994`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    document.getElementById('share-x').onclick = () => window.open(shareUrl, '_blank');

    // Check for leaderboard eligibility (must beat global high score)
    const globalHighScore = window.getGlobalHighScore ? window.getGlobalHighScore('tetris') : 0;
    if (player.score > 0 && player.score > globalHighScore) {
        if (window.showHighScoreInput) window.showHighScoreInput(player.score);
    }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isGameOver = false;
let isPaused = true;

function update(time = 0) {
    if (isPaused || isGameOver) return;

    // Handle first frame initialization
    if (lastTime === 0) {
        lastTime = time;
    }

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    higherScore: 0,
};
window.player = player;

document.addEventListener('keydown', event => {
    // Prevent scrolling if the game canvas is visible
    if (canvas.offsetParent !== null && [37, 38, 39, 40].includes(event.keyCode)) {
        event.preventDefault();
    }

    if (isPaused || isGameOver) return;

    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 38) {
        playerRotate(1);
    }
});

// Game Control Functions
function startGame() {
    console.log('Starting Tetris...');
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    isGameOver = false;
    isPaused = false;

    // Reset timing variables
    dropCounter = 0;
    lastTime = 0;

    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('new-high-score').classList.add('hidden'); // Reset input visibility
    playerReset();
    requestAnimationFrame(update);
}

function pauseGame() {
    isPaused = true;
}

function resumeGame() {
    if (!isGameOver) {
        isPaused = false;
        update();
    }
}

// Export for script.js
window.startTetris = startGame;
window.pauseTetris = pauseGame;

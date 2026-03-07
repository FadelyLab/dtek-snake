/* -------- CONFIG -------- */
const COLS = 24;
const ROWS = 7;
const TOTAL = COLS * ROWS;        // 168
const SPEED = 250;
const BLINK_MS = 500;

let snake;
let direction;
let apple = null;
let running = false;
let gameOver = false;

let tickTimer = null;
let blinkTimer = null;

/* ----------- HELPERS ------------ */
function cell(id) {
    return document.getElementById(String(id));
}

function clearClasses() {
    for (let i = 1; i <= TOTAL; i++) {
        const el = cell(i);
        if (!el) continue;

        el.classList.remove("cell-scheduled");
        el.classList.remove("cell-scheduled-maybe");

        if (!snake.includes(i) && i !== apple) {
            el.classList.add("cell-non-scheduled");
        }
    }
}

function setSnakeVisibility(show) {
    for (let id = 1; id <= TOTAL; id++) {
        if (!snake.includes(id)) continue;
        const el = cell(id);
        if (!el) continue;

        el.classList.remove("cell-non-scheduled", "cell-scheduled-maybe", "cell-scheduled");
        el.classList.add(show ? "cell-scheduled" : "cell-non-scheduled");
    }
}

function draw() {
    clearClasses();

    setSnakeVisibility(true);

    if (apple) {
        const el = cell(apple);
        if (el) {
            el.classList.remove("cell-non-scheduled", "cell-scheduled");
            el.classList.add("cell-scheduled-maybe");
        }
    }
}

function idToRC(id) {
    id -= 1;
    return { row: Math.floor(id / COLS), col: id % COLS };
}

function rcToId(row, col) {
    return row * COLS + col + 1;
}

function placeApple() {
    if (apple) {
        const old = cell(apple);
        if (old) {
            old.classList.remove("cell-scheduled-maybe");
            old.classList.add("cell-non-scheduled");
        }
    }

    while (true) {
        const pos = Math.floor(Math.random() * TOTAL) + 1;
        if (!snake.includes(pos)) {
            apple = pos;
            const el = cell(pos);
            if (el) {
                el.classList.remove("cell-non-scheduled");
                el.classList.add("cell-scheduled-maybe");
            }
            break;
        }
    }
}

function tick() {
    if (!running || gameOver) return;

    const head = snake[0];
    let { row, col } = idToRC(head);

    if (direction === 1) col++;
    if (direction === -1) col--;
    if (direction === COLS) row++;
    if (direction === -COLS) row--;

    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
        onGameOver();
        return;
    }

    const newHead = rcToId(row, col);

    if (snake.includes(newHead)) {
        onGameOver();
        return;
    }

    snake.unshift(newHead);

    if (newHead === apple) {
        placeApple();
    } else {
        snake.pop();
    }

    draw();
}

function onGameOver() {
    gameOver = true;
    running = false;
    startBlink();
}

function startBlink() {
    stopBlink();

    const blinkIds = [...snake];
    let on = false;

    const renderBlink = () => {
        blinkIds.forEach(id => {
            const el = cell(id);
            if (!el) return;
            el.classList.remove("cell-scheduled", "cell-scheduled-maybe", "cell-non-scheduled");
            el.classList.add(on ? "cell-scheduled" : "cell-non-scheduled");
        });

        if (apple) {
            const a = cell(apple);
            if (a) {
                a.classList.remove("cell-scheduled", "cell-non-scheduled");
                a.classList.add("cell-scheduled-maybe");
            }
        }
    };

    renderBlink();

    blinkTimer = setInterval(() => {
        on = !on;
        renderBlink();
    }, BLINK_MS);
}

function stopBlink() {
    if (blinkTimer) {
        clearInterval(blinkTimer);
        blinkTimer = null;
    }
}

function reset() {
    snake = [2, 1];
    direction = 1;
    apple = null;
    running = false;
    gameOver = false;

    stopBlink();
    clearClasses();
    placeApple();
    draw();

    if (window.updateDayHighlight) {
        window.updateDayHighlight();
    }
}

document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    const isControl =
        key === "w" || key === "a" || key === "s" || key === "d" ||
        key === "arrowup" || key === "arrowdown" ||
        key === "arrowleft" || key === "arrowright";

    if (key === " ") {
        reset();
        return;
    }

    if (!running && !gameOver && isControl) {
        running = true;
    }

    if (gameOver) return;

    if ((key === "w" || e.key === "ArrowUp") && direction !== COLS) direction = -COLS;
    if ((key === "s" || e.key === "ArrowDown") && direction !== -COLS) direction = COLS;
    if ((key === "a" || e.key === "ArrowLeft") && direction !== 1) direction = -1;
    if ((key === "d" || e.key === "ArrowRight") && direction !== -1) direction = 1;
});

/* ---------- START ---------- */
reset();
tickTimer = setInterval(tick, SPEED);

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

/*
    Очищаем ТОЛЬКО игровые клетки (1–168)
    НЕ трогаем day.js ячейки (они 1001+)
*/
function clearClasses() {
    for (let i = 1; i <= TOTAL; i++) {
        const el = cell(i);
        if (!el) continue;

        // Снимаем только игровые классы
        el.classList.remove("cell-scheduled");
        el.classList.remove("cell-scheduled-maybe");

        // Ставим "пусто", если это не змейка и не яблоко
        if (!snake.includes(i) && i !== apple) {
            el.classList.add("cell-non-scheduled");
        }
    }
}

/*
    Рисуем/скрываем змейку (текущую snake)
*/
function setSnakeVisibility(show) {
    for (let id = 1; id <= TOTAL; id++) {
        if (!snake.includes(id)) continue;
        const el = cell(id);
        if (!el) continue;

        el.classList.remove("cell-non-scheduled", "cell-scheduled-maybe", "cell-scheduled");
        el.classList.add(show ? "cell-scheduled" : "cell-non-scheduled");
    }
}

/*
    Полный кадр
*/
function draw() {
    clearClasses();

    // Змейка
    setSnakeVisibility(true);

    // Яблоко
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

/* ---------- ЯБЛОКО ---------- */
function placeApple() {
    // Удалить старое яблоко (если есть)
    if (apple) {
        const old = cell(apple);
        if (old) {
            old.classList.remove("cell-scheduled-maybe");
            old.classList.add("cell-non-scheduled");
        }
    }

    // Поставить новое (только в 1..168 и не в змейку)
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

/* ---------- ДВИЖЕНИЕ ---------- */
function tick() {
    if (!running || gameOver) return;

    const head = snake[0];
    let { row, col } = idToRC(head);

    if (direction === 1) col++;        // right
    if (direction === -1) col--;       // left
    if (direction === COLS) row++;     // down
    if (direction === -COLS) row--;    // up

    // Выход за поле
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
        onGameOver();
        return;
    }

    const newHead = rcToId(row, col);

    // Столкновение с собой
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

/* ---------- ПРОИГРЫШ с БЕСКОНЕЧНЫМ МИГАНИЕМ ---------- */
function onGameOver() {
    gameOver = true;
    running = false;
    startBlink();
}

/*
    Устойчивое мигание:
    - Берём СНИМОК позиций змейки на момент проигрыша (blinkIds)
    - Каждые BLINK_MS переключаем класс только на этих ячейках
    - Никаких draw()/clearClasses() внутри мигания
    - Яблоко остаётся видимым
*/
function startBlink() {
    stopBlink();

    const blinkIds = [...snake]; // снимок
    let on = false;

    // Показать/скрыть текущий кадр мигания
    const renderBlink = () => {
        blinkIds.forEach(id => {
            const el = cell(id);
            if (!el) return;
            // Сбрасываем только игровые классы
            el.classList.remove("cell-scheduled", "cell-scheduled-maybe", "cell-non-scheduled");
            el.classList.add(on ? "cell-scheduled" : "cell-non-scheduled");
        });

        // Яблоко оставляем видимым
        if (apple) {
            const a = cell(apple);
            if (a) {
                a.classList.remove("cell-scheduled", "cell-non-scheduled");
                a.classList.add("cell-scheduled-maybe");
            }
        }
    };

    // Сразу отрисовать первый кадр (без ожидания секунды)
    renderBlink();

    // Запуск интервала
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

/* ---------- СБРОС ---------- */
function reset() {
    snake = [2, 1];  // голова = 2, направо
    direction = 1;
    apple = null;
    running = false;
    gameOver = false;

    stopBlink();
    clearClasses();
    placeApple();
    draw();

    // Вернуть подсветку дня (day.js)
    if (window.updateDayHighlight) {
        window.updateDayHighlight();
    }
}

/* ---------- УПРАВЛЕНИЕ ---------- */
document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    const isControl =
        key === "w" || key === "a" || key === "s" || key === "d" ||
        key === "arrowup" || key === "arrowdown" ||
        key === "arrowleft" || key === "arrowright";

    // Перезапуск — только пробел
    if (key === " ") {
        reset();
        return;
    }

    // Первый запуск
    if (!running && !gameOver && isControl) {
        running = true;
    }

    // При проигрыше — игнор управления (пока не Space)
    if (gameOver) return;

    // Обновляем направление (без разворота на 180°)
    if ((key === "w" || e.key === "ArrowUp") && direction !== COLS) direction = -COLS;
    if ((key === "s" || e.key === "ArrowDown") && direction !== -COLS) direction = COLS;
    if ((key === "a" || e.key === "ArrowLeft") && direction !== 1) direction = -1;
    if ((key === "d" || e.key === "ArrowRight") && direction !== -1) direction = 1;
});

/* ---------- START ---------- */
reset();
tickTimer = setInterval(tick, SPEED);
// day.js

// Новая безопасная функция подсветки дня.
// Её можно запускать сколько угодно раз — она НИЧЕГО лишнего не трогает.

function applyDayClasses() {

    // Получаем день недели
    const today = new Date().getDay(); // 0 = Sunday
    const day = today === 0 ? 7 : today; // переводим 0→7

    // --- Снимаем старые подсветки ---
    for (let i = 1001; i <= 1007; i++) {
        document.getElementById(i)?.classList.remove(
            "yesterday-row", "monday-row", "current-day"
        );
    }
    for (let i = 2001; i <= 2007; i++) {
        document.getElementById(i)?.classList.remove("current-day");
    }
    for (let i = 3001; i <= 3024; i++) {
        document.getElementById(i)?.classList.remove("monday-th-day");
    }

    // === ПОНЕДЕЛЬНИК ===
    if (day === 1) {
        document.getElementById("1001")?.classList.add("monday-row");
        document.getElementById("2001")?.classList.add("current-day");

        for (let i = 3001; i <= 3024; i++)
            document.getElementById(i)?.classList.add("monday-th-day");

        return;
    }

    // === ДРУГИЕ ДНИ ===
    const yesterdayRow = 1000 + (day - 1);
    const currentDayCell = 2000 + day;

    document.getElementById(String(yesterdayRow))?.classList.add("yesterday-row");
    document.getElementById(String(currentDayCell))?.classList.add("current-day");
}

// Старт при загрузке страницы
document.addEventListener("DOMContentLoaded", applyDayClasses);

// Делаем доступным для snake.js
window.updateDayHighlight = applyDayClasses;
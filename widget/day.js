function applyDayClasses() {

    const today = new Date().getDay();
    const day = today === 0 ? 7 : today;

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

    if (day === 1) {
        document.getElementById("1001")?.classList.add("monday-row");
        document.getElementById("2001")?.classList.add("current-day");

        for (let i = 3001; i <= 3024; i++)
            document.getElementById(i)?.classList.add("monday-th-day");

        return;
    }

    const yesterdayRow = 1000 + (day - 1);
    const currentDayCell = 2000 + day;

    document.getElementById(String(yesterdayRow))?.classList.add("yesterday-row");
    document.getElementById(String(currentDayCell))?.classList.add("current-day");
}

document.addEventListener("DOMContentLoaded", applyDayClasses);

window.updateDayHighlight = applyDayClasses;

// created by FadelyLab

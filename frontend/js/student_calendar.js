import { requireLogin, loadActivities, qs, setState } from "./app.js";

let student;
let events = [];
let currentDate = new Date();
let currentFilter = "all";

const TH_MONTHS = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม"
];

window.onload = async () => {
    student = requireLogin();

    qs("#studentCalPrev").addEventListener("click", () => shiftMonth(-1));
    qs("#studentCalNext").addEventListener("click", () => shiftMonth(1));
    qs("#studentCalToday").addEventListener("click", () => {
        currentDate = new Date();
        renderCalendar();
    });

    await loadEvents();
};

async function loadEvents() {
    setState(qs("#studentUpcomingList"), "loading", "กำลังโหลดกิจกรรม...");
    const body = qs("#studentCalendarBody");
    if (body) {
        body.innerHTML = `<tr><td colspan="7" class="center">กำลังโหลด...</td></tr>`;
    }

    const rows = await loadActivities();
    events = Array.isArray(rows) ? rows : [];
    renderCalendar();
    renderUpcoming();
}

function shiftMonth(delta) {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    renderCalendar();
}

function renderCalendar() {
    const body = qs("#studentCalendarBody");
    const label = qs("#studentCalMonthLabel");
    if (!body || !label) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    label.textContent = `${TH_MONTHS[month]} ${year + 543}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const monthEvents = events
        .filter((ev) => {
            const d = new Date(ev.date);
            return d.getFullYear() === year && d.getMonth() === month;
        })
        .filter((ev) => matchesFilter(ev));

    const map = new Map();
    monthEvents.forEach((ev) => {
        const key = new Date(ev.date).toISOString().slice(0, 10);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(ev);
    });

    body.innerHTML = "";
    let dayNum = 1;
    let nextMonthDay = 1;

    for (let week = 0; week < 6; week++) {
        const tr = document.createElement("tr");
        for (let i = 0; i < 7; i++) {
            const td = document.createElement("td");
            const cell = document.createElement("div");
            cell.className = "calendar-cell";

            let displayDay = "";
            let dateKey = "";
            if (week === 0 && i < firstDay) {
                displayDay = prevDays - firstDay + i + 1;
                td.style.opacity = "0.35";
            } else if (dayNum > daysInMonth) {
                displayDay = nextMonthDay++;
                td.style.opacity = "0.35";
            } else {
                displayDay = dayNum;
                const d = new Date(year, month, dayNum);
                dateKey = d.toISOString().slice(0, 10);
                dayNum++;
            }

            cell.innerHTML = `<div class="calendar-date">${displayDay}</div>`;

            if (dateKey && map.has(dateKey)) {
                const items = map.get(dateKey);
                items.slice(0, 2).forEach((ev) => {
                    const cls = classifyEvent(ev.name || "");
                    const div = document.createElement("div");
                    div.className = `calendar-event ${cls}`;
                    div.textContent = ev.name;
                    cell.appendChild(div);
                });
                if (items.length > 2) {
                    const more = document.createElement("div");
                    more.className = "calendar-more";
                    more.textContent = `+${items.length - 2} รายการ`;
                    cell.appendChild(more);
                }
            }

            td.appendChild(cell);
            tr.appendChild(td);
        }
        body.appendChild(tr);
        if (dayNum > daysInMonth) break;
    }
}

function renderUpcoming() {
    const box = qs("#studentUpcomingList");
    if (!box) return;
    box.innerHTML = "";

    const filteredEvents = events.filter((ev) => matchesFilter(ev));

    if (!filteredEvents.length) {
        setState(box, "empty", "— ยังไม่มีกิจกรรม —");
        return;
    }

    const today = new Date();
    const upcoming = filteredEvents
        .map((ev) => ({ ...ev, dateObj: new Date(ev.date) }))
        .filter((ev) => ev.dateObj >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
        .sort((a, b) => a.dateObj - b.dateObj)
        .slice(0, 6);

    if (!upcoming.length) {
        setState(box, "empty", "— ยังไม่มีกิจกรรมที่กำลังจะมาถึง —");
        return;
    }

    upcoming.forEach((ev) => {
        const day = ev.dateObj.getDate();
        const month = TH_MONTHS[ev.dateObj.getMonth()].slice(0, 3);
        const item = document.createElement("div");
        item.className = "upcoming-item";
        item.innerHTML = `
            <div class="upcoming-date">${day}<br>${month}</div>
            <div>
                <div class="upcoming-title">${ev.name}</div>
                <div class="upcoming-meta">${formatDate(ev.date)} • ${ev.location || "-"}</div>
            </div>
        `;
        box.appendChild(item);
    });
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("th-TH");
}

function classifyEvent(name = "") {
    if (name.includes("ประชุม")) return "meeting";
    if (name.includes("สอบ") || name.includes("วิชาการ")) return "academic";
    if (name.includes("หยุด")) return "holiday";
    return "other";
}

function matchesFilter(ev) {
    if (currentFilter === "all") return true;
    const name = ev?.name || "";
    if (currentFilter === "meeting") return name.includes("ประชุม");
    if (currentFilter === "academic") return name.includes("สอบ") || name.includes("วิชาการ");
    if (currentFilter === "holiday") return name.includes("หยุด");
    if (currentFilter === "activity") return true;
    return true;
}

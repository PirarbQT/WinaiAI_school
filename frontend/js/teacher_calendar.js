import { requireTeacherLogin, qs, setState, clearFieldErrors, setFieldError, openModal, closeModal } from "./app.js";
import { API_BASE } from "./config.js";

let teacher = null;
let events = [];
let currentDate = new Date();
let currentFilter = "all";

const TH_MONTHS = [
    "\u0e21\u0e01\u0e23\u0e32\u0e04\u0e21",
    "\u0e01\u0e38\u0e21\u0e20\u0e32\u0e1e\u0e31\u0e19\u0e18\u0e4c",
    "\u0e21\u0e35\u0e19\u0e32\u0e04\u0e21",
    "\u0e40\u0e21\u0e29\u0e32\u0e22\u0e19",
    "\u0e1e\u0e24\u0e29\u0e20\u0e32\u0e04\u0e21",
    "\u0e21\u0e34\u0e16\u0e38\u0e19\u0e32\u0e22\u0e19",
    "\u0e01\u0e23\u0e01\u0e0e\u0e32\u0e04\u0e21",
    "\u0e2a\u0e34\u0e07\u0e2b\u0e32\u0e04\u0e21",
    "\u0e01\u0e31\u0e19\u0e22\u0e32\u0e22\u0e19",
    "\u0e15\u0e38\u0e25\u0e32\u0e04\u0e21",
    "\u0e1e\u0e24\u0e28\u0e08\u0e34\u0e01\u0e32\u0e22\u0e19",
    "\u0e18\u0e31\u0e19\u0e27\u0e32\u0e04\u0e21"
];

window.onload = async () => {
    teacher = requireTeacherLogin();

    loadEvents();

    document.querySelectorAll(".calendar-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".calendar-chip").forEach((btn) => btn.classList.remove("active"));
            chip.classList.add("active");
            currentFilter = chip.dataset.filter || "all";
            renderCalendar();
            renderUpcoming();
        });
    });

    qs("#calendarPrevBtn").addEventListener("click", () => shiftMonth(-1));
    qs("#calendarNextBtn").addEventListener("click", () => shiftMonth(1));
    qs("#calendarTodayBtn").addEventListener("click", () => {
        currentDate = new Date();
        renderCalendar();
    });

    qs("#openEventModalBtn").addEventListener("click", () => {
        qs("#eventTitle").value = "";
        qs("#eventDetail").value = "";
        qs("#eventDate").value = "";
        qs("#eventCategory").value = "internal";
        openModal("eventModal");
    });

    qs("#addEventBtn").addEventListener("click", addEvent);
};

async function loadEvents() {
    setState(qs("#upcomingList"), "loading", "\u0e01\u0e33\u0e25\u0e31\u0e07\u0e42\u0e2b\u0e25\u0e14\u0e01\u0e34\u0e08\u0e01\u0e23\u0e23\u0e21...");
    const calendarBody = qs("#calendarBody");
    if (calendarBody) {
        calendarBody.innerHTML = `<tr><td colspan="7" class="center">\u0e01\u0e33\u0e25\u0e31\u0e07\u0e42\u0e2b\u0e25\u0e14...</td></tr>`;
    }

    const res = await fetch(`${API_BASE}/teacher/calendar/list`);
    const list = await res.json();
    events = Array.isArray(list) ? list : [];

    renderCalendar();
    renderUpcoming();
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("th-TH");
}

function shiftMonth(delta) {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
    renderCalendar();
}

function renderCalendar() {
    const body = qs("#calendarBody");
    const label = qs("#calendarMonthLabel");
    if (!body || !label) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    label.textContent = `${TH_MONTHS[month]} ${year + 543}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const monthEvents = events.filter((ev) => {
        const d = new Date(ev.event_date);
        return d.getFullYear() === year && d.getMonth() === month;
    }).filter((ev) => matchesFilter(ev));

    const map = new Map();
    monthEvents.forEach((ev) => {
        const key = new Date(ev.event_date).toISOString().slice(0, 10);
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
                    const cls = classifyEvent(ev.title || "", resolveCategory(ev));
                    const div = document.createElement("div");
                    div.className = `calendar-event ${cls}`;
                    div.textContent = ev.title;
                    cell.appendChild(div);
                });
                if (items.length > 2) {
                    const more = document.createElement("div");
                    more.className = "calendar-more";
                    more.textContent = `+${items.length - 2} \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23`;
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
    const box = qs("#upcomingList");
    if (!box) return;
    box.innerHTML = "";

    const filteredEvents = events.filter((ev) => matchesFilter(ev));

    if (!filteredEvents.length) {
        setState(box, "empty", "\u2014 \u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e21\u0e35\u0e01\u0e34\u0e08\u0e01\u0e23\u0e23\u0e21 \u2014");
        return;
    }

    const today = new Date();
    const upcoming = filteredEvents
        .map((ev) => ({ ...ev, dateObj: new Date(ev.event_date) }))
        .filter((ev) => ev.dateObj >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
        .sort((a, b) => a.dateObj - b.dateObj)
        .slice(0, 6);

    if (!upcoming.length) {
        setState(box, "empty", "\u2014 \u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e21\u0e35\u0e01\u0e34\u0e08\u0e01\u0e23\u0e23\u0e21\u0e17\u0e35\u0e48\u0e01\u0e33\u0e25\u0e31\u0e07\u0e08\u0e30\u0e21\u0e32\u0e16\u0e36\u0e07 \u2014");
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
                <div class="upcoming-title">${ev.title}</div>
                <div class="upcoming-meta">${formatDate(ev.event_date)}</div>
            </div>
        `;
        box.appendChild(item);
    });
}

function classifyEvent(title = "", category = "") {
    if (category === "meeting") return "meeting";
    if (category === "academic") return "academic";
    if (category === "holiday") return "holiday";
    if (category === "internal") return "other";
    if (title.includes("\u0e1b\u0e23\u0e30\u0e0a\u0e38\u0e21")) return "meeting";
    if (title.includes("\u0e2a\u0e2d\u0e1a") || title.includes("\u0e27\u0e34\u0e0a\u0e32\u0e01\u0e32\u0e23")) return "academic";
    if (title.includes("\u0e2b\u0e22\u0e38\u0e14")) return "holiday";
    return "other";
}

async function addEvent() {
    const title = qs("#eventTitle").value.trim();
    const detail = qs("#eventDetail").value.trim();
    const date = qs("#eventDate").value;
    const category = qs("#eventCategory").value;
    const form = qs("#eventModal");
    clearFieldErrors(form);

    if (!title || !date) {
        if (!title) setFieldError(qs("#eventTitle"), "\u0e01\u0e23\u0e38\u0e13\u0e32\u0e01\u0e23\u0e2d\u0e01\u0e0a\u0e37\u0e48\u0e2d\u0e01\u0e34\u0e08\u0e01\u0e23\u0e23\u0e21");
        if (!date) setFieldError(qs("#eventDate"), "\u0e01\u0e23\u0e38\u0e13\u0e32\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48");
        return;
    }

    const finalTitle = category && category !== "other"
        ? `[${categoryLabel(category)}] ${title}`
        : title;

    await fetch(`${API_BASE}/teacher/calendar/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: finalTitle,
            description: detail,
            event_date: date,
            category
        })
    });

    qs("#eventTitle").value = "";
    qs("#eventDetail").value = "";
    qs("#eventDate").value = "";
    qs("#eventCategory").value = "internal";

    loadEvents();
    closeModal("eventModal");
}

window.deleteEvent = async function(id) {
    if (!confirm("\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e01\u0e34\u0e08\u0e01\u0e23\u0e23\u0e21\u0e19\u0e35\u0e49\u0e2b\u0e23\u0e37\u0e2d\u0e44\u0e21\u0e48?")) return;

    await fetch(`${API_BASE}/teacher/calendar/delete?id=${id}`, { method: "DELETE" });
    loadEvents();
};

function categoryLabel(category) {
    switch (category) {
        case "internal":
            return "\u0e01\u0e34\u0e08\u0e01\u0e23\u0e23\u0e21\u0e20\u0e32\u0e22\u0e43\u0e19";
        case "academic":
            return "\u0e27\u0e34\u0e0a\u0e32\u0e01\u0e32\u0e23";
        case "holiday":
            return "\u0e27\u0e31\u0e19\u0e2b\u0e22\u0e38\u0e14";
        case "meeting":
            return "\u0e01\u0e32\u0e23\u0e1b\u0e23\u0e30\u0e0a\u0e38\u0e21";
        default:
            return "\u0e2d\u0e37\u0e48\u0e19 \u0e46";
    }
}

function resolveCategory(ev) {
    if (ev?.category) return ev.category;
    const title = ev?.title || "";
    if (title.includes("\u0e1b\u0e23\u0e30\u0e0a\u0e38\u0e21")) return "meeting";
    if (title.includes("\u0e2a\u0e2d\u0e1a") || title.includes("\u0e27\u0e34\u0e0a\u0e32\u0e01\u0e32\u0e23")) return "academic";
    if (title.includes("\u0e2b\u0e22\u0e38\u0e14")) return "holiday";
    if (title.includes("\u0e01\u0e34\u0e08\u0e01\u0e23\u0e23\u0e21\u0e20\u0e32\u0e22\u0e43\u0e19")) return "internal";
    return "other";
}

function matchesFilter(ev) {
    if (currentFilter === "all") return true;
    return resolveCategory(ev) === currentFilter;
}

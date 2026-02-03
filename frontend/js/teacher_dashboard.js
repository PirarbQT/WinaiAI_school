import { API_BASE, FILE_BASE } from "./config.js";
﻿import { requireTeacherLogin, qs, setState } from "./app.js";

window.onload = async () => {

    const teacher = requireTeacherLogin();

    qs("#teacherNameBox").textContent =
        `${teacher.first_name} ${teacher.last_name}`;

    initDateTime();
    qs("#countStudents").textContent = "—";
    qs("#countSubjects").textContent = "—";
    qs("#countScoreItems").textContent = "—";
    qs("#countAllEvents").textContent = "—";
    qs("#countUpcomingEvents").textContent = "—";
    setState(qs("#dashboardEventList"), "loading", "กำลังโหลดกิจกรรม...");
    loadSummary(teacher.id);
    loadCalendar();
    loadScoreItemsCount(teacher.id);
};

function initDateTime() {
    const dateEl = qs("#todayDate");
    const timeEl = qs("#todayTime");
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

    const tick = () => {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString("th-TH", options);
        timeEl.textContent = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    };

    tick();
    setInterval(tick, 30000);
}

async function loadSummary(teacher_id) {
    try {
        const res = await fetch(
            `${API_BASE}/teacher/dashboard/summary?teacher_id=${teacher_id}`
        );

        const data = await res.json();

        qs("#countStudents").textContent = data.students || 0;
        qs("#countSubjects").textContent = data.subjects || 0;

    } catch (err) {
        console.log("Error loading summary", err);
    }
}

async function loadCalendar() {
    const listBox = qs("#dashboardEventList");
    try {
        const res = await fetch(`${API_BASE}/teacher/calendar/list`);
        const list = await res.json();

        qs("#countAllEvents").textContent = list.length || 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = list
            .filter((e) => new Date(e.event_date) >= today)
            .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

        qs("#countUpcomingEvents").textContent = upcoming.length || 0;

        if (upcoming.length === 0) {
            setState(listBox, "empty", "ยังไม่มีกิจกรรมที่กำลังจะมาถึง");
            return;
        }

        listBox.innerHTML = "";
        upcoming.slice(0, 3).forEach((ev) => {
            const d = new Date(ev.event_date);
            const dateStr = d.toLocaleDateString("th-TH");
            listBox.innerHTML += `
                <div class="event-mini">
                    <span>${ev.title}</span>
                    <strong>${dateStr}</strong>
                </div>
            `;
        });
    } catch (err) {
        console.log("Error loading calendar", err);
        setState(listBox, "error", "โหลดกิจกรรมไม่สำเร็จ");
    }
}

async function loadScoreItemsCount(teacher_id) {
    const target = qs("#countScoreItems");
    try {
        const res = await fetch(
            `${API_BASE}/teacher/scores/subjects?teacher_id=${teacher_id}`
        );
        const sections = await res.json();

        if (sections.length === 0) {
            target.textContent = 0;
            return;
        }

        const counts = await Promise.all(
            sections.map((sec) =>
                fetch(`${API_BASE}/teacher/scores/headers?section_id=${sec.section_id}`)
                    .then((r) => r.json())
                    .then((rows) => rows.length)
            )
        );

        const total = counts.reduce((sum, n) => sum + n, 0);
        target.textContent = total;
    } catch (err) {
        target.textContent = "0";
    }
}

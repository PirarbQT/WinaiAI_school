import { requireTeacherLogin, qs, setState, clearFieldErrors, setFieldError, openModal, closeModal } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

let teacher = null;

window.onload = async () => {
    teacher = requireTeacherLogin();

    loadEvents();

    qs("#openEventModalBtn").addEventListener("click", () => {
        qs("#eventTitle").value = "";
        qs("#eventDetail").value = "";
        qs("#eventDate").value = "";
        openModal("eventModal");
    });

    qs("#addEventBtn").addEventListener("click", addEvent);
};

async function loadEvents() {
    setState(qs("#eventList"), "loading", "กำลังโหลดกิจกรรม...");
    const res = await fetch(`${API_BASE}/teacher/calendar/list`);
    const list = await res.json();

    const box = qs("#eventList");
    box.innerHTML = "";

    if (list.length === 0) {
        setState(box, "empty", "— ยังไม่มีกิจกรรม —");
        return;
    }

    list.forEach((ev) => {
        const displayDate = formatDate(ev.event_date);
        box.innerHTML += `
            <div class="event-card">
                <div class="event-date">
                    <i class="fa-solid fa-calendar-day"></i>
                    ${displayDate}
                </div>

                <div class="event-info">
                    <h3>${ev.title}</h3>
                    <p>${ev.description || "-"}</p>
                </div>

                <button class="btn-danger" onclick="deleteEvent(${ev.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("th-TH");
}

async function addEvent() {
    const title = qs("#eventTitle").value.trim();
    const detail = qs("#eventDetail").value.trim();
    const date = qs("#eventDate").value;
    const form = qs("#eventModal");
    clearFieldErrors(form);

    if (!title || !date) {
        if (!title) setFieldError(qs("#eventTitle"), "กรุณากรอกชื่อกิจกรรม");
        if (!date) setFieldError(qs("#eventDate"), "กรุณาเลือกวันที่");
        return;
    }

    await fetch(`${API_BASE}/teacher/calendar/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            description: detail,
            event_date: date
        })
    });

    qs("#eventTitle").value = "";
    qs("#eventDetail").value = "";
    qs("#eventDate").value = "";

    loadEvents();
    closeModal("eventModal");
}

window.deleteEvent = async function(id) {
    if (!confirm("ต้องการลบกิจกรรมนี้หรือไม่?")) return;

    await fetch(
        `${API_BASE}/teacher/calendar/delete?id=${id}`,
        { method: "DELETE" }
    );

    loadEvents();
};

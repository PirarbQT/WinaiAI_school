import { requireDirectorLogin, qs, clearFieldErrors, setFieldError, openModal, closeModal } from "./app.js";
import { API_BASE } from "./config.js";

let activities = [];
let teachers = [];
let activeCategory = "";

window.onload = async () => {
    requireDirectorLogin();

    qs("#openActivityModalBtn").addEventListener("click", () => {
        resetForm();
        openModal("activityModal");
    });
    qs("#saveActivityBtn").addEventListener("click", saveActivity);
    qs("#resetActivityBtn").addEventListener("click", () => {
        resetForm();
        closeModal("activityModal");
    });
    qs("#searchActivityBtn").addEventListener("click", () => loadActivities());
    qs("#activitySearch").addEventListener("keypress", (e) => {
        if (e.key === "Enter") loadActivities();
    });

    document.querySelectorAll(".filter-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-chip").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            activeCategory = btn.dataset.category || "";
            loadActivities();
        });
    });

    qs("#addDutyBtn").addEventListener("click", addDutyTeacher);
    qs("#dutyWeekInput").addEventListener("change", () => {
        normalizeWeekInput();
        loadDutyTeachers();
    });

    await loadTeachers();
    initWeekInput();
    await loadDutyTeachers();
    await loadActivities();
};

function initWeekInput() {
    const today = new Date();
    const monday = getWeekStart(today);
    qs("#dutyWeekInput").value = formatDate(monday);
}

function normalizeWeekInput() {
    const val = qs("#dutyWeekInput").value;
    if (!val) return;
    const date = new Date(val);
    const monday = getWeekStart(date);
    qs("#dutyWeekInput").value = formatDate(monday);
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

async function loadTeachers() {
    const res = await fetch(`${API_BASE}/director/teachers?search=`);
    teachers = await res.json();
    const select = qs("#dutyTeacherSelect");
    select.innerHTML = '<option value="">เลือกครูเวร</option>' +
        teachers.map((t) => `<option value="${t.id}">${t.teacher_code} - ${t.first_name || ""} ${t.last_name || ""}</option>`).join("");
}

async function loadDutyTeachers() {
    const weekStart = qs("#dutyWeekInput").value;
    const res = await fetch(`${API_BASE}/director/duty-teachers?week_start=${weekStart}`);
    const list = await res.json();
    renderDutyTeachers(list);
}

function renderDutyTeachers(list) {
    const box = qs("#dutyList");
    box.innerHTML = "";
    if (!list.length) {
        box.innerHTML = `<div class="state-message">ยังไม่มีครูเวรรายสัปดาห์</div>`;
        return;
    }
    list.forEach((item) => {
        box.innerHTML += `
            <div class="activity-duty-item">
                <div>${item.teacher_name || "-"}</div>
                <button class="btn-danger btn-sm" data-id="${item.id}" aria-label="ลบ">🗑️</button>
            </div>
        `;
    });
    box.querySelectorAll(".btn-danger").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (!confirm("ต้องการลบครูเวรรายการนี้หรือไม่?")) return;
            await fetch(`${API_BASE}/director/duty-teachers/${id}`, { method: "DELETE" });
            loadDutyTeachers();
        });
    });
}

async function addDutyTeacher() {
    const weekStart = qs("#dutyWeekInput").value;
    const teacherId = qs("#dutyTeacherSelect").value;
    if (!weekStart || !teacherId) {
        alert("กรุณาเลือกสัปดาห์และครูเวร");
        return;
    }
    await fetch(`${API_BASE}/director/duty-teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_start: weekStart, teacher_id: Number(teacherId) })
    });
    qs("#dutyTeacherSelect").value = "";
    loadDutyTeachers();
}

async function loadActivities() {
    const search = qs("#activitySearch").value.trim().toLowerCase();
    const res = await fetch(`${API_BASE}/director/activities`);
    activities = await res.json();

    let filtered = activities;
    if (activeCategory) {
        filtered = filtered.filter((a) => (a.category || "อื่นๆ") === activeCategory);
    }
    if (search) {
        filtered = filtered.filter((a) => {
            const hay = `${a.name || ""} ${a.location || ""} ${a.note || ""}`.toLowerCase();
            return hay.includes(search);
        });
    }
    renderActivities(filtered);
}

function renderActivities(list = activities) {
    const listBox = qs("#activityList");
    listBox.innerHTML = "";
    if (!list.length) {
        listBox.innerHTML = `<div class="state-message">ยังไม่มีกิจกรรม</div>`;
        return;
    }
    list.forEach((a) => {
        const dateObj = a.date ? new Date(a.date) : null;
        const day = dateObj ? String(dateObj.getDate()).padStart(2, "0") : "--";
        const month = dateObj ? dateObj.toLocaleDateString("th-TH", { month: "short" }) : "";
        listBox.innerHTML += `
            <div class="activity-item">
                <div class="activity-date-badge">
                    ${day}
                    <span>${month}</span>
                </div>
                <div>
                    <div style="font-weight:700;">${a.name}</div>
                    <div style="color:#64748b; font-size:0.9rem;">${a.location || "-"}</div>
                    <div class="activity-tags">
                        <span class="activity-tag">${a.category || "อื่นๆ"}</span>
                        ${a.note ? `<span class="activity-tag" style="background:#fef3c7;color:#b45309;">${a.note}</span>` : ""}
                    </div>
                </div>
                <div>
                    <button class="btn-outline btn-sm" onclick="editActivity(${a.id})">แก้ไข</button>
                    <button class="btn-danger btn-sm" onclick="deleteActivity(${a.id})" aria-label="ลบ">🗑️</button>
                </div>
            </div>
        `;
    });
}

window.editActivity = function(id) {
    const a = activities.find((x) => x.id === id);
    if (!a) return;
    qs("#activityId").value = a.id;
    qs("#activityName").value = a.name || "";
    qs("#activityDate").value = a.date ? a.date.slice(0, 10) : "";
    qs("#activityLocation").value = a.location || "";
    qs("#activityNote").value = a.note || "";
    qs("#activityCategory").value = a.category || "กิจกรรมภายใน";
    openModal("activityModal");
};

window.deleteActivity = async function(id) {
    if (!confirm("ต้องการลบกิจกรรมนี้หรือไม่?")) return;
    await fetch(`${API_BASE}/director/activities/${id}`, { method: "DELETE" });
    loadActivities();
};

async function saveActivity() {
    clearFieldErrors(document.body);
    const id = qs("#activityId").value;
    const payload = {
        name: qs("#activityName").value.trim(),
        date: qs("#activityDate").value,
        location: qs("#activityLocation").value.trim(),
        note: qs("#activityNote").value.trim(),
        category: qs("#activityCategory").value.trim()
    };
    if (!payload.name || !payload.date) {
        if (!payload.name) setFieldError(qs("#activityName"), "กรุณากรอกชื่อกิจกรรม");
        if (!payload.date) setFieldError(qs("#activityDate"), "กรุณาเลือกวันที่");
        return;
    }

    if (id) {
        await fetch(`${API_BASE}/director/activities/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } else {
        await fetch(`${API_BASE}/director/activities`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    }
    resetForm();
    loadActivities();
    closeModal("activityModal");
}

function resetForm() {
    qs("#activityId").value = "";
    qs("#activityName").value = "";
    qs("#activityDate").value = "";
    qs("#activityLocation").value = "";
    qs("#activityNote").value = "";
    qs("#activityCategory").value = "กิจกรรมภายใน";
}

import { requireDirectorLogin, qs, clearFieldErrors, setFieldError, openModal, closeModal } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

let activities = [];

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
    await loadActivities();
};

async function loadActivities() {
    const res = await fetch(`${API_BASE}/director/activities`);
    activities = await res.json();
    renderActivities();
}

function renderActivities() {
    const body = qs("#activitiesBody");
    body.innerHTML = "";
    if (!activities.length) {
        body.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">ไม่มีข้อมูล</td></tr>`;
        return;
    }
    activities.forEach((a) => {
        body.innerHTML += `
            <tr>
                <td>${a.name}</td>
                <td>${a.date}</td>
                <td>${a.location || "-"}</td>
                <td>
                    <button class="btn-outline" onclick="editActivity(${a.id})">แก้ไข</button>
                    <button class="btn-danger" onclick="deleteActivity(${a.id})">ลบ</button>
                </td>
            </tr>
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
        location: qs("#activityLocation").value.trim()
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
}

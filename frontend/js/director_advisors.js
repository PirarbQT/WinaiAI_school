import { requireDirectorLogin, qs } from "./app.js";
import { API_BASE } from "./config.js";

const classLevels = ["\u0e21.1", "\u0e21.2", "\u0e21.3", "\u0e21.4", "\u0e21.5", "\u0e21.6"];

window.onload = async () => {
    requireDirectorLogin();
    initSelects();
    await loadTeachers();
    bindEvents();
    await loadAdvisors();
};

function initSelects() {
    const yearSelect = qs("#advisorYear");
    const classSelect = qs("#advisorClass");

    const years = ["2566", "2567", "2568", "2569"];
    yearSelect.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
    yearSelect.value = "2568";

    classSelect.innerHTML = classLevels.map((level) => `<option value="${level}">${level}</option>`).join("");
}

function bindEvents() {
    qs("#saveAdvisorBtn").addEventListener("click", saveAdvisor);
    qs("#advisorYear").addEventListener("change", loadAdvisors);
    qs("#advisorSemester").addEventListener("change", loadAdvisors);
}

async function loadTeachers() {
    const teacherSelect = qs("#advisorTeacher");
    teacherSelect.innerHTML = `<option value="">Loading...</option>`;
    const res = await fetch(`${API_BASE}/director/teachers`);
    const teachers = await res.json();
    teacherSelect.innerHTML = teachers
        .map((t) => `<option value="${t.id}">${t.teacher_code} - ${t.first_name} ${t.last_name}</option>`)
        .join("");
}

async function loadAdvisors() {
    const year = qs("#advisorYear").value;
    const semester = qs("#advisorSemester").value;
    const body = qs("#advisorBody");

    body.innerHTML = `<tr><td colspan="4" class="center">Loading...</td></tr>`;

    const res = await fetch(`${API_BASE}/director/advisors?year=${year}&semester=${semester}`);
    const rows = await res.json();

    const countEl = qs("#advisorCount");
    if (countEl) countEl.textContent = rows.length;

    if (!rows.length) {
        body.innerHTML = `<tr><td colspan="4" class="center">No data</td></tr>`;
        return;
    }

    body.innerHTML = "";
    rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.class_level}</td>
            <td>${row.year}/${row.semester}</td>
            <td>${row.teacher_code} - ${row.first_name} ${row.last_name}</td>
            <td class="center">
                <button class="btn-icon delete" onclick="deleteAdvisor(${row.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        body.appendChild(tr);
    });
}

async function saveAdvisor() {
    const payload = {
        teacher_id: qs("#advisorTeacher").value,
        class_level: qs("#advisorClass").value,
        year: qs("#advisorYear").value,
        semester: qs("#advisorSemester").value
    };

    if (!payload.teacher_id) {
        alert("Please select an advisor");
        return;
    }

    const res = await fetch(`${API_BASE}/director/advisors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) {
        alert(result?.error || "Save failed");
        return;
    }

    await loadAdvisors();
    alert("Advisor saved");
}

window.deleteAdvisor = async (id) => {
    const ok = confirm("Delete this advisor?");
    if (!ok) return;
    await fetch(`${API_BASE}/director/advisors/${id}`, { method: "DELETE" });
    await loadAdvisors();
};

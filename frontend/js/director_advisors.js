import { requireDirectorLogin, qs, openModal, closeModal } from "./app.js";
import { API_BASE } from "./config.js";

const fallbackClassLevels = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
let classroomList = [];
let currentRows = [];
let teachers = [];

window.onload = async () => {
    requireDirectorLogin();
    ensureRoomField();
    ensureEditModal();
    initYears();

    await Promise.all([loadClassrooms(), loadTeachers()]);
    bindEvents();
    await loadAdvisors();
};

function initYears() {
    const yearSelect = qs("#advisorYear");
    const years = ["2566", "2567", "2568", "2569"];
    yearSelect.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
    yearSelect.value = "2568";
}

function ensureRoomField() {
    if (qs("#advisorRoom")) return;

    const classField = qs("#advisorClass")?.closest(".advisor-field");
    if (!classField || !classField.parentElement) return;

    const roomField = document.createElement("div");
    roomField.className = "advisor-field";
    roomField.innerHTML = `
        <label>ห้อง</label>
        <select id="advisorRoom" class="custom-select"></select>
    `;
    classField.parentElement.insertBefore(roomField, classField.nextSibling);
}

function ensureEditModal() {
    if (document.getElementById("advisorEditModal")) return;

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "advisorEditModal";
    modal.innerHTML = `
        <div class="modal-backdrop" data-modal-close="advisorEditModal"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>แก้ไขครูที่ปรึกษา</h3>
                <button class="modal-close" data-modal-close="advisorEditModal">x</button>
            </div>
            <input type="hidden" id="editAdvisorId">
            <div class="advisor-form advisor-form-vertical">
                <div class="advisor-field">
                    <label>ปีการศึกษา</label>
                    <select id="editAdvisorYear" class="custom-select"></select>
                </div>
                <div class="advisor-field">
                    <label>ภาคเรียน</label>
                    <select id="editAdvisorSemester" class="custom-select">
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>
                </div>
                <div class="advisor-field">
                    <label>ระดับชั้น</label>
                    <select id="editAdvisorClass" class="custom-select"></select>
                </div>
                <div class="advisor-field">
                    <label>ห้อง</label>
                    <select id="editAdvisorRoom" class="custom-select"></select>
                </div>
                <div class="advisor-field">
                    <label>ครูที่ปรึกษา</label>
                    <select id="editAdvisorTeacher" class="custom-select"></select>
                </div>
                <div class="advisor-actions">
                    <button class="btn-primary" id="updateAdvisorBtn">อัปเดต</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll("[data-modal-close='advisorEditModal']").forEach((el) => {
        el.addEventListener("click", () => closeModal("advisorEditModal"));
    });
}

async function loadClassrooms() {
    try {
        const res = await fetch(`${API_BASE}/director/classrooms`);
        classroomList = res.ok ? await res.json() : [];
    } catch (_) {
        classroomList = [];
    }

    renderClassOptions("#advisorClass");
    renderRoomOptions("#advisorRoom", qs("#advisorClass")?.value || "");

    renderClassOptions("#editAdvisorClass");
    renderRoomOptions("#editAdvisorRoom", qs("#editAdvisorClass")?.value || "");
}

function getClassLevels() {
    const levels = [...new Set(classroomList.map((r) => String(r.class_level || "").trim()).filter(Boolean))];
    return levels.length ? levels : fallbackClassLevels;
}

function getRoomsByClass(level) {
    return [...new Set(
        classroomList
            .filter((r) => String(r.class_level || "") === String(level || ""))
            .map((r) => String(r.room || "").trim())
            .filter(Boolean)
    )];
}

function renderClassOptions(selector) {
    const select = qs(selector);
    if (!select) return;

    const levels = getClassLevels();
    const current = select.value;
    select.innerHTML = levels.map((lv) => `<option value="${lv}">${lv}</option>`).join("");
    if (levels.includes(current)) select.value = current;
}

function renderRoomOptions(selector, level) {
    const select = qs(selector);
    if (!select) return;

    const rooms = getRoomsByClass(level);
    const current = select.value;

    if (!rooms.length) {
        select.innerHTML = `<option value="1">1</option>`;
        return;
    }

    select.innerHTML = rooms.map((room) => `<option value="${room}">${room}</option>`).join("");
    if (rooms.includes(current)) select.value = current;
}

async function loadTeachers() {
    const res = await fetch(`${API_BASE}/director/teachers`);
    teachers = res.ok ? await res.json() : [];

    const options = teachers
        .map((t) => `<option value="${t.id}">${t.teacher_code} - ${t.first_name} ${t.last_name}</option>`)
        .join("");

    const addSelect = qs("#advisorTeacher");
    if (addSelect) addSelect.innerHTML = options;

    const editSelect = qs("#editAdvisorTeacher");
    if (editSelect) editSelect.innerHTML = options;

    const yearOptions = ["2566", "2567", "2568", "2569"].map((y) => `<option value="${y}">${y}</option>`).join("");
    const editYear = qs("#editAdvisorYear");
    if (editYear) editYear.innerHTML = yearOptions;
}

function bindEvents() {
    qs("#saveAdvisorBtn").addEventListener("click", saveAdvisor);
    qs("#advisorYear").addEventListener("change", loadAdvisors);
    qs("#advisorSemester").addEventListener("change", loadAdvisors);
    qs("#advisorClass").addEventListener("change", () => {
        renderRoomOptions("#advisorRoom", qs("#advisorClass").value);
        loadAdvisors();
    });
    qs("#advisorRoom")?.addEventListener("change", loadAdvisors);

    qs("#editAdvisorClass")?.addEventListener("change", () => {
        renderRoomOptions("#editAdvisorRoom", qs("#editAdvisorClass").value);
    });
    qs("#updateAdvisorBtn")?.addEventListener("click", updateAdvisor);
}

async function loadAdvisors() {
    const params = new URLSearchParams({
        year: qs("#advisorYear").value,
        semester: qs("#advisorSemester").value
    });

    const classLevel = qs("#advisorClass").value;
    const room = qs("#advisorRoom")?.value || "";
    if (classLevel) params.set("class_level", classLevel);
    if (room) params.set("room", room);

    const body = qs("#advisorBody");
    body.innerHTML = `<tr><td colspan="4" class="center">กำลังโหลด...</td></tr>`;

    const res = await fetch(`${API_BASE}/director/advisors?${params.toString()}`);
    currentRows = res.ok ? await res.json() : [];

    const countEl = qs("#advisorCount");
    if (countEl) countEl.textContent = currentRows.length;

    if (!currentRows.length) {
        body.innerHTML = `<tr><td colspan="4" class="center">ไม่มีข้อมูล</td></tr>`;
        return;
    }

    body.innerHTML = "";
    currentRows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.class_level || "-"}</td>
            <td>${row.room || "-"}</td>
            <td>${row.teacher_code} - ${row.first_name} ${row.last_name}<br><small>${row.year}/${row.semester}</small></td>
            <td class="center">
                <button class="btn-outline" onclick="openEditAdvisor(${row.id})">แก้ไข</button>
                <button class="btn-icon delete" onclick="deleteAdvisor(${row.id})" title="ลบ">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        body.appendChild(tr);
    });
}

window.openEditAdvisor = (id) => {
    const row = currentRows.find((r) => Number(r.id) === Number(id));
    if (!row) return;

    qs("#editAdvisorId").value = String(row.id);
    qs("#editAdvisorYear").value = String(row.year || qs("#advisorYear").value);
    qs("#editAdvisorSemester").value = String(row.semester || qs("#advisorSemester").value);
    qs("#editAdvisorClass").value = row.class_level || "";
    renderRoomOptions("#editAdvisorRoom", qs("#editAdvisorClass").value);
    qs("#editAdvisorRoom").value = row.room || qs("#editAdvisorRoom").value;
    qs("#editAdvisorTeacher").value = String(row.teacher_id || "");

    openModal("advisorEditModal");
};

async function saveAdvisor() {
    const payload = {
        teacher_id: qs("#advisorTeacher").value,
        class_level: qs("#advisorClass").value,
        room: qs("#advisorRoom")?.value || "",
        year: qs("#advisorYear").value,
        semester: qs("#advisorSemester").value
    };

    if (!payload.teacher_id || !payload.class_level || !payload.room) {
        alert("กรุณาเลือกชั้น ห้อง และครูที่ปรึกษา");
        return;
    }

    const res = await fetch(`${API_BASE}/director/advisors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
        alert(result?.error || "บันทึกไม่สำเร็จ");
        return;
    }

    await loadAdvisors();
}

async function updateAdvisor() {
    const advisorId = qs("#editAdvisorId").value;
    const payload = {
        teacher_id: qs("#editAdvisorTeacher").value,
        class_level: qs("#editAdvisorClass").value,
        room: qs("#editAdvisorRoom").value,
        year: qs("#editAdvisorYear").value,
        semester: qs("#editAdvisorSemester").value
    };

    if (!advisorId || !payload.teacher_id || !payload.class_level || !payload.room) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    const res = await fetch(`${API_BASE}/director/advisors/${advisorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
        alert(result?.error || "อัปเดตไม่สำเร็จ");
        return;
    }

    closeModal("advisorEditModal");

    // Sync top filters to edited period for immediate visibility.
    qs("#advisorYear").value = String(payload.year);
    qs("#advisorSemester").value = String(payload.semester);
    qs("#advisorClass").value = payload.class_level;
    renderRoomOptions("#advisorRoom", payload.class_level);
    qs("#advisorRoom").value = payload.room;

    await loadAdvisors();
}

window.deleteAdvisor = async (id) => {
    const ok = confirm("ลบรายการครูที่ปรึกษานี้?");
    if (!ok) return;
    await fetch(`${API_BASE}/director/advisors/${id}`, { method: "DELETE" });
    await loadAdvisors();
};

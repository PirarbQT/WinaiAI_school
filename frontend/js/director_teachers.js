import { requireDirectorLogin, qs, clearFieldErrors, setFieldError, openModal, closeModal } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

let currentList = [];

window.onload = async () => {
    requireDirectorLogin();
    qs("#searchTeacherBtn").addEventListener("click", () => loadTeachers());
    qs("#openTeacherModalBtn").addEventListener("click", () => {
        resetForm();
        openModal("teacherModal");
    });
    qs("#saveTeacherBtn").addEventListener("click", saveTeacher);
    qs("#resetTeacherBtn").addEventListener("click", () => {
        resetForm();
        closeModal("teacherModal");
    });
    await loadTeachers();
};

async function loadTeachers() {
    const keyword = qs("#teacherSearch").value.trim();
    const res = await fetch(`${API_BASE}/director/teachers?search=${encodeURIComponent(keyword)}`);
    currentList = await res.json();
    renderTeachers();
}

function renderTeachers() {
    const body = qs("#teachersBody");
    body.innerHTML = "";
    if (!currentList.length) {
        body.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px;">ไม่มีข้อมูล</td></tr>`;
        return;
    }
    currentList.forEach((t) => {
        body.innerHTML += `
            <tr>
                <td>${t.teacher_code}</td>
                <td>${t.first_name || ""} ${t.last_name || ""}</td>
                <td>
                    <button class="btn-outline" onclick="editTeacher(${t.id})">แก้ไข</button>
                    <button class="btn-danger" onclick="deleteTeacher(${t.id})">ลบ</button>
                </td>
            </tr>
        `;
    });
}

window.editTeacher = function(id) {
    const t = currentList.find((x) => x.id === id);
    if (!t) return;
    qs("#teacherId").value = t.id;
    qs("#teacherCode").value = t.teacher_code || "";
    qs("#teacherFirst").value = t.first_name || "";
    qs("#teacherLast").value = t.last_name || "";
    openModal("teacherModal");
};

window.deleteTeacher = async function(id) {
    if (!confirm("ต้องการลบข้อมูลครูนี้หรือไม่?")) return;
    await fetch(`${API_BASE}/director/teachers/${id}`, { method: "DELETE" });
    loadTeachers();
};

async function saveTeacher() {
    clearFieldErrors(document.body);
    const id = qs("#teacherId").value;
    const payload = {
        teacher_code: qs("#teacherCode").value.trim(),
        first_name: qs("#teacherFirst").value.trim(),
        last_name: qs("#teacherLast").value.trim(),
        password: qs("#teacherPass").value.trim()
    };

    if (!payload.teacher_code && !id) {
        setFieldError(qs("#teacherCode"), "กรุณากรอกรหัสครู");
        return;
    }

    if (id) {
        await fetch(`${API_BASE}/director/teachers/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } else {
        await fetch(`${API_BASE}/director/teachers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    }
    resetForm();
    loadTeachers();
    closeModal("teacherModal");
}

function resetForm() {
    qs("#teacherId").value = "";
    qs("#teacherCode").value = "";
    qs("#teacherFirst").value = "";
    qs("#teacherLast").value = "";
    qs("#teacherPass").value = "";
}

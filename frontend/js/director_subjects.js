import { requireDirectorLogin, qs, clearFieldErrors, setFieldError, openModal, closeModal } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

let currentList = [];

window.onload = async () => {
    requireDirectorLogin();
    qs("#openSubjectModalBtn").addEventListener("click", () => {
        resetForm();
        openModal("subjectModal");
    });
    qs("#saveSubjectBtn").addEventListener("click", saveSubject);
    qs("#resetSubjectBtn").addEventListener("click", () => {
        resetForm();
        closeModal("subjectModal");
    });
    await loadSubjects();
};

async function loadSubjects() {
    const res = await fetch(`${API_BASE}/director/subjects`);
    currentList = await res.json();
    renderSubjects();
}

function renderSubjects() {
    const body = qs("#subjectsBody");
    body.innerHTML = "";
    if (!currentList.length) {
        body.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">ไม่มีข้อมูล</td></tr>`;
        return;
    }
    currentList.forEach((s) => {
        body.innerHTML += `
            <tr>
                <td>${s.subject_code}</td>
                <td>${s.name}</td>
                <td>${s.credit}</td>
                <td>
                    <button class="btn-outline" onclick="editSubject(${s.id})">แก้ไข</button>
                    <button class="btn-danger" onclick="deleteSubject(${s.id})">ลบ</button>
                </td>
            </tr>
        `;
    });
}

window.editSubject = function(id) {
    const s = currentList.find((x) => x.id === id);
    if (!s) return;
    qs("#subjectId").value = s.id;
    qs("#subjectCode").value = s.subject_code;
    qs("#subjectName").value = s.name;
    qs("#subjectCredit").value = s.credit;
    openModal("subjectModal");
};

window.deleteSubject = async function(id) {
    if (!confirm("ต้องการลบรายวิชานี้หรือไม่?")) return;
    await fetch(`${API_BASE}/director/subjects/${id}`, { method: "DELETE" });
    loadSubjects();
};

async function saveSubject() {
    clearFieldErrors(document.body);
    const id = qs("#subjectId").value;
    const payload = {
        subject_code: qs("#subjectCode").value.trim(),
        name: qs("#subjectName").value.trim(),
        credit: Number(qs("#subjectCredit").value || 0)
    };

    if (!payload.subject_code || !payload.name) {
        if (!payload.subject_code) setFieldError(qs("#subjectCode"), "กรุณากรอกรหัสวิชา");
        if (!payload.name) setFieldError(qs("#subjectName"), "กรุณากรอกชื่อวิชา");
        return;
    }

    if (id) {
        await fetch(`${API_BASE}/director/subjects/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } else {
        await fetch(`${API_BASE}/director/subjects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    }
    resetForm();
    loadSubjects();
    closeModal("subjectModal");
}

function resetForm() {
    qs("#subjectId").value = "";
    qs("#subjectCode").value = "";
    qs("#subjectName").value = "";
    qs("#subjectCredit").value = 3;
}

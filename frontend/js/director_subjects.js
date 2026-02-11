import { requireDirectorLogin, qs, clearFieldErrors, setFieldError, openModal, closeModal } from "./app.js";
import { API_BASE } from "./config.js";

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
    qs("#searchSubjectBtn").addEventListener("click", () => loadSubjects());
    await loadSubjects();
};

async function loadSubjects() {
    const params = new URLSearchParams();
    const search = qs("#subjectSearch").value.trim();
    const level = qs("#subjectLevelFilter").value.trim();
    const group = qs("#subjectGroupFilter").value.trim();
    const type = qs("#subjectTypeFilter").value.trim();
    const year = qs("#subjectYearFilter").value.trim();
    const semester = qs("#subjectSemesterFilter").value.trim();

    if (search) params.set("search", search);
    if (level) params.set("level", level);
    if (group) params.set("group", group);
    if (type) params.set("type", type);
    if (year) params.set("year", year);
    if (semester) params.set("semester", semester);

    const res = await fetch(`${API_BASE}/director/subjects?${params.toString()}`);
    if (!res.ok) {
        currentList = [];
        renderSubjects();
        return;
    }
    currentList = await res.json();
    renderSubjects();
}

function renderSubjects() {
    const body = qs("#subjectsBody");
    body.innerHTML = "";
    if (!currentList.length) {
        body.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">ไม่มีข้อมูล</td></tr>`;
        return;
    }
    currentList.forEach((s, idx) => {
        const name = s.name_th || s.name || "-";
        const credit = Number(s.credit || 0).toFixed(1).replace(/\.0$/, "");
        const hours = s.total_hours ?? s.hours_total ?? "-";
        body.innerHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${s.subject_code}</td>
                <td>${name}</td>
                <td>${credit} / ${hours}</td>
                <td>${s.subject_type || "-"}</td>
                <td>${s.subject_group || s.group_name || "-"}</td>
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
    qs("#subjectYear").value = s.year || qs("#subjectYear").value;
    qs("#subjectSemester").value = s.semester || qs("#subjectSemester").value;
    qs("#subjectCode").value = s.subject_code || "";
    qs("#subjectNameTh").value = s.name_th || s.name || "";
    qs("#subjectNameEn").value = s.name_en || "";
    qs("#subjectType").value = s.subject_type || "พื้นฐาน";
    qs("#subjectGroup").value = s.subject_group || s.group_name || "";
    qs("#subjectLevel").value = s.level || s.class_level || "";
    qs("#subjectCredit").value = s.credit ?? "";
    qs("#subjectHours").value = s.total_hours ?? s.hours_total ?? "";
    qs("#subjectDescription").value = s.description || "";
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
        year: Number(qs("#subjectYear").value || 0) || null,
        semester: Number(qs("#subjectSemester").value || 0) || null,
        subject_code: qs("#subjectCode").value.trim(),
        name_th: qs("#subjectNameTh").value.trim(),
        name_en: qs("#subjectNameEn").value.trim(),
        subject_type: qs("#subjectType").value.trim(),
        subject_group: qs("#subjectGroup").value.trim(),
        level: qs("#subjectLevel").value.trim(),
        credit: Number(qs("#subjectCredit").value || 0),
        total_hours: Number(qs("#subjectHours").value || 0),
        description: qs("#subjectDescription").value.trim()
    };

    if (!payload.subject_code || !payload.name_th) {
        if (!payload.subject_code) setFieldError(qs("#subjectCode"), "กรุณากรอกรหัสวิชา");
        if (!payload.name_th) setFieldError(qs("#subjectNameTh"), "กรุณากรอกชื่อวิชา");
        return;
    }

    let res;
    if (id) {
        res = await fetch(`${API_BASE}/director/subjects/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    } else {
        res = await fetch(`${API_BASE}/director/subjects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    }

    if (!res?.ok) {
        let msg = "บันทึกรายวิชาไม่สำเร็จ";
        try {
            const err = await res.json();
            if (err?.error) msg = err.error;
        } catch (_) {}
        alert(msg);
        return;
    }

    resetForm();
    loadSubjects();
    closeModal("subjectModal");
}

function resetForm() {
    qs("#subjectId").value = "";
    qs("#subjectYear").value = "2568";
    qs("#subjectSemester").value = "1";
    qs("#subjectCode").value = "";
    qs("#subjectNameTh").value = "";
    qs("#subjectNameEn").value = "";
    qs("#subjectType").value = "พื้นฐาน";
    qs("#subjectGroup").value = "";
    qs("#subjectLevel").value = "";
    qs("#subjectCredit").value = "";
    qs("#subjectHours").value = "";
    qs("#subjectDescription").value = "";
}

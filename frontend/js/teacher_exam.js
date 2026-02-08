import { requireTeacherLogin, qs } from "./app.js";
import { API_BASE } from "./config.js";

let teacher = null;
let subjectList = [];
let filteredSubjects = [];
let exams = [];

window.onload = async () => {
    teacher = requireTeacherLogin();
    await loadSubjects();
    await loadExams();
    bindEvents();
};

function bindEvents() {
    qs("#addExamBtn").addEventListener("click", addExam);
    qs("#examYear").addEventListener("change", applySubjectFilter);
    qs("#examSemester").addEventListener("change", applySubjectFilter);
}

async function loadSubjects() {
    const select = qs("#examSubjectSelect");
    select.innerHTML = "<option value=''>กำลังโหลด...</option>";

    try {
        const res = await fetch(`${API_BASE}/teacher/scores/subjects?teacher_id=${teacher.id}`);
        subjectList = await res.json();
    } catch (err) {
        subjectList = [];
    }

    if (!Array.isArray(subjectList) || subjectList.length === 0) {
        select.innerHTML = "<option value=''>ไม่พบรายวิชา</option>";
        return;
    }

    applySubjectFilter();
}

function applySubjectFilter() {
    const year = qs("#examYear").value;
    const semester = qs("#examSemester").value;
    const select = qs("#examSubjectSelect");

    filteredSubjects = subjectList.filter((s) => {
        if (!s.year || !s.semester) return true;
        return String(s.year) === String(year) && String(s.semester) === String(semester);
    });

    select.innerHTML = "";
    if (!filteredSubjects.length) {
        select.innerHTML = "<option value=''>ไม่พบรายวิชา</option>";
        return;
    }

    filteredSubjects.forEach((s) => {
        const roomLabel = s.class_level || s.room ? ` (${s.class_level || ""}${s.room ? "/" + s.room : ""})` : "";
        select.innerHTML += `<option value="${s.section_id}">${s.subject_code} - ${s.subject_name}${roomLabel}</option>`;
    });

    loadExams();
}

async function loadExams() {
    const body = qs("#examTableBody");
    body.innerHTML = `<tr><td colspan="6" class="center">กำลังโหลด...</td></tr>`;
    try {
        const year = qs("#examYear").value;
        const semester = qs("#examSemester").value;
        const res = await fetch(`${API_BASE}/teacher/exam?teacher_id=${teacher.id}&year=${year}&semester=${semester}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(err?.error || "โหลดข้อมูลไม่สำเร็จ");
            exams = [];
            body.innerHTML = `<tr><td colspan="6" class="center">โหลดข้อมูลไม่สำเร็จ</td></tr>`;
            return;
        }
        exams = await res.json();
    } catch (err) {
        exams = [];
        body.innerHTML = `<tr><td colspan="6" class="center">โหลดข้อมูลไม่สำเร็จ</td></tr>`;
    }
    renderTable();
}

async function addExam() {
    const sectionId = qs("#examSubjectSelect").value;
    const type = qs("#examType").value;
    const date = qs("#examDate").value;
    const time = qs("#examTime").value;
    const room = qs("#examRoom").value.trim();

    if (!sectionId || !date || !time || !room) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    const endTime = addMinutes(time, 50);
    const timeRange = endTime ? `${time}-${endTime}` : time;

    const res = await fetch(`${API_BASE}/teacher/exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            section_id: sectionId,
            exam_type: type,
            exam_date: date,
            time_range: timeRange,
            room
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || "บันทึกไม่สำเร็จ");
        return;
    }

    await loadExams();
    qs("#examDate").value = "";
    qs("#examTime").value = "";
    qs("#examRoom").value = "";
}

function renderTable() {
    const body = qs("#examTableBody");
    if (!exams.length) {
        body.innerHTML = `<tr><td colspan="6" class="center">ยังไม่มีรายการวันสอบ</td></tr>`;
        return;
    }

    body.innerHTML = "";
    exams.forEach((ex) => {
        const roomLabel = ex.class_level || ex.room ? ` (${ex.class_level || ""}${ex.room ? "/" + ex.room : ""})` : "";
        const label = ex.subject_code ? `${ex.subject_code} - ${ex.subject_name}${roomLabel}` : "-";
        const timeLabel = ex.time_range || "-";
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${label}</td>
            <td class="center">${ex.exam_type === "midterm" ? "กลางภาค" : "ปลายภาค"}</td>
            <td class="center">${formatThaiDate(ex.exam_date)}</td>
            <td class="center">${timeLabel}</td>
            <td>${ex.room || "-"}</td>
            <td class="center">
                <button class="btn-icon delete" data-id="${ex.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        body.appendChild(tr);
    });

    body.querySelectorAll("button[data-id]").forEach((btn) => {
        btn.addEventListener("click", () => removeExam(btn.dataset.id));
    });
}

function removeExam(id) {
    const ok = confirm("ต้องการลบรายการวันสอบนี้หรือไม่?");
    if (!ok) return;
    fetch(`${API_BASE}/teacher/exam/${id}`, { method: "DELETE" }).then(loadExams);
}

function formatThaiDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function addMinutes(timeStr, minutes) {
    const parts = String(timeStr).split(":");
    if (parts.length < 2) return "";
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (Number.isNaN(h) || Number.isNaN(m)) return "";
    const total = h * 60 + m + minutes;
    const nh = Math.floor(total / 60) % 24;
    const nm = total % 60;
    return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

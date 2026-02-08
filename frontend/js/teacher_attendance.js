import { API_BASE } from "./config.js";
import { requireTeacherLogin, qs, setState, clearFieldErrors, setFieldError, openModal, closeModal } from "./app.js";

let teacher;
let students = [];
let sections = [];
let selectedSection = null;
let evalTopics = [];
let evalTargetStudent = null;

window.onload = () => {
    teacher = requireTeacherLogin();

    setTodayDate();
    loadSubjects();

    qs("#subjectSelect").addEventListener("change", applySectionInfo);
    qs("#loadStudentsBtn").addEventListener("click", loadStudents);
    qs("#saveAttendanceBtn").addEventListener("click", saveAttendance);
    qs("#saveStudentEvalBtn").addEventListener("click", saveStudentEvaluation);
};

function setTodayDate() {
    const dateInput = qs("#datePick");
    if (!dateInput) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    if (!dateInput.value) {
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
}

async function loadSubjects() {
    const box = qs("#subjectSelect");
    box.innerHTML = "<option value=''>กำลังโหลด...</option>";
    const res = await fetch(
        `${API_BASE}/teacher/scores/subjects?teacher_id=${teacher.id}`
    );
    sections = await res.json();

    box.innerHTML = "";

    if (sections.length === 0) {
        box.innerHTML = "<option value=''>ยังไม่มีวิชาที่สอน</option>";
        return;
    }

    sections.forEach((sec) => {
        box.innerHTML += `
            <option value="${sec.section_id}">
                ${sec.subject_code} - ${sec.subject_name}
            </option>
        `;
    });

    applySectionInfo();
}

function applySectionInfo() {
    const secId = qs("#subjectSelect").value;
    const sec = sections.find((s) => String(s.section_id) === String(secId));
    if (!sec) return;

    selectedSection = sec;
    qs("#classLevel").value = sec.class_level;
    qs("#room").value = sec.room ?? "";
}

async function loadStudents() {
    const classLevel = qs("#classLevel").value;
    const room = qs("#room").value;
    const form = qs(".attendance-controls");
    clearFieldErrors(form);

    if (!qs("#subjectSelect").value) {
        setFieldError(qs("#subjectSelect"), "กรุณาเลือกวิชา");
        return;
    }
    if (!classLevel || !room) {
        setFieldError(qs("#classLevel"), "กรุณาเลือกระดับชั้น");
        setFieldError(qs("#room"), "กรุณาเลือกห้อง");
        return;
    }

    setState(qs("#studentListContainer"), "loading", "กำลังโหลดรายชื่อนักเรียน...");
    const res = await fetch(
        `${API_BASE}/teacher/attendance/students?class_level=${classLevel}&room=${room}`
    );

    students = await res.json();

    renderStudents();
}

function renderStudents() {
    const box = qs("#studentListContainer");
    box.innerHTML = "";

    if (students.length === 0) {
        setState(box, "empty", "— ไม่มีนักเรียนในชั้น/ห้องนี้ —");
        qs("#saveAttendanceBtn").style.display = "none";
        return;
    }

    let html = `<table class="table-students">
                <tr>
                    <th>รหัสนักเรียน</th>
                    <th>ชื่อ - นามสกุล</th>
                    <th>สถานะ</th>
                    <th>ประเมินนักเรียน</th>
                </tr>`;

    students.forEach(s => {
        html += `
        <tr>
            <td>${s.student_code}</td>
            <td>${s.first_name} ${s.last_name}</td>
            <td>
                <select class="statusSelect" data-id="${s.id}">
                    <option value="present">มา</option>
                    <option value="absent">ขาด</option>
                    <option value="late">สาย</option>
                    <option value="leave">ลา</option>
                </select>
            </td>
            <td>
                <button class="btn-outline btn-sm" onclick="openStudentEval(${s.id})">
                    <i class="fa-solid fa-user-check"></i> ประเมิน
                </button>
            </td>
        </tr>
        `;
    });

    html += `</table>`;
    box.innerHTML = html;

    qs("#saveAttendanceBtn").style.display = "block";
}

async function loadEvaluationTopics() {
    if (evalTopics.length) return evalTopics;
    const res = await fetch(`${API_BASE}/teacher/evaluation/subject/topics`);
    const data = await res.json();
    evalTopics = Array.isArray(data) ? data : [];
    return evalTopics;
}

window.openStudentEval = async function(studentId) {
    if (!selectedSection) {
        alert("กรุณาเลือกวิชา");
        return;
    }

    const student = students.find((s) => String(s.id) === String(studentId));
    if (!student) return;

    evalTargetStudent = student;
    qs("#evalStudentName").value = `${student.student_code} - ${student.first_name} ${student.last_name}`;
    qs("#evalSubjectName").value = `${selectedSection.subject_code} - ${selectedSection.subject_name}`;

    const topics = await loadEvaluationTopics();
    const year = selectedSection.year;
    const semester = selectedSection.semester;

    const resp = await fetch(
        `${API_BASE}/teacher/evaluation/subject/student?section_id=${selectedSection.section_id}&student_id=${student.id}&year=${year}&semester=${semester}`
    );
    const existing = await resp.json();

    const map = new Map();
    if (Array.isArray(existing)) {
        existing.forEach((r) => map.set(r.topic, r.score));
    }

    const wrap = qs("#studentEvalTopics");
    wrap.innerHTML = "";

    topics.forEach((topic, idx) => {
        const score = map.get(topic) ?? "";
        const row = document.createElement("div");
        row.style.display = "grid";
        row.style.gridTemplateColumns = "1fr 120px";
        row.style.gap = "10px";
        row.style.alignItems = "center";
        row.style.marginBottom = "10px";
        row.innerHTML = `
            <div>${idx + 1}. ${topic}</div>
            <select class="evalScoreSelect" data-topic="${topic}">
                <option value="">-</option>
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
            </select>
        `;
        wrap.appendChild(row);
        const select = row.querySelector("select");
        if (select && score !== null && score !== undefined && score !== "") {
            select.value = String(score);
        }
    });

    openModal("studentEvalModal");
};

async function saveStudentEvaluation() {
    if (!selectedSection || !evalTargetStudent) return;

    const year = selectedSection.year;
    const semester = selectedSection.semester;
    const items = [...document.querySelectorAll(".evalScoreSelect")].map((el) => ({
        topic: el.dataset.topic,
        score: el.value ? Number(el.value) : null
    }));

    await fetch(`${API_BASE}/teacher/evaluation/subject/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            teacher_id: teacher.id,
            section_id: selectedSection.section_id,
            student_id: evalTargetStudent.id,
            year,
            semester,
            items
        })
    });

    closeModal("studentEvalModal");
}

async function saveAttendance() {
    const date = qs("#datePick").value;
    const classLevel = qs("#classLevel").value;
    const room = qs("#room").value;
    const form = qs(".attendance-controls");
    clearFieldErrors(form);

    if (!selectedSection) {
        setFieldError(qs("#subjectSelect"), "กรุณาเลือกวิชา");
        return;
    }
    if (!date) {
        setFieldError(qs("#datePick"), "กรุณาเลือกวันที่");
        return;
    }

    const records = [...document.querySelectorAll(".statusSelect")].map(row => ({
        student_id: row.dataset.id,
        status: row.value
    }));

    const sendData = {
        teacher_id: teacher.id,
        subject_id: selectedSection.subject_id,
        class_level: classLevel,
        room,
        date,
        records
    };

    const res = await fetch(`${API_BASE}/teacher/attendance/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData)
    });

    const data = await res.json();

    if (data.success) alert("บันทึกการเช็คชื่อเรียบร้อยแล้ว!");
}

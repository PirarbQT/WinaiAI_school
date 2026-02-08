import { requireTeacherLogin, qs } from "./app.js";
import { API_BASE } from "./config.js";

let teacher = null;
let topics = [];

const YEARS = ["2566", "2567", "2568", "2569"];
const SEMESTERS = ["1", "2"];
const SCORES = [5, 4, 3, 2, 1];
const DEFAULT_TOPICS = [
    "ความรับผิดชอบ",
    "วินัยและการตรงต่อเวลา",
    "ความร่วมมือและการทำงานเป็นทีม",
    "ความตั้งใจในการเรียน",
    "มารยาทและการเคารพกติกา"
];

window.onload = async () => {
    teacher = requireTeacherLogin();
    initFilters();
    bindEvents();
    await refreshAll();
};

function initFilters() {
    const yearSelect = qs("#evalYear");
    const semesterSelect = qs("#evalSemester");

    yearSelect.innerHTML = YEARS.map((y) => `<option value="${y}">${y}</option>`).join("");
    yearSelect.value = "2568";

    semesterSelect.innerHTML = SEMESTERS.map((s) => `<option value="${s}">${s}</option>`).join("");
    semesterSelect.value = "1";
}

function bindEvents() {
    qs("#evalYear").addEventListener("change", refreshAll);
    qs("#evalSemester").addEventListener("change", refreshAll);
    qs("#evalStudent").addEventListener("change", loadStudentScores);
    qs("#saveAdvisorEvalBtn").addEventListener("click", saveEvaluation);
}

async function refreshAll() {
    await loadAdvisor();
    await loadStudents();
    await loadTopics();
    await loadStudentScores();
}

async function loadAdvisor() {
    const year = qs("#evalYear").value;
    const semester = qs("#evalSemester").value;
    const res = await fetch(`${API_BASE}/teacher/evaluation/advisor?teacher_id=${teacher.id}&year=${year}&semester=${semester}`);
    const data = await res.json();
    const target = qs("#advisorClassLabel");
    if (!data?.class_level) {
        target.textContent = "ยังไม่ได้รับมอบหมายชั้นที่ปรึกษา";
        return;
    }
    target.textContent = `ชั้นที่ปรึกษา: ${data.class_level}`;
}

async function loadStudents() {
    const year = qs("#evalYear").value;
    const semester = qs("#evalSemester").value;
    const select = qs("#evalStudent");

    select.innerHTML = `<option value="">กำลังโหลด...</option>`;
    const res = await fetch(`${API_BASE}/teacher/evaluation/students?teacher_id=${teacher.id}&year=${year}&semester=${semester}`);
    const rows = await res.json();

    if (!rows.length) {
        select.innerHTML = `<option value="">ไม่มีนักเรียนที่ปรึกษา</option>`;
        return;
    }

    select.innerHTML = `<option value="">-- เลือกนักเรียน --</option>`;
    rows.forEach((row) => {
        const name = `${row.student_code} - ${row.first_name} ${row.last_name}`.trim();
        const op = document.createElement("option");
        op.value = row.id;
        op.textContent = name;
        select.appendChild(op);
    });
}

async function loadTopics() {
    const year = qs("#evalYear").value;
    const semester = qs("#evalSemester").value;
    try {
        const res = await fetch(`${API_BASE}/teacher/evaluation/topics?year=${year}&semester=${semester}`);
        const data = await res.json();
        topics = Array.isArray(data) && data.length ? data : DEFAULT_TOPICS;
    } catch {
        topics = DEFAULT_TOPICS;
    }
    renderTable({});
}

async function loadStudentScores() {
    const studentId = qs("#evalStudent").value;
    if (!studentId) {
        renderTable({});
        return;
    }

    const year = qs("#evalYear").value;
    const semester = qs("#evalSemester").value;
    const res = await fetch(`${API_BASE}/teacher/evaluation/student?teacher_id=${teacher.id}&student_id=${studentId}&year=${year}&semester=${semester}`);
    const rows = await res.json();
    const map = {};
    rows.forEach((row) => {
        map[row.topic] = row.score;
    });
    renderTable(map);
}

function renderTable(scoreMap) {
    const body = qs("#advisorEvalBody");
    if (!Array.isArray(topics) || !topics.length) {
        body.innerHTML = `<tr><td colspan="3" class="center">ยังไม่มีหัวข้อประเมิน</td></tr>`;
        return;
    }
    body.innerHTML = "";

    topics.forEach((topic, index) => {
        const tr = document.createElement("tr");
        const scoreSelect = [
            `<select class="custom-select advisor-score" data-topic="${topic}">`,
            `<option value="">-</option>`,
            ...SCORES.map((s) => `<option value="${s}">${s}</option>`),
            `</select>`
        ].join("");

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${topic}</td>
            <td class="center">${scoreSelect}</td>
        `;
        body.appendChild(tr);
    });

    body.querySelectorAll(".advisor-score").forEach((select) => {
        const t = select.dataset.topic;
        if (scoreMap[t] !== undefined && scoreMap[t] !== null) {
            select.value = String(scoreMap[t]);
        }
    });
}

async function saveEvaluation() {
    const studentId = qs("#evalStudent").value;
    if (!studentId) {
        alert("กรุณาเลือกนักเรียน");
        return;
    }

    const year = qs("#evalYear").value;
    const semester = qs("#evalSemester").value;

    const items = Array.from(document.querySelectorAll(".advisor-score")).map((el) => ({
        topic: el.dataset.topic,
        score: el.value ? Number(el.value) : null
    }));

    const res = await fetch(`${API_BASE}/teacher/evaluation/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            teacher_id: teacher.id,
            student_id: studentId,
            year,
            semester,
            items
        })
    });
    const result = await res.json();
    if (!res.ok) {
        alert(result?.error || "บันทึกไม่สำเร็จ");
        return;
    }
    alert("บันทึกผลประเมินเรียบร้อย");
}

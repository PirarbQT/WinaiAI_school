import { requireTeacherLogin, qs } from "./app.js";
import { API_BASE } from "./config.js";

let teacher = null;
let tests = [];

const YEARS = ["2566", "2567", "2568", "2569"];
const SEMESTERS = ["1", "2"];
const STATUS_OPTIONS = ["", "ดีมาก", "ผ่าน", "พอใช้", "ปรับปรุง", "ไม่ผ่าน"];

const DEFAULT_TESTS = ["ลุกนั่ง 30 วินาที", "ดันพื้น 30 วินาที", "วิ่งเก็บของ"];

const MSG = {
    selectStudent: "กรุณาเลือกนักเรียน",
    noAdvisor: "ครูยังไม่ได้รับมอบหมายชั้นที่ปรึกษา",
    saveFail: "บันทึกไม่สำเร็จ",
    saveOk: "บันทึกผลทดสอบเรียบร้อย",
    loading: "กำลังโหลด...",
    noStudents: "ไม่มีนักเรียนที่ปรึกษา",
    pickStudent: "-- เลือกนักเรียน --",
    noTests: "ยังไม่มีรายการทดสอบ"
};

window.onload = async () => {
    teacher = requireTeacherLogin();
    initFilters();
    bindEvents();
    await refreshAll();
};

function initFilters() {
    const yearSelect = qs("#fitnessYear");
    const semesterSelect = qs("#fitnessSemester");

    yearSelect.innerHTML = YEARS.map((y) => `<option value="${y}">${y}</option>`).join("");
    yearSelect.value = "2568";

    semesterSelect.innerHTML = SEMESTERS.map((s) => `<option value="${s}">${s}</option>`).join("");
    semesterSelect.value = "1";
}

function bindEvents() {
    qs("#fitnessYear").addEventListener("change", refreshAll);
    qs("#fitnessSemester").addEventListener("change", refreshAll);
    qs("#fitnessStudent").addEventListener("change", loadStudentResults);
    qs("#saveFitnessBtn").addEventListener("click", saveFitness);
}

async function refreshAll() {
    await loadAdvisor();
    await loadStudents();
    await loadTests();
    await loadStudentResults();
}

async function loadAdvisor() {
    const year = qs("#fitnessYear").value;
    const semester = qs("#fitnessSemester").value;
    const res = await fetch(`${API_BASE}/teacher/evaluation/advisor?teacher_id=${teacher.id}&year=${year}&semester=${semester}`);
    const data = await res.json();
    const target = qs("#fitnessAdvisorLabel");
    if (!data?.class_level) {
        target.textContent = MSG.noAdvisor;
        return;
    }
    target.textContent = `ชั้นที่ปรึกษา: ${data.class_level}`;
}

async function loadStudents() {
    const year = qs("#fitnessYear").value;
    const semester = qs("#fitnessSemester").value;
    const select = qs("#fitnessStudent");

    select.innerHTML = `<option value="">${MSG.loading}</option>`;
    const res = await fetch(`${API_BASE}/teacher/evaluation/students?teacher_id=${teacher.id}&year=${year}&semester=${semester}`);
    const rows = await res.json();

    if (!rows.length) {
        select.innerHTML = `<option value="">${MSG.noStudents}</option>`;
        return;
    }

    select.innerHTML = `<option value="">${MSG.pickStudent}</option>`;
    rows.forEach((row) => {
        const name = `${row.student_code} - ${row.first_name} ${row.last_name}`.trim();
        const op = document.createElement("option");
        op.value = row.id;
        op.textContent = name;
        select.appendChild(op);
    });
}

async function loadTests() {
    try {
        const res = await fetchFitness("topics");
        const data = await res.json();
        tests = Array.isArray(data) ? data : [];
    } catch {
        tests = [];
    }
    if (!tests.length) {
        tests = DEFAULT_TESTS.slice();
    }
    renderTable({});
}

async function loadStudentResults() {
    const studentId = qs("#fitnessStudent").value;
    if (!studentId) {
        renderTable({});
        return;
    }

    const year = qs("#fitnessYear").value;
    const semester = qs("#fitnessSemester").value;
    const res = await fetchFitness(`student?teacher_id=${teacher.id}&student_id=${studentId}&year=${year}&semester=${semester}`);

    if (res.status === 403) {
        renderTable({});
        alert(MSG.noAdvisor);
        return;
    }

    const rows = await res.json();
    const map = {};
    rows.forEach((row) => {
        map[row.test_name] = row;
    });
    renderTable(map);
}

function renderTable(dataMap) {
    const body = qs("#fitnessBody");
    if (!Array.isArray(tests) || !tests.length) {
        body.innerHTML = `<tr><td colspan="4" class="center">${MSG.noTests}</td></tr>`;
        return;
    }

    body.innerHTML = "";

    tests.forEach((test) => {
        const data = dataMap[test] || {};
        const tr = document.createElement("tr");
        const statusSelect = [
            `<select class="custom-select fitness-status" data-test="${test}">`,
            ...STATUS_OPTIONS.map((s) => `<option value="${s}">${s || "-"}</option>`),
            `</select>`
        ].join("");

        tr.innerHTML = `
            <td>${test}</td>
            <td><input class="fitness-input" data-test="${test}" data-field="result_value" type="text" value="${escapeValue(data.result_value)}"></td>
            <td><input class="fitness-input" data-test="${test}" data-field="standard_value" type="text" value="${escapeValue(data.standard_value)}"></td>
            <td class="center">${statusSelect}</td>
        `;
        body.appendChild(tr);
    });

    body.querySelectorAll(".fitness-status").forEach((select) => {
        const test = select.dataset.test;
        const data = dataMap[test];
        if (data?.status) select.value = data.status;
    });
}

function escapeValue(val) {
    if (val === null || val === undefined) return "";
    return String(val).replace(/"/g, "&quot;");
}

async function saveFitness() {
    const studentId = qs("#fitnessStudent").value;
    if (!studentId) {
        alert(MSG.selectStudent);
        return;
    }

    const year = qs("#fitnessYear").value;
    const semester = qs("#fitnessSemester").value;

    const items = tests.map((test) => {
        const result = document.querySelector(`.fitness-input[data-test="${test}"][data-field="result_value"]`);
        const standard = document.querySelector(`.fitness-input[data-test="${test}"][data-field="standard_value"]`);
        const status = document.querySelector(`.fitness-status[data-test="${test}"]`);
        return {
            test_name: test,
            result_value: result ? result.value.trim() : "",
            standard_value: standard ? standard.value.trim() : "",
            status: status ? status.value : ""
        };
    });

    const res = await fetchFitness("student", {
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
        alert(result?.error || MSG.saveFail);
        return;
    }

    alert(MSG.saveOk);
}

async function fetchFitness(path, options) {
    const next = `${API_BASE}/teacher/evaluation/fitness/${path}`;
    const legacy = `${API_BASE}/teacher/fitness/${path}`;

    let res = await fetch(next, options);
    if (res.status === 404) {
        res = await fetch(legacy, options);
    }
    return res;
}

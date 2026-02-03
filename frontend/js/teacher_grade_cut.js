import { API_BASE, FILE_BASE } from "./config.js";
﻿import { requireTeacherLogin, qs, setState, clearFieldErrors, setFieldError } from "./app.js";

let teacher = null;
let sectionList = [];
let selectedSection = null;

window.onload = async () => {
    teacher = requireTeacherLogin();

    await loadSubjects();

    qs("#subjectSelect").addEventListener("change", loadSectionInfo);
    qs("#loadScoreBtn").addEventListener("click", loadScoreTable);
    qs("#saveGradeBtn").addEventListener("click", saveGrades);
};

/* ---------------------------------------------------
   โหลดรายวิชาที่ครูสอน
--------------------------------------------------- */
async function loadSubjects() {
    const box = qs("#subjectSelect");
    box.innerHTML = "<option value=''>กำลังโหลด...</option>";
    const res = await fetch(
        `${API_BASE}/teacher/scores/subjects?teacher_id=${teacher.id}`
    );
    sectionList = await res.json();

    box.innerHTML = "";

    if (sectionList.length === 0) {
        box.innerHTML = "<option value=''>ยังไม่มีวิชาที่สอน</option>";
        selectedSection = null;
        return;
    }

    sectionList.forEach((sec) => {
        box.innerHTML += `
            <option value="${sec.section_id}">
                ${sec.subject_code} - ${sec.subject_name}
            </option>
        `;
    });

    loadSectionInfo();
}

function loadSectionInfo() {
    const secId = qs("#subjectSelect").value;
    selectedSection = secId;
}

/* ---------------------------------------------------
   โหลดคะแนนรวมของนักเรียน
--------------------------------------------------- */
async function loadScoreTable() {
    const form = qs(".grade-controls");
    clearFieldErrors(form);
    if (!selectedSection) {
        setFieldError(qs("#subjectSelect"), "กรุณาเลือกวิชา");
        return;
    }
    setState(qs("#gradeTableContainer"), "loading", "กำลังโหลดคะแนนรวม...");
    const res = await fetch(
        `${API_BASE}/teacher/grade/scores?section_id=${selectedSection}`
    );

    const data = await res.json();
    renderScoreTable(data);
}

/* ---------------------------------------------------
   แสดงตารางคะแนนรวม + ช่องกรอกเกรด
--------------------------------------------------- */
function renderScoreTable(list) {
    if (!list || list.length === 0) {
        setState(qs("#gradeTableContainer"), "empty", "ไม่มีข้อมูลคะแนน");
        return;
    }
    let html = `
        <table class="grade-table">
            <tr>
                <th>รหัส</th>
                <th>ชื่อ - นามสกุล</th>
                <th>รวมคะแนน</th>
                <th>เกรด</th>
            </tr>
    `;

    list.forEach((stu) => {
        const grade = calculateGrade(stu.total_score);

        html += `
        <tr>
            <td>${stu.student_code}</td>
            <td>${stu.name}</td>
            <td>
                <input type="number" 
                       class="sum-input" 
                       data-id="${stu.student_id}" 
                       value="${stu.total_score}">
            </td>
            <td>
                <input type="text" 
                       class="grade-input" 
                       data-id="${stu.student_id}" 
                       value="${grade}">
            </td>
        </tr>`;
    });

    html += "</table>";

    qs("#gradeTableContainer").innerHTML = html;
}

/* ---------------------------------------------------
   ฟังก์ชันคำนวณเกรด
--------------------------------------------------- */
function calculateGrade(score) {
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
}

/* ---------------------------------------------------
   บันทึกเกรดทั้งหมด
--------------------------------------------------- */
async function saveGrades() {
    const form = qs(".grade-controls");
    clearFieldErrors(form);
    if (!selectedSection) {
        setFieldError(qs("#subjectSelect"), "กรุณาเลือกวิชา");
        return;
    }
    const sumInputs = document.querySelectorAll(".sum-input");
    const gradeInputs = document.querySelectorAll(".grade-input");

    const grades = [...sumInputs].map((s, i) => ({
        student_id: Number(s.dataset.id),
        total_score: Number(s.value),
        grade: gradeInputs[i].value
    }));

    const data = {
        section_id: selectedSection,
        grades
    };

    const res = await fetch(
        `${API_BASE}/teacher/grade/save`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }
    );

    const result = await res.json();

    if (result.success) {
        alert("บันทึกเกรดสำเร็จ");
    }
}

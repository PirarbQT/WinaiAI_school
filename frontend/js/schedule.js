import {
    qs,
    requireLogin,
    loadClassSchedule,
    loadExamSchedule
} from "./app.js";

let student;

// ----------------------------
// เมื่อหน้าโหลด
// ----------------------------
window.onload = async () => {
    student = requireLogin();
    bindEvents();
    await refreshSchedule();
};

// ----------------------------
// ผูก event
// ----------------------------
function bindEvents() {

    qs("#btn-class").onclick = () => showTab("class");
    qs("#btn-exam").onclick = () => showTab("exam");

    qs("#yearSelect").addEventListener("change", refreshSchedule);
    qs("#termSelect").addEventListener("change", refreshSchedule);
}

// ----------------------------
// สลับแท็บ
// ----------------------------
function showTab(type) {

    if (type === "class") {
        qs("#btn-class").classList.add("active");
        qs("#btn-exam").classList.remove("active");

        qs("#classSection").style.display = "block";
        qs("#examSection").style.display = "none";

    } else {
        qs("#btn-class").classList.remove("active");
        qs("#btn-exam").classList.add("active");

        qs("#classSection").style.display = "none";
        qs("#examSection").style.display = "block";
    }
}

// ----------------------------
// โหลดข้อมูลตารางเรียน + ตารางสอบ
// ----------------------------
async function refreshSchedule() {
    
    const year = qs("#yearSelect").value;
    const semester = qs("#termSelect").value;

    await loadClassTable(year, semester);
    await loadExamTable(year, semester);
}

// ----------------------------
// ตารางเรียน
// ----------------------------
async function loadClassTable(year, semester) {

    const body = qs("#classTableBody");
    body.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">กำลังโหลด...</td></tr>`;
    const rows = await loadClassSchedule(student.id, year, semester);
    const classCount = document.getElementById("classCount");
    if (classCount) classCount.textContent = rows.length;

    if (rows.length === 0) {
        body.innerHTML = `
            <tr><td colspan="5" style="text-align:center; padding:20px;">ไม่มีข้อมูลตารางเรียน</td></tr>`;
        return;
    }

    body.innerHTML = "";

    rows.forEach(r => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${r.day_of_week ?? "-"}</td>
            <td>${r.time_range ?? "-"}</td>
            <td>${r.subject_code}</td>
            <td>${r.subject_name}</td>
            <td>${r.teacher ?? "-"}</td>
        `;

        body.appendChild(tr);
    });
}

// ----------------------------
// ตารางสอบ
// ----------------------------
async function loadExamTable(year, semester) {

    const body = qs("#examTableBody");
    body.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">กำลังโหลด...</td></tr>`;
    const rows = await loadExamSchedule(student.id, year, semester);
    const examCount = document.getElementById("examCount");
    if (examCount) examCount.textContent = rows.length;

    if (rows.length === 0) {
        body.innerHTML = `
            <tr><td colspan="5" style="text-align:center; padding:20px;">ยังไม่มีข้อมูล</td></tr>`;
        return;
    }

    body.innerHTML = "";

    rows.forEach(ex => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${ex.exam_date ?? "-"}</td>
            <td>${ex.time_range ?? "-"}</td>
            <td>${ex.subject_code}</td>
            <td>${ex.subject_name}</td>
            <td>${ex.room}</td>
        `;

        body.appendChild(tr);
    });
}

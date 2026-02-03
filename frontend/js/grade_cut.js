import { qs } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

const params = new URLSearchParams(location.search);

const subject_id = params.get("subject");
const class_level = params.get("class");
const room = params.get("room");

let teacher;
let totals = [];

window.onload = async () => {
    teacher = JSON.parse(localStorage.getItem("teacher"));
    if (!teacher) location.href = "/frontend/pages/login.html";

    qs("#headerText").textContent =
        `วิชา ${subject_id} | ชั้น ${class_level}/${room}`;

    await loadTotals();
    renderTable();

    qs("#finalBtn").addEventListener("click", finalizeGrades);
};


// ============ โหลดคะแนนรวม ================
async function loadTotals() {
    const res = await fetch(
        `${API_BASE}/teacher/grade/totals?subject_id=${subject_id}&class_level=${class_level}&room=${room}`
    );
    totals = await res.json();
}


// ============ ฟังก์ชันตัดเกรดระบบ ================
function autoGrade(score) {
    if (score >= 80) return "A";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 65) return "C+";
    if (score >= 60) return "C";
    if (score >= 55) return "D+";
    if (score >= 50) return "D";
    return "F";
}


// ============ แสดงตาราง ================
function renderTable() {
    const body = qs("#gradeBody");
    body.innerHTML = "";

    totals.forEach(st => {
        const g = autoGrade(st.total);

        body.innerHTML += `
            <tr>
                <td>${st.code}</td>
                <td>${st.name}</td>
                <td>${st.total}</td>
                <td>${g}</td>
                <td>
                    <select id="grade-${st.student_id}">
                        <option value="A" ${g=="A"?"selected":""}>A</option>
                        <option value="B+" ${g=="B+"?"selected":""}>B+</option>
                        <option value="B" ${g=="B"?"selected":""}>B</option>
                        <option value="C+" ${g=="C+"?"selected":""}>C+</option>
                        <option value="C" ${g=="C"?"selected":""}>C</option>
                        <option value="D+" ${g=="D+"?"selected":""}>D+</option>
                        <option value="D" ${g=="D"?"selected":""}>D</option>
                        <option value="F" ${g=="F"?"selected":""}>F</option>
                    </select>
                </td>
            </tr>
        `;
    });
}


// ============ Finalize (บันทึกลง DB) ================
async function finalizeGrades() {

    const payload = totals.map(st => ({
        student_id: st.student_id,
        total: st.total,
        grade: qs(`#grade-${st.student_id}`).value
    }));

    await fetch(`${API_BASE}/teacher/grade/finalize`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
            subject_id,
            grades: payload
        })
    });

    alert("บันทึกผลการเรียนสำเร็จ!");
}

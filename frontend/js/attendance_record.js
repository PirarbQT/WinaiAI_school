import { qs } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

const params = new URLSearchParams(window.location.search);

const subject_id = params.get("subject");
const class_level = params.get("class");
const room = params.get("room");
const date = params.get("date");

let teacher;

window.onload = async () => {
    teacher = JSON.parse(localStorage.getItem("teacher"));
    if (!teacher) location.href = "/frontend/pages/login.html";

    qs("#info").textContent =
        `วิชา: ${subject_id} | ชั้น: ${class_level}/${room} | วันที่: ${date}`;

    await loadStudents();

    qs("#saveBtn").addEventListener("click", saveAttendance);
};

async function loadStudents() {
    const res = await fetch(
        `${API_BASE}/teacher/attendance/students?class_level=${class_level}&room=${room}`
    );

    const students = await res.json();

    const tbody = qs("#studentRows");
    tbody.innerHTML = "";

    students.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${s.student_code}</td>
                <td>${s.first_name} ${s.last_name}</td>
                <td>
                    <select id="status-${s.id}">
                        <option value="present">มา</option>
                        <option value="late">สาย</option>
                        <option value="absent">ขาด</option>
                        <option value="leave">ลา</option>
                    </select>
                </td>
            </tr>
        `;
    });
}


async function saveAttendance() {
    const rows = document.querySelectorAll("tbody tr");
    const data = [];

    rows.forEach(row => {
        const student_id = row.querySelector("select").id.split("-")[1];
        const status = row.querySelector("select").value;

        data.push({
            teacher_id: teacher.id,
            subject_id,
            class_level,
            room,
            student_id,
            date,
            status
        });
    });

    await fetch(`${API_BASE}/teacher/attendance/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    alert("บันทึกสำเร็จ!");
}

import { requireTeacherLogin, qs, toFileUrl, setState } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

let teacher = null;
let studentId = null;

window.onload = async () => {
    teacher = requireTeacherLogin();

    const params = new URLSearchParams(window.location.search);
    studentId = params.get("id");

    await loadBasic();
    await loadAttendance();
    await loadConduct();
    await loadGrades();
    await loadHealth();
};

/* ---------------------------------------------------
   1) ข้อมูลพื้นฐาน
--------------------------------------------------- */
async function loadBasic() {
    setState(qs("#profileBasic"), "loading", "กำลังโหลดข้อมูลพื้นฐาน...");
    const res = await fetch(
        `${API_BASE}/teacher/profile/basic?student_id=${studentId}`
    );
    const s = await res.json();

    const photo = s.photo_url
        ? `<img src="${toFileUrl(s.photo_url)}" alt="student">`
        : `<i class="fa-solid fa-user"></i>`;

    qs("#profileBasic").innerHTML = `
        <h2>ข้อมูลพื้นฐาน</h2>
        <div class="profile-header">
            <div class="profile-avatar">${photo}</div>
            <div class="profile-main">
                <h3>${s.first_name} ${s.last_name}</h3>
                <p>รหัส: ${s.student_code}</p>
                <p>ระดับชั้น: ${s.level} / ห้อง ${s.room}</p>
            </div>
        </div>
        <div class="info-box">
            <p><strong>วันเกิด:</strong> ${s.birthday || "-"}</p>
            <p><strong>เบอร์โทร:</strong> ${s.phone || "-"}</p>
            <p><strong>ที่อยู่:</strong> ${s.address || "-"}</p>
        </div>
    `;
}

/* ---------------------------------------------------
   2) การมาเรียน
--------------------------------------------------- */
async function loadAttendance() {
    setState(qs("#profileAttendance"), "loading", "กำลังโหลดการมาเรียน...");
    const res = await fetch(
        `${API_BASE}/teacher/profile/attendance?student_id=${studentId}`
    );
    const rows = await res.json();

    if (rows.length === 0) {
        qs("#profileAttendance").innerHTML = `
            <h2>การมาเรียน</h2>
            <div class="info-box">
                <p>ยังไม่มีข้อมูลการมาเรียน</p>
            </div>
        `;
        return;
    }

    let html = `
        <h2>การมาเรียน</h2>
        <div class="info-box">
    `;

    rows.forEach((r) => {
        html += `<p><strong>${r.status}:</strong> ${r.total} วัน</p>`;
    });

    html += `</div>`;

    qs("#profileAttendance").innerHTML = html;
}

/* ---------------------------------------------------
   3) ความประพฤติ
--------------------------------------------------- */
async function loadConduct() {
    setState(qs("#profileConduct"), "loading", "กำลังโหลดคะแนนความประพฤติ...");
    const res = await fetch(
        `${API_BASE}/teacher/profile/conduct?student_id=${studentId}`
    );

    const row = await res.json();

    qs("#profileConduct").innerHTML = `
        <h2>คะแนนความประพฤติ</h2>
        <div class="info-box">
            <p><strong>คะแนนรวม:</strong> ${row.total_score}</p>
        </div>
    `;
}

/* ---------------------------------------------------
   4) ผลการเรียน
--------------------------------------------------- */
async function loadGrades() {
    setState(qs("#profileGrades"), "loading", "กำลังโหลดผลการเรียน...");
    const res = await fetch(
        `${API_BASE}/teacher/profile/grades?student_id=${studentId}`
    );

    const rows = await res.json();

    if (rows.length === 0) {
        qs("#profileGrades").innerHTML = `
            <h2>ผลการเรียน</h2>
            <div class="info-box">
                <p>ยังไม่มีข้อมูลผลการเรียน</p>
            </div>
        `;
        return;
    }

    let html = `
        <h2>ผลการเรียน</h2>
        <table class="profile-table">
            <tr>
                <th>รหัสวิชา</th>
                <th>ชื่อวิชา</th>
                <th>คะแนนรวม</th>
                <th>เกรด</th>
            </tr>
    `;

    rows.forEach((r) => {
        html += `
            <tr>
                <td>${r.subject_code}</td>
                <td>${r.subject_name}</td>
                <td>${r.total_score}</td>
                <td>${r.grade}</td>
            </tr>
        `;
    });

    html += "</table>";

    qs("#profileGrades").innerHTML = html;
}

/* ---------------------------------------------------
   5) สุขภาพ
--------------------------------------------------- */
async function loadHealth() {
    setState(qs("#profileHealth"), "loading", "กำลังโหลดข้อมูลสุขภาพ...");
    const res = await fetch(
        `${API_BASE}/teacher/profile/health?student_id=${studentId}`
    );

    const h = await res.json();

    qs("#profileHealth").innerHTML = `
        <h2>สุขภาพ</h2>
        <div class="info-box">
            <p><strong>น้ำหนัก:</strong> ${h.weight || "-"} kg</p>
            <p><strong>ส่วนสูง:</strong> ${h.height || "-"} cm</p>
            <p><strong>ความดัน:</strong> ${h.blood_pressure || "-"}</p>
            <p><strong>กรุ๊ปเลือด:</strong> ${h.blood_type || "-"}</p>
            <p><strong>แพ้ยา/อาหาร:</strong> ${h.allergies || "-"}</p>
            <p><strong>โรคประจำตัว:</strong> ${h.chronic_illness || "-"}</p>
        </div>
    `;
}

import { requireTeacherLogin, qs, toFileUrl, setState } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

let teacher = null;

window.onload = async () => {
    teacher = requireTeacherLogin();
    loadStudentList();

    const applyBtn = qs("#applyFilterBtn");
    if (applyBtn) {
        applyBtn.addEventListener("click", () => loadStudentList(true));
    }

    const classFilter = qs("#classLevelFilter");
    const roomFilter = qs("#roomFilter");
    if (classFilter && roomFilter) {
        classFilter.addEventListener("change", () => loadStudentList(true));
        roomFilter.addEventListener("change", () => loadStudentList(true));
    }
};

function buildFilterQuery(useFilter) {
    if (!useFilter) return "";
    const level = qs("#classLevelFilter")?.value || "";
    const room = qs("#roomFilter")?.value || "";
    let query = "";
    if (level && level !== "???????") query += `&class_level=${encodeURIComponent(level)}`;
    if (room && room !== "???????") query += `&room=${encodeURIComponent(room)}`;
    return query;
}

async function loadStudentList(useFilter = false) {
    setState(qs("#classInfo"), "loading", "กำลังโหลดข้อมูลห้องเรียน...");
    setState(qs("#studentList"), "loading", "กำลังโหลดรายชื่อนักเรียน...");

    const res = await fetch(
        `${API_BASE}/teacher/students/list?teacher_id=${teacher.id}` + buildFilterQuery(useFilter)
    );

    const data = await res.json();
    const students = Array.isArray(data) ? data : (data.students || []);

    if (!Array.isArray(data)) {
        qs("#classInfo").innerHTML = `
            <h2>ชั้นเรียน: ${data.level} / ห้อง ${data.room}</h2>
        `;
    }

    if (students.length === 0) {
        if (!Array.isArray(data)) {
            qs("#classInfo").innerHTML = `
                <h2>ชั้นเรียน: ${data.level} / ห้อง ${data.room}</h2>
                <p style="margin:6px 0 0; color:#7a6f63;">ไม่มีนักเรียนในห้องที่เลือก</p>
            `;
        }
        setState(qs("#studentList"), "empty", "ไม่มีรายชื่อนักเรียน");
        return;
    }

    renderStudents(students);
}

function renderStudents(list) {
    const box = qs("#studentList");
    box.innerHTML = "";

    list.forEach((s) => {
        const img = s.photo_url
            ? `<img src="${toFileUrl(s.photo_url)}" alt="student">`
            : `<i class="fa-solid fa-user"></i>`;
        box.innerHTML += `
            <div class="student-card">
                <div class="avatar">${img}</div>
                <div class="info">
                    <h3>${s.first_name} ${s.last_name}</h3>
                    <p>รหัส: ${s.student_code}</p>
                </div>
                <button class="btn-outline" onclick="openStudent(${s.id})">
                    ดูโปรไฟล์
                </button>
            </div>
        `;
    });
}

window.openStudent = function (id) {
    window.location.href = `student_profile.html?id=${id}`;
};

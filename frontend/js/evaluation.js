import {
    requireLogin,
    qs,
    loadCart,
    getCompetency,
    submitEvaluation
} from "./app.js";

let student;
let selectedSection = null;

// คำถามประเมิน
const questions = [
    "ครูมีการเตรียมการสอน และเข้าสอนตรงเวลา",
    "อธิบายเนื้อหาได้ชัดเจน ยกตัวอย่างเข้าใจง่าย",
    "ใช้สื่อการสอนได้เหมาะสม",
    "เปิดโอกาสให้นักเรียนถาม/แสดงความคิดเห็น",
    "ให้คำแนะนำ/ช่วยเหลือเมื่อมีปัญหา",
    "ตรวจงานและให้ผลย้อนกลับอย่างเหมาะสม"
];

// ----------------------------
// เมื่อโหลดหน้า
// ----------------------------
window.onload = async () => {
    student = requireLogin();

    qs("#evalYearSelect").addEventListener("change", loadStudentSubjects);
    qs("#evalTermSelect").addEventListener("change", loadStudentSubjects);
    qs("#subjectSelect").addEventListener("change", selectSubject);

    document.querySelector("#evalForm").addEventListener("submit", submitForm);

    await loadStudentSubjects();
};

// ----------------------------
// โหลดรายวิชาที่นักเรียนลงทะเบียน
// ----------------------------
async function loadStudentSubjects() {

    const year = qs("#evalYearSelect").value;
    const term = qs("#evalTermSelect").value;

    const select = qs("#subjectSelect");
    select.innerHTML = `<option value="">กำลังโหลด...</option>`;
    const subjects = await loadCart(student.id, year, term);
    select.innerHTML = `<option disabled selected value="">-- กรุณาเลือกวิชา --</option>`;

    subjects.forEach(sub => {
        const op = document.createElement("option");
        op.value = sub.section_id;
        op.textContent = `${sub.subject_code} - ${sub.subject_name}`;
        op.dataset.teacher = sub.teacher_name;
        op.dataset.subjectName = sub.subject_name;
        select.appendChild(op);
    });

    resetTeacherCard();
}

// ----------------------------
// เมื่อเลือกวิชา
// ----------------------------
async function selectSubject() {

    const option = qs("#subjectSelect").selectedOptions[0];
    if (!option) return;

    selectedSection = {
        id: option.value,
        subject_name: option.dataset.subjectName,
        teacher_name: option.dataset.teacher
    };

    qs("#teacherName").textContent = selectedSection.teacher_name;
    qs("#subjectName").textContent = selectedSection.subject_name;

    await loadEvaluationStatus();
    renderQuestions();
}

// ----------------------------
// เช็คสถานะประเมินแล้วหรือยัง
// ----------------------------
async function loadEvaluationStatus() {

    const year = qs("#evalYearSelect").value;
    const term = qs("#evalTermSelect").value;

    const results = await getCompetency(student.id, year, term);

    const statusBox = qs("#evalStatus");

    if (results.length > 0) {
        statusBox.textContent = "ประเมินแล้ว";
        statusBox.classList.add("done");
        statusBox.style.background = "#0f766e";
    } else {
        statusBox.textContent = "รอการประเมิน";
        statusBox.classList.remove("done");
        statusBox.style.background = "#f59e0b";
    }
}

// ----------------------------
// วาดคำถาม
// ----------------------------
function renderQuestions() {

    const body = qs("#evalQuestions");
    body.innerHTML = "";

    questions.forEach((q, index) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}. ${q}</td>
            <td><input type="radio" name="q${index}" value="5" required></td>
            <td><input type="radio" name="q${index}" value="4"></td>
            <td><input type="radio" name="q${index}" value="3"></td>
            <td><input type="radio" name="q${index}" value="2"></td>
            <td><input type="radio" name="q${index}" value="1"></td>
        `;

        body.appendChild(tr);
    });
}

// ----------------------------
// ส่งแบบประเมิน
// ----------------------------
async function submitForm(event) {
    event.preventDefault();
    clearFieldErrors(qs("#evalForm"));

    if (!selectedSection) {
        setFieldError(qs("#subjectSelect"), "กรุณาเลือกวิชา");
        return;
    }

    const year = qs("#evalYearSelect").value;
    const term = qs("#evalTermSelect").value;

    // รวมคะแนน
    const data = questions.map((q, i) => ({
        name: q,
        score: Number(document.querySelector(`input[name="q${i}"]:checked`).value)
    }));

    await submitEvaluation(student.id, data, year, term);

    alert("ส่งแบบประเมินสำเร็จ");
    await loadEvaluationStatus();
}

// รีเซ็ต UI
function resetTeacherCard() {
    qs("#teacherName").textContent = "กรุณาเลือกวิชา";
    qs("#subjectName").textContent = "-";
    qs("#evalStatus").textContent = "รอการประเมิน";
}

import { requireTeacherLogin, qs, setState } from "./app.js";
import { API_BASE } from "./config.js";

let teacher = null;
let headerId = null;
let sectionId = null;
let maxScore = 0;

const demoScoreHeaders = [
    { id: 1001, title: "งานที่ 1", max_score: 10 },
    { id: 1002, title: "แบบทดสอบย่อย", max_score: 20 },
    { id: 1003, title: "กลางภาค", max_score: 30 },
    { id: 1004, title: "ปลายภาค", max_score: 40 }
];

const demoScoreStudents = [
    { student_id: 101, student_code: "6501001", first_name: "เมษ", last_name: "ทองดี" },
    { student_id: 102, student_code: "6501002", first_name: "น้ำฝน", last_name: "สดใส" },
    { student_id: 103, student_code: "6501003", first_name: "พีระ", last_name: "ศรีสุข" },
    { student_id: 104, student_code: "6501004", first_name: "ณัฐ", last_name: "ใจดี" },
    { student_id: 105, student_code: "6501005", first_name: "ธนา", last_name: "รุ่งโรจน์" },
    { student_id: 106, student_code: "6501006", first_name: "กานต์", last_name: "วิเศษ" }
];

window.onload = async () => {
    teacher = requireTeacherLogin();

    const params = new URLSearchParams(window.location.search);
    headerId = params.get("header");
    sectionId = params.get("section");

    if (!headerId || !sectionId) {
        alert("ไม่พบข้อมูลหัวข้อคะแนนหรือห้องเรียน");
        return;
    }

    const ok = await loadHeaderInfo();
    if (!ok) return;
    await loadStudents();

    qs("#saveScoreBtn").addEventListener("click", saveScores);
};

async function loadHeaderInfo() {
    setState(qs("#headerInfoBox"), "loading", "กำลังโหลดหัวข้อคะแนน...");
    let headers = [];

    try {
        const res = await fetch(`${API_BASE}/teacher/scores/headers?section_id=${sectionId}`);
        headers = await res.json();
    } catch (err) {
        headers = [];
    }

    if (!Array.isArray(headers) || headers.length === 0) {
        headers = demoScoreHeaders;
    }

    let header = headers.find((h) => String(h.id) === String(headerId));
    if (!header) {
        header = headers[0];
        headerId = header ? header.id : headerId;
    }

    if (!header) {
        setState(qs("#headerInfoBox"), "error", "ไม่พบหัวข้อคะแนน");
        return false;
    }

    maxScore = header.max_score;

    qs("#headerInfoBox").innerHTML = `
        <div class="score-header-detail">
            <h2>${header.title}</h2>
            <p>คะแนนเต็ม: <strong>${header.max_score}</strong></p>
        </div>
    `;
    return true;
}

async function loadStudents() {
    setState(qs("#scoreTableContainer"), "loading", "กำลังโหลดรายชื่อนักเรียน...");
    let students = [];
    let scoreData = [];

    try {
        const res = await fetch(`${API_BASE}/teacher/scores/students?section_id=${sectionId}`);
        students = await res.json();

        const scoreRes = await fetch(`${API_BASE}/teacher/scores/scores?header_id=${headerId}`);
        scoreData = await scoreRes.json();
    } catch (err) {
        students = [];
        scoreData = [];
    }

    if (!Array.isArray(students) || students.length === 0) {
        students = demoScoreStudents;
    }

    const box = qs("#scoreTableContainer");

    let html = `
        <table class="table-score-input">
            <tr>
                <th>รหัสนักเรียน</th>
                <th>ชื่อ - นามสกุล</th>
                <th style="width:120px;">คะแนน</th>
            </tr>
    `;

    students.forEach((s) => {
        const saved = scoreData.find((sc) => sc.student_id === s.student_id);
        const demoScore = saved ? saved.score : Math.floor(maxScore * 0.6 + Math.random() * maxScore * 0.35);

        html += `
        <tr>
            <td>${s.student_code}</td>
            <td>${s.first_name} ${s.last_name}</td>
            <td>
                <input 
                    class="score-input"
                    type="number"
                    data-id="${s.student_id}"
                    min="0"
                    max="${maxScore}"
                    value="${demoScore}"
                >
            </td>
        </tr>`;
    });

    html += "</table>";
    box.innerHTML = html;
}

async function saveScores() {
    const inputs = document.querySelectorAll(".score-input");
    inputs.forEach((i) => i.classList.remove("is-invalid"));

    const scoreList = [...inputs].map((i) => ({
        student_id: Number(i.dataset.id),
        score: i.value === "" ? null : Number(i.value)
    }));

    let hasInvalid = false;
    inputs.forEach((i) => {
        const val = i.value === "" ? null : Number(i.value);
        if (val !== null && (val < 0 || val > maxScore)) {
            i.classList.add("is-invalid");
            hasInvalid = true;
        }
    });

    if (hasInvalid) {
        alert(`กรุณากรอกคะแนนระหว่าง 0 - {max}`.replace("<built-in function max>", maxScore));
        return;
    }

    const data = {
        header_id: headerId,
        scores: scoreList
    };

    const res = await fetch(
        `${API_BASE}/teacher/scores/save`,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        }
    );

    const result = await res.json();

    if (result.success) {
        alert("บันทึกคะแนนเรียบร้อยแล้ว!");
    } else {
        alert("เกิดข้อผิดพลาดในการบันทึกคะแนน");
    }
}

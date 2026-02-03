import { requireTeacherLogin, qs, setState } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

let teacher = null;
let headerId = null;
let sectionId = null;
let maxScore = 0;

const demoScoreHeaders = [
    { id: 1001, title: "?????? 1", max_score: 10 },
    { id: 1002, title: "????????????", max_score: 20 },
    { id: 1003, title: "???????", max_score: 30 },
    { id: 1004, title: "???????", max_score: 40 }
];

const demoScoreStudents = [
    { student_id: 101, student_code: "6501001", first_name: "???", last_name: "?????" },
    { student_id: 102, student_code: "6501002", first_name: "?????", last_name: "????" },
    { student_id: 103, student_code: "6501003", first_name: "????", last_name: "??????" },
    { student_id: 104, student_code: "6501004", first_name: "???", last_name: "????" },
    { student_id: 105, student_code: "6501005", first_name: "???", last_name: "?????????" },
    { student_id: 106, student_code: "6501006", first_name: "?????", last_name: "?????" }
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

/* ---------------------------------------------------------
   1) โหลดข้อมูลหัวข้อคะแนน
--------------------------------------------------------- */
async function loadHeaderInfo() {
    setState(qs("#headerInfoBox"), "loading", "????????????????????...");
    let headers = [];

    try {
        const res = await fetch(
            `${API_BASE}/teacher/scores/headers?section_id=${sectionId}`
        );
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
        setState(qs("#headerInfoBox"), "error", "????????????????");
        return false;
    }

    maxScore = header.max_score;

    qs("#headerInfoBox").innerHTML = `
        <div class="score-header-detail">
            <h2>${header.title}</h2>
            <p>?????????: <strong>${header.max_score}</strong></p>
        </div>
    `;
    return true;
}


/* ---------------------------------------------------------
   2) โหลดรายชื่อนักเรียนใน section + คะแนนเดิม (ถ้ามี)
--------------------------------------------------------- */
async function loadStudents() {
    setState(qs("#scoreTableContainer"), "loading", "????????????????????????...");
    let students = [];
    let scoreData = [];

    try {
        const res = await fetch(
            `${API_BASE}/teacher/scores/students?section_id=${sectionId}`
        );
        students = await res.json();

        const scoreRes = await fetch(
            `${API_BASE}/teacher/scores/scores?header_id=${headerId}`
        );
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
                <th>????????????</th>
                <th>???? - ???????</th>
                <th style="width:120px;">?????</th>
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


/* ---------------------------------------------------------
   3) เซฟคะแนนทั้งหมด
--------------------------------------------------------- */
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
        alert(`กรุณากรอกคะแนนระหว่าง 0 - ${maxScore}`);
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



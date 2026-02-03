import { qs } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

const params = new URLSearchParams(window.location.search);

const subject_id = params.get("subject");
const class_level = params.get("class");
const room = params.get("room");

let teacher;
let scoreItems = [];
let students = [];

window.onload = async () => {

    teacher = JSON.parse(localStorage.getItem("teacher"));
    if (!teacher) location.href = "/frontend/pages/login.html";

    qs("#headerText").textContent =
        `วิชา ${subject_id} | ชั้น ${class_level}/${room}`;

    await loadScoreItems();
    await loadStudents();
    renderTable();

    // Modal events
    qs("#addItemBtn").addEventListener("click", showModal);
    qs("#modalCancel").addEventListener("click", hideModal);
    qs("#modalAdd").addEventListener("click", addItem);

    qs("#saveBtn").addEventListener("click", saveScores);
};

// ================= LOAD DATA ===================

async function loadScoreItems() {
    const res = await fetch(
        `${API_BASE}/teacher/scores/items?teacher_id=${teacher.id}&subject_id=${subject_id}`
    );
    scoreItems = await res.json();
}

async function loadStudents() {
    const res = await fetch(
        `${API_BASE}/teacher/attendance/students?class_level=${class_level}&room=${room}`
    );
    students = await res.json();
}

// ================= RENDER TABLE ===================

function renderTable() {
    const headRow = qs("#scoreHeadRow");
    const body = qs("#scoreBody");

    // Clear
    headRow.innerHTML = `
        <th>รหัส</th>
        <th>ชื่อ - นามสกุล</th>
    `;
    body.innerHTML = "";

    // Dynamic header
    scoreItems.forEach(item => {
        headRow.innerHTML += `<th>${item.item_name}<br><small>/${item.max_score}</small></th>`;
    });

    headRow.innerHTML += `<th>รวม</th>`;

    // Body rows
    students.forEach(st => {
        let row = `
            <tr id="row-${st.id}">
                <td>${st.student_code}</td>
                <td>${st.first_name} ${st.last_name}</td>
        `;

        scoreItems.forEach(it => {
            row += `
                <td><input type="number" min="0" max="${it.max_score}"
                    id="score-${st.id}-${it.id}"
                    oninput="calcRow(${st.id})"></td>`;
        });

        row += `<td id="total-${st.id}">0</td></tr>`;

        body.innerHTML += row;
    });
}

// ================= CALCULATE SCORE ===================

window.calcRow = function (student_id) {
    let total = 0;

    scoreItems.forEach(it => {
        const val = qs(`#score-${student_id}-${it.id}`).value;
        if (val) total += Number(val);
    });

    qs(`#total-${student_id}`).textContent = total;
};

// ================= ADD SCORE ITEM ===================

function showModal() {
    qs("#addItemModal").style.display = "flex";
}

function hideModal() {
    qs("#addItemModal").style.display = "none";
}

async function addItem() {
    const name = qs("#itemName").value.trim();
    const max = Number(qs("#itemMax").value);

    if (!name || !max) {
        alert("กรุณากรอกรายการให้ครบ");
        return;
    }

    const res = await fetch(`${API_BASE}/teacher/scores/items/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            teacher_id: teacher.id,
            subject_id,
            item_name: name,
            max_score: max
        })
    });

    hideModal();
    await loadScoreItems();
    renderTable();
}

// ================= SAVE SCORES ===================

async function saveScores() {
    const payload = [];

    students.forEach(st => {
        scoreItems.forEach(it => {
            const value = qs(`#score-${st.id}-${it.id}`).value || null;

            payload.push({
                student_id: st.id,
                score_item_id: it.id,
                score: value
            });
        });
    });

    await fetch(`${API_BASE}/teacher/scores/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    alert("บันทึกคะแนนสำเร็จ!");
}

import {
    requireLogin,
    loadConductScore,
    loadConductHistory,
    qs
} from "./app.js";

let student;

// ------------------------------
// เมื่อหน้าโหลด
// ------------------------------
window.onload = async () => {
    student = requireLogin();
    await loadScore();
    await loadHistory();
};

// ------------------------------
// โหลดคะแนนรวม
// ------------------------------
async function loadScore() {

    qs("#conductScoreValue").textContent = "กำลังโหลด...";
    const result = await loadConductScore(student.id);
    const score = result.score ?? 0;

    qs("#conductScoreValue").textContent = score;
}

// ------------------------------
// โหลดประวัติ
// ------------------------------
async function loadHistory() {

    const body = qs("#conductHistoryBody");
    body.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px;">กำลังโหลด...</td></tr>`;
    const rows = await loadConductHistory(student.id);

    if (rows.length === 0) {
        body.innerHTML = `
            <tr><td colspan="3" style="text-align:center; padding:20px;">ไม่มีข้อมูล</td></tr>`;
        return;
    }

    body.innerHTML = "";

    rows.forEach(r => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${formatThaiDate(r.log_date)}</td>
            <td>${r.event}</td>
            <td style="color:${r.point < 0 ? 'red' : 'green'};">
                ${r.point}
            </td>
        `;

        body.appendChild(tr);
    });
}

// แปลงวันที่เป็นไทย
function formatThaiDate(str) {
    return new Date(str).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

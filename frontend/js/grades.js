import { requireLogin, qs, loadGrades } from "./app.js";

let student;

const demoGrades = [
    { subject_code: "TH1101", subject: "ภาษาไทยพื้นฐาน 1", credit: 1, total: 78, grade: "B+" },
    { subject_code: "MA1101", subject: "คณิตศาสตร์พื้นฐาน 1", credit: 1.5, total: 65, grade: "C+" },
    { subject_code: "SC1101", subject: "วิทยาศาสตร์พื้นฐาน 1", credit: 1.5, total: 70, grade: "B" },
    { subject_code: "EN1101", subject: "ภาษาอังกฤษพื้นฐาน 1", credit: 1, total: 89, grade: "A" },
    { subject_code: "SO1101", subject: "สังคมศึกษา 1", credit: 1, total: 82, grade: "A" }
];

window.onload = async () => {
    student = requireLogin();

    qs("#studentName").textContent = `${student.first_name} ${student.last_name}`;
    qs("#studentCode").textContent = student.student_code;

    qs("#gradeYearSelect").addEventListener("change", refresh);
    qs("#gradeTermSelect").addEventListener("change", refresh);

    const printBtn = qs("#printTranscriptBtn");
    if (printBtn) printBtn.addEventListener("click", () => window.print());

    await refresh();
};

async function refresh() {
    const year = qs("#gradeYearSelect").value;
    const semester = qs("#gradeTermSelect").value;
    const body = qs("#gradeTableBody");

    body.innerHTML = `<tr><td colspan="6" class="center">กำลังโหลด...</td></tr>`;
    const rows = await loadGrades(student.id, year, semester);

    if (!rows || rows.length === 0) {
        renderRows(demoGrades);
        updateGPA(demoGrades);
        return;
    }

    renderRows(rows);
    updateGPA(rows);
}

function renderRows(rows) {
    const body = qs("#gradeTableBody");
    body.innerHTML = "";

    rows.forEach(r => {
        const tr = document.createElement("tr");
        const statusLabel = r.grade ? "ผ่าน" : "รอผล";
        const statusClass = r.grade ? "status-pass" : "status-pending";

        tr.innerHTML = `
            <td>${r.subject_code ?? "-"}</td>
            <td style="text-align:left; padding-left:16px;">${r.subject ?? "-"}</td>
            <td class="center">${r.credit ?? "-"}</td>
            <td class="center">${r.total ?? "-"}</td>
            <td class="center">${r.grade ?? "-"}</td>
            <td class="center"><span class="status-pill ${statusClass}">${statusLabel}</span></td>
        `;

        body.appendChild(tr);
    });
}

function updateGPA(rows) {
    const gradeMap = {
        "A": 4, "B+": 3.5, "B": 3,
        "C+": 2.5, "C": 2,
        "D+": 1.5, "D": 1,
        "F": 0
    };

    let totalCredits = 0;
    let totalPoints = 0;

    rows.forEach(r => {
        const credit = Number(r.credit ?? 1);
        const gp = gradeMap[r.grade];

        if (gp !== undefined) {
            totalCredits += credit;
            totalPoints += gp * credit;
        }
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

    qs("#termCredit").textContent = totalCredits.toFixed(1);
    qs("#totalCredit").textContent = totalCredits.toFixed(1);
    qs("#gpaValue").textContent = gpa.toFixed(2);
    qs("#gpaxValue").textContent = gpa.toFixed(2);
}

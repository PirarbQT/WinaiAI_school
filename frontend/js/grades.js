import {
    requireLogin,
    qs,
    loadGrades
} from "./app.js";

let student;

const demoGrades = [
    { subject_code: "SCI102", subject: "??????????????????", credit: 1.5, total: 78, grade: "B+" },
    { subject_code: "MATH101", subject: "?????????????????", credit: 1.0, total: 72, grade: "B" },
    { subject_code: "ENG102", subject: "??????????", credit: 1.0, total: 80, grade: "A" },
    { subject_code: "SOC101", subject: "??????????", credit: 1.0, total: 74, grade: "B" },
    { subject_code: "THAI101", subject: "???????", credit: 1.0, total: 85, grade: "A" }
];

// เมื่อหน้าโหลด
window.onload = async () => {
    student = requireLogin();

    // set student info
    qs("#studentName").textContent = `${student.first_name} ${student.last_name}`;
    qs("#studentCode").textContent = student.student_code;

    qs("#gradeYearSelect").addEventListener("change", refresh);
    qs("#gradeTermSelect").addEventListener("change", refresh);

    await refresh();
};

// โหลดข้อมูลผลการเรียน
async function refresh() {

    const year = qs("#gradeYearSelect").value;
    const semester = qs("#gradeTermSelect").value;
    const body = qs("#gradeTableBody");

    body.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#777;">กำลังโหลด...</td></tr>`;
    const rows = await loadGrades(student.id, year, semester);

    if (rows.length === 0) {
        renderRows(demoGrades);
        updateGPA(demoGrades);
        return;
    }

    body.innerHTML = "";

    renderRows(rows);

    (r => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${r.subject_code ?? "-"}</td>
            <td style="text-align:left; padding-left:20px;">${r.subject}</td>
            <td>${r.credit ?? "-"}</td>
            <td>${r.total ?? "-"}</td>
            <td>${r.grade ?? "-"}</td>
            <td>${r.grade ? "สำเร็จ" : "-"}</td>
        `;

        body.appendChild(tr);
    });

    function renderRows(rows) {
    const body = qs("#gradeTableBody");
    body.innerHTML = "";

    rows.forEach(r => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${r.subject_code ?? "-"}</td>
            <td style="text-align:left; padding-left:20px;">${r.subject}</td>
            <td>${r.credit ?? "-"}</td>
            <td>${r.total ?? "-"}</td>
            <td>${r.grade ?? "-"}</td>
        `;

        body.appendChild(tr);
    });
}

updateGPA(rows);
}

// คำนวณ GPA
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
        const credit = r.credit ?? 1;
        const gp = gradeMap[r.grade];

        if (gp !== undefined) {
            totalCredits += credit;
            totalPoints += gp * credit;
        }
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

    // แสดงผล
    qs("#sumCredit").textContent = totalCredits;
    qs("#gpaValue").textContent = gpa.toFixed(2);
}

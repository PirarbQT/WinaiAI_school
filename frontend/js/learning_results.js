import {
    requireLogin,
    qs,
    getCompetency
} from "./app.js";

let student;

// เมื่อโหลดหน้า
window.onload = async () => {
    student = requireLogin();

    qs("#lrYearSelect").addEventListener("change", loadResults);
    qs("#lrTermSelect").addEventListener("change", loadResults);

    await loadResults();
};

// โหลดผลประเมิน
async function loadResults() {

    const year = qs("#lrYearSelect").value;
    const term = qs("#lrTermSelect").value;

    const container = qs("#resultsContainer");
    container.innerHTML = `<div class="state-message loading">กำลังโหลดผลประเมิน...</div>`;
    const rows = await getCompetency(student.id, year, term);

    if (rows.length === 0) {
        container.innerHTML = `
            <div class="health-card">
                <p style="text-align:center; padding:20px; color:#777;">
                    ยังไม่มีข้อมูลผลประเมิน
                </p>
            </div>`;
        return;
    }

    // Render
    container.innerHTML = "";

    rows.forEach(r => {

        const card = document.createElement("div");
        card.classList.add("health-card");
        card.style.marginBottom = "20px";

        const percent = (r.score / 5) * 100;

        let color = "#0f766e";
        if (r.score <= 2) color = "#ef4444";
        else if (r.score == 3) color = "#f59e0b";

        card.innerHTML = `
            <div class="card-header-text">
                <i class="fa-solid fa-bullseye"></i> ${r.name}
            </div>

            <div style="padding: 15px;">

                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span>คะแนน:</span>
                    <strong>${r.score}/5</strong>
                </div>

                <div class="bar-bg">
                    <div class="bar-fill" style="width:${percent}%; background:${color};">
                    </div>
                </div>

            </div>
        `;

        container.appendChild(card);
    });
}

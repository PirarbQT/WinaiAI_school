import { API_BASE } from "./config.js";
import { requireDirectorLogin, qs, openModal, closeModal, clearFieldErrors, setFieldError } from "./app.js";

let projects = [];
let chart = null;

window.onload = async () => {
    requireDirectorLogin();

    qs("#openProjectModalBtn").addEventListener("click", () => {
        resetForm();
        openModal("projectModal");
    });
    qs("#saveProjectBtn").addEventListener("click", saveProject);

    qs("#projectYearSelect").addEventListener("change", loadProjects);
    qs("#projectSemesterSelect").addEventListener("change", loadProjects);
    qs("#projectSelect").addEventListener("change", renderSelectedProject);

    await loadProjects();
};

async function loadProjects() {
    const year = qs("#projectYearSelect").value;
    const semester = qs("#projectSemesterSelect").value;
    const res = await fetch(`${API_BASE}/director/projects?year=${year}&semester=${semester}`);
    projects = await res.json();

    const select = qs("#projectSelect");
    if (!projects.length) {
        select.innerHTML = `<option value="">ยังไม่มีโครงการ</option>`;
        renderEmpty();
        return;
    }

    select.innerHTML = projects
        .map((p) => `<option value="${p.id}">${p.name}</option>`)
        .join("");

    renderSelectedProject();
}

function renderSelectedProject() {
    const select = qs("#projectSelect");
    const id = select.value || (projects[0] ? String(projects[0].id) : "");
    const project = projects.find((p) => String(p.id) === String(id));
    if (!project) {
        renderEmpty();
        return;
    }

    const qtyTarget = Number(project.quantity_target || 0);
    const qtyActual = Number(project.quantity_actual || 0);
    const budgetTotal = Number(project.budget_total || 0);
    const budgetUsed = Number(project.budget_used || 0);
    const qualityScore = Number(project.quality_score || 0);
    const kpiScore = Number(project.kpi_score || 0);

    qs("#qtyTarget").textContent = qtyTarget.toLocaleString("th-TH");
    qs("#qtyActual").textContent = qtyActual.toLocaleString("th-TH");
    qs("#budgetTotal").textContent = budgetTotal.toLocaleString("th-TH");
    qs("#budgetUsed").textContent = budgetUsed.toLocaleString("th-TH");
    qs("#qualityScore").textContent = qualityScore.toLocaleString("th-TH");
    qs("#projectKpiScore").textContent = kpiScore.toLocaleString("th-TH");

    const qtyPercent = qtyTarget ? Math.min((qtyActual / qtyTarget) * 100, 100) : 0;
    const budgetPercent = budgetTotal ? Math.min((budgetUsed / budgetTotal) * 100, 100) : 0;
    const qualityPercent = Math.min(qualityScore, 100);

    qs("#qtyBar").style.width = `${qtyPercent}%`;
    qs("#budgetBar").style.width = `${budgetPercent}%`;
    qs("#qualityBar").style.width = `${qualityPercent}%`;

    const status = kpiScore >= 80 ? "ควรดำเนินต่อ" : kpiScore >= 60 ? "ควรปรับปรุง" : "ควรทบทวน";
    qs("#projectStatus").textContent = status;

    renderChart(qtyPercent, budgetPercent, qualityPercent);
}

function renderEmpty() {
    qs("#qtyTarget").textContent = "0";
    qs("#qtyActual").textContent = "0";
    qs("#budgetTotal").textContent = "0";
    qs("#budgetUsed").textContent = "0";
    qs("#qualityScore").textContent = "0";
    qs("#projectKpiScore").textContent = "0";
    qs("#projectStatus").textContent = "ยังไม่มีข้อมูล";
    qs("#qtyBar").style.width = "0%";
    qs("#budgetBar").style.width = "0%";
    qs("#qualityBar").style.width = "0%";
    renderChart(0, 0, 0);
}

function renderChart(qtyPercent, budgetPercent, qualityPercent) {
    const ctx = qs("#projectChart").getContext("2d");
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["ปริมาณ", "งบประมาณ", "คุณภาพ"],
            datasets: [
                {
                    data: [qtyPercent, budgetPercent, qualityPercent],
                    backgroundColor: ["#60a5fa", "#34d399", "#fbbf24"],
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` } }
            }
        }
    });
}

async function saveProject() {
    clearFieldErrors(document.body);
    const payload = {
        name: qs("#projectName").value.trim(),
        year: Number(qs("#projectYear").value),
        semester: Number(qs("#projectSemester").value),
        objective: qs("#projectObjective").value.trim(),
        department: qs("#projectDepartment").value.trim(),
        budget_total: Number(qs("#projectBudget").value || 0),
        quantity_target: Number(qs("#projectQtyTarget").value || 0),
        quantity_actual: Number(qs("#projectQtyActual").value || 0),
        budget_used: Number(qs("#projectBudgetUsed").value || 0),
        quality_score: Number(qs("#projectQuality").value || 0),
        kpi_score: Number(qs("#projectKpi").value || 0)
    };

    if (!payload.name) {
        setFieldError(qs("#projectName"), "กรุณาระบุชื่อโครงการ");
        return;
    }

    await fetch(`${API_BASE}/director/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    closeModal("projectModal");
    resetForm();
    loadProjects();
}

function resetForm() {
    qs("#projectName").value = "";
    qs("#projectObjective").value = "";
    qs("#projectDepartment").value = "";
    qs("#projectBudget").value = "";
    qs("#projectQtyTarget").value = "";
    qs("#projectQtyActual").value = "";
    qs("#projectBudgetUsed").value = "";
    qs("#projectQuality").value = "";
    qs("#projectKpi").value = "";
}

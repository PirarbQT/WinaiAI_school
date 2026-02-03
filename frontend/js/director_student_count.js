import { API_BASE, FILE_BASE } from "./config.js";
﻿import { requireDirectorLogin, qs, setState } from "./app.js";

let countList = [];

window.onload = async () => {
    requireDirectorLogin();
    qs("#applyFilterBtn").addEventListener("click", renderFiltered);
    qs("#clearFilterBtn").addEventListener("click", clearFilter);
    await loadCounts();
};

async function loadCounts() {
    setState(qs("#studentCountBody"), "loading", "กำลังโหลดข้อมูล...");
    const res = await fetch(`${API_BASE}/director/reports/student-count`);
    countList = await res.json();
    renderFiltered();
}

function renderFiltered() {
    const level = qs("#filterLevel").value.trim();
    const room = qs("#filterRoom").value.trim();

    let filtered = countList;
    if (level) {
        filtered = filtered.filter((item) => (item.class_level || "").toString().includes(level));
    }
    if (room) {
        filtered = filtered.filter((item) => (item.room || "").toString().includes(room));
    }

    renderTable(filtered);
    renderSummary(filtered);
}

function renderTable(list) {
    const body = qs("#studentCountBody");
    body.innerHTML = "";
    if (!list.length) {
        body.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px;">ไม่มีข้อมูล</td></tr>`;
        return;
    }

    list.forEach((item) => {
        body.innerHTML += `
            <tr>
                <td>${item.class_level || "-"}</td>
                <td>${item.room || "-"}</td>
                <td>${item.total}</td>
            </tr>
        `;
    });
}

function renderSummary(list) {
    const total = list.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const levels = new Set(list.map((item) => item.class_level || "-"));
    const rooms = new Set(list.map((item) => `${item.class_level || "-"}-${item.room || "-"}`));
    qs("#countTotal").textContent = total.toLocaleString("th-TH");
    qs("#countLevels").textContent = levels.size.toLocaleString("th-TH");
    qs("#countRooms").textContent = rooms.size.toLocaleString("th-TH");
}

function clearFilter() {
    qs("#filterLevel").value = "";
    qs("#filterRoom").value = "";
    renderFiltered();
}


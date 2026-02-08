import { API_BASE } from "./config.js";
import { requireDirectorLogin, qs, setState } from "./app.js";

let countList = [];
let activeGender = "";

window.onload = async () => {
    requireDirectorLogin();
    qs("#applyFilterBtn").addEventListener("click", renderFiltered);
    qs("#clearFilterBtn").addEventListener("click", clearFilter);

    document.querySelectorAll(".gender-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".gender-chip").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            activeGender = btn.dataset.gender || "";
            renderFiltered();
        });
    });

    await loadCounts();
    await loadAttendanceSummary();
};

async function loadCounts() {
    setState(qs("#studentCountBody"), "loading", "กำลังโหลดข้อมูล...");
    const res = await fetch(`${API_BASE}/director/reports/student-count`);
    countList = await res.json();
    renderFiltered();
}

async function loadAttendanceSummary() {
    try {
        const res = await fetch(`${API_BASE}/director/reports/attendance-summary?days=5`);
        const data = await res.json();
        qs("#countLate").textContent = Number(data.late || 0).toLocaleString("th-TH");
        qs("#countAbsent").textContent = Number(data.absent || 0).toLocaleString("th-TH");
        qs("#countLeave").textContent = Number(data.leave || 0).toLocaleString("th-TH");
    } catch (err) {
        console.error(err);
        qs("#countLate").textContent = "0";
        qs("#countAbsent").textContent = "0";
        qs("#countLeave").textContent = "0";
    }
}

function normalizeGender(value) {
    const g = String(value || "").trim().toLowerCase();
    if (!g) return "";
    if (g.startsWith("ช") || g.startsWith("m")) return "male";
    if (g.startsWith("ห") || g.startsWith("f")) return "female";
    return g;
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
    if (activeGender) {
        filtered = filtered.filter((item) => normalizeGender(item.gender) === activeGender);
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

    const grouped = list.reduce((acc, item) => {
        const key = `${item.class_level || "-"}||${item.room || "-"}`;
        acc[key] = acc[key] || { class_level: item.class_level || "-", room: item.room || "-", total: 0 };
        acc[key].total += Number(item.total || 0);
        return acc;
    }, {});

    Object.values(grouped).forEach((item) => {
        body.innerHTML += `
            <tr>
                <td>${item.class_level}</td>
                <td>${item.room}</td>
                <td>${item.total}</td>
            </tr>
        `;
    });
}

function renderSummary(list) {
    const total = list.reduce((sum, item) => sum + Number(item.total || 0), 0);
    const levels = new Set(list.map((item) => item.class_level || "-"));
    const rooms = new Set(list.map((item) => `${item.class_level || "-"}-${item.room || "-"}`));
    const male = list
        .filter((item) => normalizeGender(item.gender) === "male")
        .reduce((sum, item) => sum + Number(item.total || 0), 0);
    const female = list
        .filter((item) => normalizeGender(item.gender) === "female")
        .reduce((sum, item) => sum + Number(item.total || 0), 0);
    qs("#countTotal").textContent = total.toLocaleString("th-TH");
    qs("#countLevels").textContent = levels.size.toLocaleString("th-TH");
    qs("#countRooms").textContent = rooms.size.toLocaleString("th-TH");
    const maleBox = qs("#countMale");
    const femaleBox = qs("#countFemale");
    if (maleBox) maleBox.textContent = male.toLocaleString("th-TH");
    if (femaleBox) femaleBox.textContent = female.toLocaleString("th-TH");
}

function clearFilter() {
    qs("#filterLevel").value = "";
    qs("#filterRoom").value = "";
    activeGender = "";
    document.querySelectorAll(".gender-chip").forEach((b) => b.classList.remove("active"));
    const allBtn = document.querySelector(".gender-chip[data-gender='']");
    if (allBtn) allBtn.classList.add("active");
    renderFiltered();
}

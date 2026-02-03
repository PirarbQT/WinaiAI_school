import { requireLogin, loadActivities, qs } from "./app.js";

let student;

window.onload = async () => {
    student = requireLogin();
    await refreshActivities();
};

// โหลดกิจกรรมทั้งหมด
async function refreshActivities() {

    const upcomingContainer = qs("#upcomingActivities");
    const pastBody = qs("#pastActivitiesBody");

    upcomingContainer.innerHTML = `<div class="state-message loading">กำลังโหลดกิจกรรม...</div>`;
    pastBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px;">กำลังโหลด...</td></tr>`;

    const rows = await loadActivities();

    if (rows.length === 0) {
        upcomingContainer.innerHTML = `<div class="state-message empty">ไม่มีข้อมูลกิจกรรม</div>`;
        pastBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px;">ไม่มีข้อมูล</td></tr>`;
        return;
    }

    const now = new Date();

    rows.forEach(act => {

        const dateObj = new Date(act.date);
        const dateStr = dateObj.toLocaleDateString("th-TH");

        // ---------- กิจกรรมในอนาคต ----------
        if (dateObj >= now) {
            const card = document.createElement("div");

            card.classList.add("student-activity-card");

            card.innerHTML = `
                <h4 style="margin-bottom:5px;">${act.name}</h4>
                <p style="color:#555;"><i class="fa-solid fa-calendar-days"></i> ${dateStr}</p>
                <p style="color:#777;"><i class="fa-solid fa-location-dot"></i> ${act.location}</p>
            `;

            upcomingContainer.appendChild(card);

        } 
        // ---------- กิจกรรมที่ผ่านมา ----------
        else {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${act.name}</td>
                <td>${dateStr}</td>
                <td>${act.location}</td>
            `;
            pastBody.appendChild(tr);
        }
    });

    // หากไม่มี upcoming
    if (upcomingContainer.innerHTML.trim() === "") {
        upcomingContainer.innerHTML = `
            <div style="padding:20px; color:#777;">ไม่มี</div>`;
    }

    // หากไม่มี past
    if (pastBody.innerHTML.trim() === "") {
        pastBody.innerHTML = `
            <tr><td colspan="3" style="text-align:center; padding:20px;">ไม่มีข้อมูล</td></tr>`;
    }
}

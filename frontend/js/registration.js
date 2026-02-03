import {
    qs,
    requireLogin,
    clearFieldErrors,
    setFieldError,
    setState,
    searchSubject,
    loadOpenSections,
    addToCart,
    loadCart,
    removeCartItem
} from "./app.js";

let student;

// เมื่อหน้าโหลด
window.onload = async () => {
    student = requireLogin();
    bindEvents();
    updateHero();
    await loadCartTable();
};

// ผูก event
function bindEvents() {

    qs("#btnSearch").addEventListener("click", searchHandler);

    qs("#regYear").addEventListener("change", () => {
        updateHero();
        loadCartTable();
    });
    qs("#regSemester").addEventListener("change", () => {
        updateHero();
        loadCartTable();
    });

}

function updateHero(count = null) {
    const year = qs("#regYear").value;
    const semester = qs("#regSemester").value;
    const heroYear = document.getElementById("regHeroYear");
    const heroTerm = document.getElementById("regHeroTerm");
    const heroCount = document.getElementById("regHeroCount");

    if (heroYear) heroYear.textContent = year;
    if (heroTerm) heroTerm.textContent = semester;
    if (heroCount && count !== null) heroCount.textContent = count;
}

// ----------------------------------------
// ค้นหารายวิชา
// ----------------------------------------
async function searchHandler() {

    const keyword = qs("#subjectSearch").value.trim();
    const searchResult = qs("#searchResult");
    clearFieldErrors(document.body);

    if (!keyword) {
        setFieldError(qs("#subjectSearch"), "กรุณากรอกคำค้นหา");
        return;
    }

    setState(searchResult, "loading", "กำลังค้นหารายวิชา...");
    const found = await searchSubject(keyword);

    if (found.length === 0) {
        searchResult.innerHTML = `
            <div style="background:#fff0f0; border:1px dashed #e74c3c; padding:15px; border-radius:8px; text-align:center;">
                <i class="fas fa-exclamation-circle" style="color:#e74c3c;"></i>
                ไม่พบรายวิชา
            </div>`;
        return;
    }

    // render รายวิชา (ใช้ตัวแรก)
    const subj = found[0];

    searchResult.innerHTML = `
        <div class="student-activity-card" 
             style="display:flex; justify-content:space-between; align-items:center;">

            <div>
                <h4>${subj.subject_code} - ${subj.name}</h4>
                <p style="color:#666;">
                    <b>หน่วยกิต:</b> ${subj.credit}
                </p>
            </div>

            <button class="btn-primary"
                onclick="selectSubject(${subj.id})">
                <i class="fa-solid fa-cart-plus"></i>
                เลือก
            </button>
        </div>
    `;
}

// ----------------------------------------
// กดเลือกวิชาที่ค้นหาได้
// ----------------------------------------
window.selectSubject = async (subject_id) => {

    const year = qs("#regYear").value;
    const semester = qs("#regSemester").value;

    // ต้องหา section ที่เปิดในปี/เทอมนี้ก่อน
    const sections = await loadOpenSections(year, semester);
    const section = sections.find(s => s.subject_id == subject_id);

    if (!section) {
        alert("วิชานี้ไม่เปิดสอนในปี/เทอมที่เลือก");
        return;
    }

    // เพิ่มเข้าตะกร้า
    await addToCart(student.id, section.id, year, semester);

    // refresh UI
    await loadCartTable();
};

// ----------------------------------------
// โหลดตะกร้า
// ----------------------------------------
async function loadCartTable() {

    const year = qs("#regYear").value;
    const semester = qs("#regSemester").value;
    const tbody = qs("#cartItems");

    tbody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center; padding:25px; color:#777;">
                กำลังโหลดตะกร้า...
            </td>
        </tr>`;
    const items = await loadCart(student.id, year, semester);
    updateHero(items.length);

    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:25px; color:#777;">
                    ยังไม่มีรายวิชาในตะกร้า
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = "";

    items.forEach(item => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.subject_code}</td>
            <td style="text-align:left;">${item.subject_name}</td>
            <td>${item.credit}</td>
            <td>${item.day_of_week ?? "-"} ${item.time_range ?? ""}</td>

            <td>
                <button class="btn-icon delete"
                    onclick="removeItem(${item.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// ----------------------------------------
// ลบออกจากตะกร้า
// ----------------------------------------
window.removeItem = async (id) => {
    await removeCartItem(id);
    await loadCartTable();
};

import {
    requireLogin,
    getHealth,
    updateHealth,
    qs,
    clearFieldErrors,
    setFieldError,
    openModal,
    closeModal
} from "./app.js";

let student;

window.onload = async () => {
    student = requireLogin();
    await loadHealthData();
    qs("#healthForm").addEventListener("submit", saveHealth);
    qs("#openHealthModalBtn").addEventListener("click", () => {
        openModal("healthModal");
    });
};

async function loadHealthData() {
    qs("#weightVal").textContent = "กำลังโหลด...";
    qs("#heightVal").textContent = "กำลังโหลด...";
    qs("#bpVal").textContent = "กำลังโหลด...";
    qs("#bloodType").textContent = "กำลังโหลด...";
    qs("#allergyVal").textContent = "กำลังโหลด...";
    qs("#chronicVal").textContent = "กำลังโหลด...";
    qs("#visionVal").textContent = "กำลังโหลด...";
    const data = await getHealth(student.id);

    if (!data) return;

    qs("#weightVal").textContent = data.weight ?? "-";
    qs("#heightVal").textContent = data.height ?? "-";
    qs("#bpVal").textContent = data.blood_pressure ?? "-";
    qs("#bloodType").textContent = data.blood_type ?? "-";
    qs("#allergyVal").textContent = data.allergies ?? "-";
    qs("#chronicVal").textContent = data.chronic_illness ?? "-";
    const leftVision = data.vision_left ?? "";
    const rightVision = data.vision_right ?? "";
    qs("#visionVal").textContent = leftVision || rightVision ? `${leftVision || "-"} / ${rightVision || "-"}` : "-";

    qs("#inputWeight").value = data.weight ?? "";
    qs("#inputHeight").value = data.height ?? "";
    qs("#inputBP").value = data.blood_pressure ?? "";
    qs("#inputBlood").value = data.blood_type ?? "";
    qs("#inputAllergy").value = data.allergies ?? "";
    qs("#inputChronic").value = data.chronic_illness ?? "";
    renderVaccineInputs(data?.vaccinations || []);

    if (data.weight != null && data.height != null && data.height > 0) {
        const h = data.height / 100;
        const bmi = data.weight / (h * h);

        qs("#bmiVal").textContent = bmi.toFixed(1);

        let txt = "";
        if (bmi < 18.5) txt = "น้ำหนักน้อย";
        else if (bmi < 25) txt = "ปกติ";
        else if (bmi < 30) txt = "น้ำหนักเกิน";
        else txt = "โรคอ้วน";

        qs("#bmiText").textContent = txt;
    } else {
        qs("#bmiVal").textContent = "-";
        qs("#bmiText").textContent = "-";
    }

    renderVaccines(data?.vaccinations || []);
    renderFitness(data?.fitness || []);
}

function renderVaccines(list) {
    const body = qs("#vaccineTableBody");
    if (!body) return;
    if (!Array.isArray(list) || list.length === 0) {
        body.innerHTML = `<tr><td colspan="3" class="center">ยังไม่มีข้อมูล</td></tr>`;
        return;
    }
    body.innerHTML = list.map((v) => `
        <tr>
            <td>${v.name || "-"}</td>
            <td class="center">${v.date || "-"}</td>
            <td class="center">${v.status || "-"}</td>
        </tr>
    `).join("");
}

function renderFitness(list) {
    const body = qs("#fitnessTableBody");
    if (!body) return;
    if (!Array.isArray(list) || list.length === 0) {
        body.innerHTML = `<tr><td colspan="4" class="center">ยังไม่มีข้อมูล</td></tr>`;
        return;
    }
    body.innerHTML = list.map((f) => `
        <tr>
            <td>${f.test_name || f.name || "-"}</td>
            <td class="center">${(f.result_value ?? f.result) ?? "-"}</td>
            <td class="center">${(f.standard_value ?? f.standard) ?? "-"}</td>
            <td class="center">${f.status || "-"}</td>
        </tr>
    `).join("");
}

async function saveHealth(e) {
    e.preventDefault();
    const form = qs("#healthForm");
    clearFieldErrors(form);

    const weightVal = qs("#inputWeight").value;
    const heightVal = qs("#inputHeight").value;

    if (weightVal && Number(weightVal) <= 0) {
        setFieldError(qs("#inputWeight"), "น้ำหนักต้องมากกว่า 0");
        return;
    }
    if (heightVal && Number(heightVal) <= 0) {
        setFieldError(qs("#inputHeight"), "ส่วนสูงต้องมากกว่า 0");
        return;
    }

    const updated = {
        student_id: student.id,
        weight: weightVal,
        height: heightVal,
        blood_pressure: qs("#inputBP").value,
        blood_type: qs("#inputBlood").value,
        allergies: qs("#inputAllergy").value,
        chronic_illness: qs("#inputChronic").value,
        vaccinations: readVaccineInputs()
    };

    await updateHealth(updated);
    alert("บันทึกข้อมูลสุขภาพเรียบร้อยแล้ว");

    await loadHealthData();
    closeModal("healthModal");
}

function renderVaccineInputs(list) {
    const wrap = qs("#vaccineInputs");
    if (!wrap) return;
    wrap.innerHTML = "";
    const items = Array.isArray(list) && list.length ? list : [{}];
    items.forEach((item) => addVaccineRow(item));
}

function addVaccineRow(item = {}) {
    const wrap = qs("#vaccineInputs");
    if (!wrap) return;
    const row = document.createElement("div");
    row.className = "vaccine-row";
    row.innerHTML = `
        <input type="text" class="vaccine-name" placeholder="ชื่อวัคซีน" value="${item.name || ""}">
        <input type="text" class="vaccine-date" placeholder="วันที่ได้รับ" value="${item.date || ""}">
        <input type="text" class="vaccine-status" placeholder="สถานะ" value="${item.status || ""}">
        <button type="button" class="btn-danger btn-sm">ลบ</button>
    `;
    row.querySelector("button").addEventListener("click", () => {
        row.remove();
        if (wrap.children.length === 0) addVaccineRow({});
    });
    wrap.appendChild(row);
}

function readVaccineInputs() {
    const wrap = qs("#vaccineInputs");
    if (!wrap) return [];
    const rows = [...wrap.querySelectorAll(".vaccine-row")];
    return rows
        .map((row) => ({
            name: row.querySelector(".vaccine-name")?.value?.trim() || "",
            date: row.querySelector(".vaccine-date")?.value?.trim() || "",
            status: row.querySelector(".vaccine-status")?.value?.trim() || ""
        }))
        .filter((row) => row.name);
}

document.addEventListener("DOMContentLoaded", () => {
    const addBtn = qs("#addVaccineRowBtn");
    if (addBtn) addBtn.addEventListener("click", () => addVaccineRow({}));
});

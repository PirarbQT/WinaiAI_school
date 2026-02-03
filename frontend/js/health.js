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
    const data = await getHealth(student.id);

    if (!data) return;

    qs("#weightVal").textContent = data.weight ?? "-";
    qs("#heightVal").textContent = data.height ?? "-";
    qs("#bpVal").textContent = data.blood_pressure ?? "-";
    qs("#bloodType").textContent = data.blood_type ?? "-";
    qs("#allergyVal").textContent = data.allergies ?? "-";
    qs("#chronicVal").textContent = data.chronic_illness ?? "-";

    qs("#inputWeight").value = data.weight ?? "";
    qs("#inputHeight").value = data.height ?? "";
    qs("#inputBP").value = data.blood_pressure ?? "";
    qs("#inputBlood").value = data.blood_type ?? "";
    qs("#inputAllergy").value = data.allergies ?? "";
    qs("#inputChronic").value = data.chronic_illness ?? "";

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
        chronic_illness: qs("#inputChronic").value
    };

    await updateHealth(updated);
    alert("บันทึกข้อมูลสุขภาพเรียบร้อยแล้ว");

    await loadHealthData();
    closeModal("healthModal");
}

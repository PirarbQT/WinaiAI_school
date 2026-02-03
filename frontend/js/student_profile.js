import { requireLogin, qs, getStudent, openModal, closeModal } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

let student = null;

window.onload = async () => {
    student = requireLogin();
    await loadProfile();

    qs("#openProfileModalBtn").addEventListener("click", () => {
        openModal("profileModal");
    });

    qs("#profileForm").addEventListener("submit", saveProfile);
};

async function loadProfile() {
    const res = await fetch(`${API_BASE}/student/profile?student_id=${student.id}`);
    const data = await res.json();

    qs("#profileCode").textContent = data.student_code || "-";
    qs("#profileClass").textContent = `${data.class_level || "-"}/${data.classroom || data.room || "-"}`;
    qs("#profileName").textContent = `${data.first_name || "-"} ${data.last_name || ""}`.trim();
    qs("#profileBirthday").textContent = formatDate(data.birthday);
    qs("#profilePhone").textContent = data.phone || "-";
    qs("#profileAddress").textContent = data.address || "-";

    qs("#profileFirst").value = data.first_name || "";
    qs("#profileLast").value = data.last_name || "";
    qs("#profileBirthdayInput").value = data.birthday ? data.birthday.slice(0, 10) : "";
    qs("#profilePhoneInput").value = data.phone || "";
    qs("#profileAddressInput").value = data.address || "";
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("th-TH");
}

async function saveProfile(e) {
    e.preventDefault();

    const payload = {
        student_id: student.id,
        first_name: qs("#profileFirst").value.trim(),
        last_name: qs("#profileLast").value.trim(),
        birthday: qs("#profileBirthdayInput").value,
        phone: qs("#profilePhoneInput").value.trim(),
        address: qs("#profileAddressInput").value.trim()
    };

    const res = await fetch(`${API_BASE}/student/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok) {
        alert(result?.error || "บันทึกไม่สำเร็จ");
        return;
    }

    const stored = getStudent();
    if (stored) {
        stored.first_name = payload.first_name;
        stored.last_name = payload.last_name;
        localStorage.setItem("student", JSON.stringify(stored));
    }

    await loadProfile();
    closeModal("profileModal");
    alert("บันทึกข้อมูลเรียบร้อย");
}

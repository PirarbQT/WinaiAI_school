import { requireLogin, qs, getStudent, openModal, closeModal, loadAdvisor } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

let student = null;

window.onload = async () => {
    student = requireLogin();
    await loadProfile();
    await loadAdvisorCard();

    qs("#openProfileModalBtn").addEventListener("click", () => {
        openModal("profileModal");
    });

    qs("#profileForm").addEventListener("submit", saveProfile);
};

async function loadProfile() {
    const res = await fetch(`${API_BASE}/student/profile?student_id=${student.id}`);
    const data = await res.json();

    setText("#profileCode", data.student_code || "-");
    setText("#profileClass", `${data.class_level || "-"}/${data.classroom || data.room || "-"}`);
    setText("#profileName", `${data.first_name || "-"} ${data.last_name || ""}`.trim());
    setText("#profileBirthday", formatDate(data.birthday));
    setText("#profilePhone", data.phone || "-");
    setText("#profileAddress", data.address || "-");

    setValue("#profileFirst", data.first_name || "");
    setValue("#profileLast", data.last_name || "");
    setValue("#profileBirthdayInput", data.birthday ? data.birthday.slice(0, 10) : "");
    setValue("#profilePhoneInput", data.phone || "");
    setValue("#profileAddressInput", data.address || "");
}

async function loadAdvisorCard() {
    const target = qs("#profileAdvisor");
    if (!target) return;
    const data = await loadAdvisor(student.id);
    const advisor = data?.advisor;
    if (!advisor) {
        target.textContent = "-";
        return;
    }
    const name = `${advisor.teacher_code || ""} ${advisor.first_name || ""} ${advisor.last_name || ""}`.trim();
    target.textContent = name || "-";
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("th-TH");
}

function setText(selector, value) {
    const el = qs(selector);
    if (!el) return;
    el.textContent = value;
}

function setValue(selector, value) {
    const el = qs(selector);
    if (!el) return;
    el.value = value;
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

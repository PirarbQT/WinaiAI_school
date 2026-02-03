import { clearFieldErrors, setFieldError } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

const roleMap = {
    student: {
        title: "เข้าสู่ระบบนักเรียน",
        subtitle: "ใช้รหัสนักเรียนและรหัสผ่าน",
        codeLabel: "รหัสนักเรียน",
        codePlaceholder: "เช่น 6501001",
        endpoint: `${API_BASE}/auth/login`,
        payloadKey: "student_code",
        redirect: "./student/registration.html",
        storageKey: "student",
        storageShape: (data) => data.student
    },
    teacher: {
        title: "เข้าสู่ระบบครู",
        subtitle: "ใช้รหัสครูและรหัสผ่าน",
        codeLabel: "รหัสครู",
        codePlaceholder: "เช่น T001",
        endpoint: `${API_BASE}/teacher/auth/login`,
        payloadKey: "teacher_code",
        redirect: "./teacher/dashboard.html",
        storageKey: "teacher",
        storageShape: (data) => ({ token: data.token, teacher: data.teacher })
    },
    director: {
        title: "เข้าสู่ระบบผอ",
        subtitle: "ใช้รหัสผอและรหัสผ่าน",
        codeLabel: "รหัสผอ",
        codePlaceholder: "เช่น D001",
        endpoint: `${API_BASE}/director/auth/login`,
        payloadKey: "director_code",
        redirect: "./director/dashboard.html",
        storageKey: "director",
        storageShape: (data) => ({ token: data.token, director: data.director })
    }
};

const roleTabs = document.getElementById("roleTabs");
const roleTitle = document.getElementById("roleTitle");
const roleSubtitle = document.getElementById("roleSubtitle");
const codeLabel = document.getElementById("codeLabel");
const loginCode = document.getElementById("loginCode");
const loginPass = document.getElementById("loginPass");
const loginForm = document.getElementById("loginForm");

let currentRole = "student";

function setRole(role) {
    currentRole = role;
    const config = roleMap[role];
    roleTitle.textContent = config.title;
    roleSubtitle.textContent = config.subtitle;
    codeLabel.textContent = config.codeLabel;
    loginCode.placeholder = config.codePlaceholder;

    roleTabs.querySelectorAll(".role-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.role === role);
    });

    clearFieldErrors(loginForm);
    loginCode.value = "";
    loginPass.value = "";
    loginCode.focus();
}

async function handleLogin(event) {
    event.preventDefault();

    const code = loginCode.value.trim();
    const password = loginPass.value.trim();
    clearFieldErrors(loginForm);

    if (!code || !password) {
        if (!code) setFieldError(loginCode, `กรุณากรอก${roleMap[currentRole].codeLabel}`);
        if (!password) setFieldError(loginPass, "กรุณากรอกรหัสผ่าน");
        return;
    }

    const config = roleMap[currentRole];
    const payload = { [config.payloadKey]: code, password };

    try {
        const res = await fetch(config.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok || data.error) {
            setFieldError(loginPass, data.error || "เข้าสู่ระบบไม่สำเร็จ");
            return;
        }

        localStorage.removeItem("student");
        localStorage.removeItem("teacher");
        localStorage.removeItem("director");
        localStorage.setItem(config.storageKey, JSON.stringify(config.storageShape(data)));
        window.location.href = config.redirect;
    } catch (err) {
        console.error(err);
        setFieldError(loginPass, "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
}

roleTabs.addEventListener("click", (event) => {
    const btn = event.target.closest(".role-btn");
    if (!btn) return;
    setRole(btn.dataset.role);
});

loginForm.addEventListener("submit", handleLogin);

setRole(currentRole);

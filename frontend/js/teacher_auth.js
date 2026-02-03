import { clearFieldErrors, setFieldError } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

export async function loginTeacher() {

    const username = document.querySelector("#loginUser").value.trim();
    const password = document.querySelector("#loginPass").value.trim();
    const form = document.querySelector(".login-form");
    clearFieldErrors(form);

    if (!username || !password) {
        if (!username) setFieldError(document.querySelector("#loginUser"), "กรุณากรอกรหัสครู");
        if (!password) setFieldError(document.querySelector("#loginPass"), "กรุณากรอกรหัสผ่าน");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/teacher/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teacher_code: username, password })
        })


        const data = await res.json();

        if (!res.ok) {
            setFieldError(document.querySelector("#loginPass"), data.error || "เข้าสู่ระบบไม่สำเร็จ");
            return;
        }

        // บันทึกข้อมูลครูลง LocalStorage
        localStorage.setItem("teacher", JSON.stringify({
            token: data.token,
            teacher: data.teacher
        }));

        // ไปหน้า dashboard
        window.location.href = "dashboard.html";

    } catch (err) {
        console.log(err);
        alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
}

// ฟังก์ชันออกจากระบบ
export function logoutTeacher() {
    localStorage.removeItem("teacher");
    const base = window.location.origin;
    window.location.href = base + "/frontend/pages/login.html";
}

// Global
window.loginTeacher = loginTeacher;
window.logoutTeacher = logoutTeacher;

import { clearFieldErrors, setFieldError } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

export async function loginDirector() {
    const code = document.querySelector("#loginDirectorCode").value.trim();
    const password = document.querySelector("#loginDirectorPass").value.trim();
    const form = document.querySelector(".login-form");
    clearFieldErrors(form);

    if (!code || !password) {
        if (!code) setFieldError(document.querySelector("#loginDirectorCode"), "กรุณากรอกรหัสผอ");
        if (!password) setFieldError(document.querySelector("#loginDirectorPass"), "กรุณากรอกรหัสผ่าน");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/director/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ director_code: code, password })
        });

        const data = await res.json();
        if (!res.ok) {
            setFieldError(document.querySelector("#loginDirectorPass"), data.error || "เข้าสู่ระบบไม่สำเร็จ");
            return;
        }

        localStorage.setItem("director", JSON.stringify({
            token: data.token,
            director: data.director
        }));

        window.location.href = "dashboard.html";
    } catch (err) {
        console.error(err);
        setFieldError(document.querySelector("#loginDirectorPass"), "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
}

window.loginDirector = loginDirector;

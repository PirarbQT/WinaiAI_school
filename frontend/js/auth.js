import { API_BASE, FILE_BASE } from "./config.js";
﻿import { qs, getStudent, clearFieldErrors, setFieldError } from "./app.js";

const AUTH_BASE = `${API_BASE}/auth`;

/* ==========================================
   LOGIN FUNCTION
   ========================================== */

window.login = async function () {

    const student_code = qs("#loginCode").value.trim();
    const password = qs("#loginPass").value.trim();
    const form = document.querySelector(".login-form");
    clearFieldErrors(form);

    if (!student_code || !password) {
        if (!student_code) setFieldError(qs("#loginCode"), "กรุณากรอกรหัสนักเรียน");
        if (!password) setFieldError(qs("#loginPass"), "กรุณากรอกรหัสผ่าน");
        return;
    }

    const res = await fetch(`${AUTH_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_code, password })
    });

    const data = await res.json();

    if (data.error) {
        setFieldError(qs("#loginPass"), data.error);
        return;
    }

    // บันทึกลง localStorage
    localStorage.setItem("student", JSON.stringify(data.student));

    // ไปหน้าแรก (registration)
    window.location.href = "./registration.html";
};

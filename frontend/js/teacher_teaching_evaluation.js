import { API_BASE } from "./config.js";
import { requireTeacherLogin, qs, setState } from "./app.js";

let teacher = null;
let sections = [];

window.onload = async () => {
    teacher = requireTeacherLogin();

    qs("#teachEvalYear").addEventListener("change", loadSections);
    qs("#teachEvalSemester").addEventListener("change", loadSections);
    qs("#teachEvalSection").addEventListener("change", loadSummary);

    await loadSections();
};

async function loadSections() {
    const year = qs("#teachEvalYear").value;
    const semester = qs("#teachEvalSemester").value;
    const select = qs("#teachEvalSection");

    select.innerHTML = `<option value="">กำลังโหลด...</option>`;
    const res = await fetch(
        `${API_BASE}/teacher/evaluation/teaching/sections?teacher_id=${teacher.id}&year=${year}&semester=${semester}`
    );
    sections = await res.json();

    if (!Array.isArray(sections) || sections.length === 0) {
        select.innerHTML = `<option value="">ยังไม่มีรายวิชาที่สอน</option>`;
        setState(qs("#teachEvalSummary"), "empty", "ไม่มีข้อมูลการประเมิน");
        qs("#teachEvalFeedback").innerHTML = "";
        qs("#teachingEvalStatus").textContent = "ไม่มีรายวิชา";
        return;
    }

    select.innerHTML = `<option value="">-- กรุณาเลือกวิชา --</option>`;
    sections.forEach((sec) => {
        const opt = document.createElement("option");
        opt.value = sec.section_id;
        opt.textContent = `${sec.subject_code} - ${sec.subject_name}`;
        select.appendChild(opt);
    });

    qs("#teachingEvalStatus").textContent = "รอเลือกวิชา";
    qs("#teachEvalSummary").innerHTML = `
        <tr><td colspan="3" class="center">กรุณาเลือกวิชา</td></tr>
    `;
    qs("#teachEvalFeedback").innerHTML = "";
}

async function loadSummary() {
    const year = qs("#teachEvalYear").value;
    const semester = qs("#teachEvalSemester").value;
    const sectionId = qs("#teachEvalSection").value;
    if (!sectionId) return;

    qs("#teachingEvalStatus").textContent = "กำลังโหลด";
    setState(qs("#teachEvalSummary"), "loading", "กำลังโหลด...");

    const res = await fetch(
        `${API_BASE}/teacher/evaluation/teaching/summary?section_id=${sectionId}&year=${year}&semester=${semester}`
    );
    const rows = await res.json();

    if (!Array.isArray(rows) || rows.length === 0) {
        setState(qs("#teachEvalSummary"), "empty", "ยังไม่มีผลประเมิน");
    } else {
        const body = rows.map((r) => `
            <tr>
                <td>${r.name}</td>
                <td class="center">${Number(r.avg_score || 0).toFixed(2)}</td>
                <td class="center">${r.responses || 0}</td>
            </tr>
        `).join("");
        qs("#teachEvalSummary").innerHTML = body;
    }

    await loadFeedback(sectionId, year, semester);
    qs("#teachingEvalStatus").textContent = "พร้อมดูผล";
}

async function loadFeedback(sectionId, year, semester) {
    const wrap = qs("#teachEvalFeedback");
    wrap.innerHTML = "";

    const res = await fetch(
        `${API_BASE}/teacher/evaluation/teaching/feedback?section_id=${sectionId}&year=${year}&semester=${semester}`
    );
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
        wrap.innerHTML = `<div class="state-message empty">ยังไม่มีข้อเสนอแนะ</div>`;
        return;
    }

    items.forEach((item) => {
        const date = item.created_at ? new Date(item.created_at).toLocaleDateString("th-TH") : "-";
        const div = document.createElement("div");
        div.className = "feedback-item";
        div.innerHTML = `
            <div class="feedback-text">${item.feedback}</div>
            <div class="feedback-meta">${date}</div>
        `;
        wrap.appendChild(div);
    });
}

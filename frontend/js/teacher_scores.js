import { requireTeacherLogin, qs, setState, clearFieldErrors, setFieldError, openModal, closeModal } from "./app.js";
import { API_BASE, FILE_BASE } from "./config.js";

let teacher = null;
let sectionList = [];
let selectedSection = null;

const demoSections = [
    { section_id: 501, subject_code: "SCI102", subject_name: "??????????????????", class_level: "?.1", room: "1" },
    { section_id: 502, subject_code: "MATH101", subject_name: "?????????????????", class_level: "?.1", room: "1" },
    { section_id: 503, subject_code: "ENG102", subject_name: "??????????", class_level: "?.1", room: "1" },
    { section_id: 504, subject_code: "SOC101", subject_name: "??????????", class_level: "?.1", room: "1" }
];

const demoHeaders = [
    { id: 1001, title: "?????? 1", max_score: 10 },
    { id: 1002, title: "????????????", max_score: 20 },
    { id: 1003, title: "???????", max_score: 30 },
    { id: 1004, title: "???????", max_score: 40 }
];

let useDemoData = false;

window.onload = async () => {
    teacher = requireTeacherLogin();

    await loadSubjects();

    qs("#subjectSelect").addEventListener("change", loadSectionInfo);
    qs("#levelSelect").addEventListener("change", updateSectionSelection);
    qs("#roomSelect").addEventListener("change", updateSectionSelection);
    qs("#loadHeadersBtn").addEventListener("click", loadHeaders);
    qs("#addHeaderBtn").addEventListener("click", addHeader);
    qs("#openHeaderModalBtn").addEventListener("click", () => {
        qs("#headerName").value = "";
        qs("#maxScore").value = "";
        openModal("headerModal");
    });

    setState(qs("#headerList"), "empty", "กรุณาเลือกวิชา และ ห้องเรียนก่อน");
};

async function loadSubjects() {
    const box = qs("#subjectSelect");
    box.innerHTML = "<option value=''>?????????...</option>";

    let subjects = [];
    try {
        const res = await fetch(
            `${API_BASE}/teacher/scores/subjects?teacher_id=${teacher.id}`
        );
        subjects = await res.json();
    } catch (err) {
        subjects = [];
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
        useDemoData = true;
        subjects = demoSections;
    }

    sectionList = subjects;
    box.innerHTML = "";

    subjects.forEach((sec) => {
        box.innerHTML += `
            <option value="${sec.section_id}">
                ${sec.subject_code} - ${sec.subject_name}
            </option>
        `;
    });

    selectedSection = subjects[0] ? subjects[0].section_id : null;
    if (selectedSection) loadSectionInfo();
}


function loadSectionInfo() {
    const secId = qs("#subjectSelect").value;
    const sec = sectionList.find((s) => s.section_id == secId);

    if (!sec) return;

    qs("#levelSelect").value = sec.class_level;
    qs("#roomSelect").value = sec.room;

    selectedSection = sec.section_id;
}

function updateSectionSelection() {
    const level = qs("#levelSelect").value;
    const room = qs("#roomSelect").value;

    const sec = sectionList.find(
        (s) => String(s.class_level) === String(level) && String(s.room) === String(room)
    );

    if (sec) selectedSection = sec.section_id;
}

async function loadHeaders() {
    const form = qs(".score-select-section");
    clearFieldErrors(form);
    if (!selectedSection) {
        setFieldError(qs("#subjectSelect"), "??????????????");
        return;
    }

    if (useDemoData) {
        renderHeaders(demoHeaders);
        return;
    }

    setState(qs("#headerList"), "loading", "????????????????????...");
    const res = await fetch(
        `${API_BASE}/teacher/scores/headers?section_id=${selectedSection}`
    );

    const headers = await res.json();
    if (!Array.isArray(headers) || headers.length === 0) {
        renderHeaders(demoHeaders);
        return;
    }
    renderHeaders(headers);
}


function renderHeaders(list) {
    const box = qs("#headerList");
    box.innerHTML = "";

    if (list.length === 0) {
        setState(box, "empty", "— ยังไม่มีหัวข้อคะแนน —");
        return;
    }

    list.forEach((h) => {
        box.innerHTML += `
            <div class="header-item"
                style="
                    background:white;
                    padding:15px;
                    border-radius:10px;
                    border:1px solid #ddd;
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                ">
                <div>
                    <strong>${h.title}</strong>
                    <span style="color:#777;">(เต็ม ${h.max_score})</span>
                </div>

                <div style="display:flex; gap:8px;">
                    <button class="btn-outline" onclick="openScoreInput(${h.id})">
                        กรอกคะแนน
                    </button>
                    <button class="btn-danger" onclick="deleteHeader(${h.id})" style="padding:8px 10px;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

window.openScoreInput = function (id) {
    window.location.href = `score_input.html?header=${id}&section=${selectedSection}`;
};

window.deleteHeader = async function (id) {
    if (!confirm("ต้องการลบหัวข้อคะแนนนี้หรือไม่?")) return;

    const res = await fetch(
        `${API_BASE}/teacher/scores/header_delete/${id}`,
        { method: "DELETE" }
    );
    const data = await res.json();

    if (data.success) {
        loadHeaders();
    } else {
        alert("ลบไม่สำเร็จ");
    }
};

async function addHeader() {
    const name = qs("#headerName").value.trim();
    const maxScore = qs("#maxScore").value;
    const form = qs("#headerModal");
    clearFieldErrors(form);

    if (!selectedSection) {
        setFieldError(qs("#subjectSelect"), "กรุณาเลือกวิชา");
        return;
    }

    if (!name || !maxScore) {
        if (!name) setFieldError(qs("#headerName"), "กรุณากรอกชื่อหัวข้อคะแนน");
        if (!maxScore) setFieldError(qs("#maxScore"), "กรุณากรอกคะแนนเต็ม");
        return;
    }

    if (Number(maxScore) <= 0) {
        setFieldError(qs("#maxScore"), "คะแนนเต็มต้องมากกว่า 0");
        return;
    }

    const data = {
        section_id: selectedSection,
        header_name: name,
        max_score: Number(maxScore)
    };

    const res = await fetch(
        `${API_BASE}/teacher/scores/header_add`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }
    );

    await res.json();
    loadHeaders();
    closeModal("headerModal");
}

import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

const DEFAULT_TOPICS = [
    "ครูมีการเตรียมการสอน และเข้าสอนตรงเวลา",
    "อธิบายเนื้อหาได้ชัดเจน ยกตัวอย่างเข้าใจง่าย",
    "ใช้สื่อการสอนได้เหมาะสม",
    "เปิดโอกาสให้นักเรียนถาม/แสดงความคิดเห็น",
    "ให้คำแนะนำ/ช่วยเหลือเมื่อมีปัญหา",
    "ตรวจงานและให้ผลย้อนกลับอย่างเหมาะสม"
];

const DEFAULT_FITNESS_TESTS = [
    "ลุกนั่ง 30 วินาที",
    "ดันพื้น 30 วินาที",
    "วิ่งเก็บของ",
    "วิ่ง 50 เมตร",
    "วิ่ง 800 เมตร",
    "นั่งงอตัวไปข้างหน้า"
];

async function ensureAdvisorEvaluationTable() {
    await pool.query(
        `CREATE TABLE IF NOT EXISTS advisor_evaluation_results (
            id SERIAL PRIMARY KEY,
            student_id integer NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            teacher_id integer NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
            topic character varying(255) NOT NULL,
            score integer,
            year integer NOT NULL,
            semester integer NOT NULL,
            created_at timestamp without time zone DEFAULT now()
        )`
    );
}

async function ensureCompetencyFeedbackTable() {
    await pool.query(
        `CREATE TABLE IF NOT EXISTS competency_feedback (
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL,
            section_id INTEGER,
            year INTEGER NOT NULL,
            semester INTEGER NOT NULL,
            feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    );
}

async function ensureSubjectEvaluationTable() {
    await pool.query(
        `CREATE TABLE IF NOT EXISTS subject_evaluation_results (
            id SERIAL PRIMARY KEY,
            student_id integer NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            teacher_id integer NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
            section_id integer NOT NULL REFERENCES subject_sections(id) ON DELETE CASCADE,
            topic character varying(255) NOT NULL,
            score integer,
            year integer NOT NULL,
            semester integer NOT NULL,
            created_at timestamp without time zone DEFAULT now()
        )`
    );
}

async function ensureFitnessTable() {
    await pool.query(
        `CREATE TABLE IF NOT EXISTS student_fitness_tests (
            id SERIAL PRIMARY KEY,
            student_id integer NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            teacher_id integer NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
            test_name character varying(255) NOT NULL,
            result_value character varying(255),
            standard_value character varying(255),
            status character varying(100),
            year integer NOT NULL,
            semester integer NOT NULL,
            created_at timestamp without time zone DEFAULT now()
        )`
    );
}

async function getAdvisorClass(teacher_id, year, semester) {
    const result = await pool.query(
        `SELECT class_level
         FROM teacher_advisors
         WHERE teacher_id=$1 AND year=$2 AND semester=$3`,
        [teacher_id, year, semester]
    );
    return result.rows[0]?.class_level || null;
}

router.get("/advisor", async (req, res) => {
    try {
        const { teacher_id, year, semester } = req.query;
        if (!teacher_id || !year || !semester) {
            return res.status(400).json({ error: "Missing required params" });
        }
        const classLevel = await getAdvisorClass(teacher_id, year, semester);
        res.json({ class_level: classLevel });
    } catch (err) {
        console.error("ERROR /teacher/evaluation/advisor:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/students", async (req, res) => {
    try {
        const { teacher_id, year, semester } = req.query;
        if (!teacher_id || !year || !semester) {
            return res.status(400).json({ error: "Missing required params" });
        }
        const classLevel = await getAdvisorClass(teacher_id, year, semester);
        if (!classLevel) return res.json([]);

        const students = await pool.query(
            `SELECT id, student_code, first_name, last_name
             FROM students
             WHERE class_level = $1
             ORDER BY student_code ASC`,
            [classLevel]
        );
        res.json(students.rows);
    } catch (err) {
        console.error("ERROR /teacher/evaluation/students:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/topics", async (req, res) => {
    try {
        await ensureAdvisorEvaluationTable();
        const { year, semester } = req.query;
        if (year && semester) {
            const rows = await pool.query(
                `SELECT DISTINCT topic
                 FROM advisor_evaluation_results
                 WHERE year=$1 AND semester=$2
                 ORDER BY topic ASC`,
                [year, semester]
            );
            if (rows.rows.length) {
                return res.json(rows.rows.map((r) => r.topic));
            }
        }
        res.json(DEFAULT_TOPICS);
    } catch (err) {
        console.error("ERROR /teacher/evaluation/topics:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/student", async (req, res) => {
    try {
        await ensureAdvisorEvaluationTable();
        const { teacher_id, student_id, year, semester } = req.query;
        if (!teacher_id || !student_id || !year || !semester) {
            return res.status(400).json({ error: "Missing required params" });
        }
        const rows = await pool.query(
            `SELECT topic, score
             FROM advisor_evaluation_results
             WHERE teacher_id=$1 AND student_id=$2 AND year=$3 AND semester=$4
             ORDER BY topic ASC`,
            [teacher_id, student_id, year, semester]
        );
        res.json(rows.rows);
    } catch (err) {
        console.error("ERROR /teacher/evaluation/student:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/student", async (req, res) => {
    try {
        await ensureAdvisorEvaluationTable();
        const { teacher_id, student_id, year, semester, items } = req.body;
        if (!teacher_id || !student_id || !year || !semester) {
            return res.status(400).json({ error: "Missing required params" });
        }

        const classLevel = await getAdvisorClass(teacher_id, year, semester);
        if (!classLevel) {
            return res.status(403).json({ error: "Advisor not assigned" });
        }

        const student = await pool.query(
            `SELECT class_level FROM students WHERE id=$1`,
            [student_id]
        );
        const studentLevel = student.rows[0]?.class_level;
        if (studentLevel !== classLevel) {
            return res.status(403).json({ error: "Student not in advisor class" });
        }

        await pool.query(
            `DELETE FROM advisor_evaluation_results
             WHERE teacher_id=$1 AND student_id=$2 AND year=$3 AND semester=$4`,
            [teacher_id, student_id, year, semester]
        );

        if (Array.isArray(items)) {
            for (const item of items) {
                if (!item?.topic) continue;
                await pool.query(
                    `INSERT INTO advisor_evaluation_results(student_id, teacher_id, topic, score, year, semester)
                     VALUES($1,$2,$3,$4,$5,$6)`,
                    [student_id, teacher_id, item.topic, item.score ?? null, year, semester]
                );
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /teacher/evaluation/student POST:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/teaching/sections", async (req, res) => {
    try {
        const { teacher_id, year, semester } = req.query;
        if (!teacher_id || !year || !semester) {
            return res.status(400).json({ error: "Missing required params" });
        }
        const rows = await pool.query(
            `SELECT ss.id AS section_id,
                    s.subject_code,
                    s.name AS subject_name
             FROM subject_sections ss
             JOIN subjects s ON ss.subject_id = s.id
             WHERE ss.teacher_id = $1 AND ss.year = $2 AND ss.semester = $3
             ORDER BY s.subject_code ASC`,
            [teacher_id, year, semester]
        );
        res.json(rows.rows);
    } catch (err) {
        console.error("ERROR /teacher/evaluation/teaching/sections:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/teaching/summary", async (req, res) => {
    try {
        const { section_id, year, semester } = req.query;
        if (!section_id || !year || !semester) {
            return res.status(400).json({ error: "Missing required params" });
        }
        const rows = await pool.query(
            `SELECT name,
                    AVG(score)::numeric(4,2) AS avg_score,
                    COUNT(DISTINCT student_id) AS responses
             FROM competency_results
             WHERE section_id = $1 AND year = $2 AND semester = $3
             GROUP BY name
             ORDER BY name ASC`,
            [section_id, year, semester]
        );
        res.json(rows.rows);
    } catch (err) {
        console.error("ERROR /teacher/evaluation/teaching/summary:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/teaching/feedback", async (req, res) => {
    try {
        await ensureCompetencyFeedbackTable();
        const { section_id, year, semester } = req.query;
        if (!section_id || !year || !semester) {
            return res.status(400).json({ error: "Missing required params" });
        }
        const rows = await pool.query(
            `SELECT feedback, created_at
             FROM competency_feedback
             WHERE section_id = $1 AND year = $2 AND semester = $3
               AND feedback IS NOT NULL
             ORDER BY created_at DESC`,
            [section_id, year, semester]
        );
        res.json(rows.rows);
    } catch (err) {
        console.error("ERROR /teacher/evaluation/teaching/feedback:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/subject/topics", async (req, res) => {
    try {
        res.json(DEFAULT_TOPICS);
    } catch (err) {
        console.error("ERROR /teacher/evaluation/subject/topics:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/subject/student", async (req, res) => {
    try {
        await ensureSubjectEvaluationTable();
        const { section_id, student_id, year, semester } = req.query;
        if (!section_id || !student_id || !year || !semester) {
            return res.status(400).json({ error: "Missing required params" });
        }
        const rows = await pool.query(
            `SELECT topic, score
             FROM subject_evaluation_results
             WHERE section_id=$1 AND student_id=$2 AND year=$3 AND semester=$4
             ORDER BY topic ASC`,
            [section_id, student_id, year, semester]
        );
        res.json(rows.rows);
    } catch (err) {
        console.error("ERROR /teacher/evaluation/subject/student:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/subject/student", async (req, res) => {
    try {
        await ensureSubjectEvaluationTable();
        const { teacher_id, section_id, student_id, year, semester, items } = req.body;
        if (!teacher_id || !section_id || !student_id || !year || !semester) {
            return res.status(400).json({ error: "Missing required params" });
        }

        await pool.query(
            `DELETE FROM subject_evaluation_results
             WHERE section_id=$1 AND student_id=$2 AND year=$3 AND semester=$4`,
            [section_id, student_id, year, semester]
        );

        if (Array.isArray(items)) {
            for (const item of items) {
                if (!item?.topic) continue;
                await pool.query(
                    `INSERT INTO subject_evaluation_results(student_id, teacher_id, section_id, topic, score, year, semester)
                     VALUES($1,$2,$3,$4,$5,$6,$7)`,
                    [student_id, teacher_id, section_id, item.topic, item.score ?? null, year, semester]
                );
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /teacher/evaluation/subject/student POST:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/fitness/topics", async (req, res) => {
    try {
        res.json(DEFAULT_FITNESS_TESTS);
    } catch (err) {
        console.error("ERROR /teacher/fitness/topics:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/fitness/student", async (req, res) => {
    try {
        await ensureFitnessTable();
        const { teacher_id, student_id, year, semester } = req.query;
        if (!teacher_id || !student_id || !year || !semester) {
            return res.status(400).json({ error: "Missing required params" });
        }
        const classLevel = await getAdvisorClass(teacher_id, year, semester);
        if (!classLevel) {
            return res.status(403).json({ error: "Advisor not assigned" });
        }
        const student = await pool.query(
            `SELECT class_level FROM students WHERE id=$1`,
            [student_id]
        );
        const studentLevel = student.rows[0]?.class_level;
        if (studentLevel !== classLevel) {
            return res.status(403).json({ error: "Student not in advisor class" });
        }

        const rows = await pool.query(
            `SELECT test_name, result_value, standard_value, status
             FROM student_fitness_tests
             WHERE student_id=$1 AND year=$2 AND semester=$3
             ORDER BY test_name ASC`,
            [student_id, year, semester]
        );
        res.json(rows.rows);
    } catch (err) {
        console.error("ERROR /teacher/fitness/student:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/fitness/student", async (req, res) => {
    try {
        await ensureFitnessTable();
        const { teacher_id, student_id, year, semester, items } = req.body;
        if (!teacher_id || !student_id || !year || !semester) {
            return res.status(400).json({ error: "Missing required params" });
        }

        const classLevel = await getAdvisorClass(teacher_id, year, semester);
        if (!classLevel) {
            return res.status(403).json({ error: "Advisor not assigned" });
        }

        const student = await pool.query(
            `SELECT class_level FROM students WHERE id=$1`,
            [student_id]
        );
        const studentLevel = student.rows[0]?.class_level;
        if (studentLevel !== classLevel) {
            return res.status(403).json({ error: "Student not in advisor class" });
        }

        await pool.query(
            `DELETE FROM student_fitness_tests
             WHERE student_id=$1 AND year=$2 AND semester=$3`,
            [student_id, year, semester]
        );

        if (Array.isArray(items)) {
            for (const item of items) {
                if (!item?.test_name) continue;
                await pool.query(
                    `INSERT INTO student_fitness_tests(student_id, teacher_id, test_name, result_value, standard_value, status, year, semester)
                     VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
                    [student_id, teacher_id, item.test_name, item.result_value || "", item.standard_value || "", item.status || "", year, semester]
                );
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /teacher/fitness/student POST:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;

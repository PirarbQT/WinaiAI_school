import express from "express";
import pool from "../db/pool.js";
import bcrypt from "bcryptjs";

const router = express.Router();

async function verifyDirectorPassword(director_code, password) {
    if (!director_code || !password) {
        return { ok: false, status: 400, message: "กรุณากรอกรหัสผู้อำนวยการ" };
    }

    const result = await pool.query(
        "SELECT password_hash FROM directors WHERE director_code = $1",
        [director_code]
    );
    if (result.rows.length === 0) {
        return { ok: false, status: 400, message: "ไม่พบรหัสผู้อำนวยการ" };
    }

    const valid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!valid) {
        return { ok: false, status: 401, message: "รหัสผ่านไม่ถูกต้อง" };
    }

    return { ok: true };
}

// SUMMARY
router.get("/summary", async (req, res) => {
    try {
        const students = await pool.query("SELECT COUNT(*) FROM students");
        const teachers = await pool.query("SELECT COUNT(*) FROM teachers");
        const subjects = await pool.query("SELECT COUNT(*) FROM subjects");
        const activities = await pool.query("SELECT COUNT(*) FROM school_activities");
        const income = await pool.query(
            "SELECT COALESCE(SUM(amount),0) AS total FROM finance_records WHERE type='income'"
        );
        const expense = await pool.query(
            "SELECT COALESCE(SUM(amount),0) AS total FROM finance_records WHERE type='expense'"
        );

        res.json({
            students: Number(students.rows[0].count),
            teachers: Number(teachers.rows[0].count),
            subjects: Number(subjects.rows[0].count),
            activities: Number(activities.rows[0].count),
            income: Number(income.rows[0].total),
            expense: Number(expense.rows[0].total)
        });
    } catch (err) {
        console.error("ERROR /director/summary:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// STUDENTS CRUD
router.get("/students", async (req, res) => {
    try {
        const { search, class_level, room } = req.query;

        const params = [];
        const where = [];

        if (search) {
            params.push(`%${search}%`);
            where.push(
                `(student_code ILIKE $${params.length} OR first_name ILIKE $${params.length} OR last_name ILIKE $${params.length})`
            );
        }

        if (class_level) {
            params.push(class_level);
            where.push(`class_level = $${params.length}`);
        }

        if (room) {
            params.push(room);
            where.push(`(classroom = $${params.length} OR room = $${params.length})`);
        }

        const result = await pool.query(
            `SELECT id, student_code, first_name, last_name, class_level, classroom, room, photo_url
             FROM students
             ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
             ORDER BY student_code ASC`,
            params
        );
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /director/students:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/students", async (req, res) => {
    try {
        const { student_code, first_name, last_name, class_level, classroom, room, password } = req.body;
        if (!student_code) return res.status(400).json({ error: "กรุณากรอกรหัสนักเรียน" });
        const pass = password || "1234";
        const hash = await bcrypt.hash(pass, 10);

        const result = await pool.query(
            `INSERT INTO students(student_code, first_name, last_name, password_hash, class_level, classroom, room)
             VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
            [student_code, first_name, last_name, hash, class_level, classroom, room]
        );

        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error("ERROR /director/students POST:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { student_code, first_name, last_name, class_level, classroom, room, password } = req.body;

        let passwordHash = null;
        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }

        if (passwordHash) {
            await pool.query(
                `UPDATE students 
                 SET student_code=$1, first_name=$2, last_name=$3, class_level=$4, classroom=$5, room=$6, password_hash=$7 
                 WHERE id=$8`,
                [student_code, first_name, last_name, class_level, classroom, room, passwordHash, id]
            );
        } else {
            await pool.query(
                `UPDATE students 
                 SET student_code=$1, first_name=$2, last_name=$3, class_level=$4, classroom=$5, room=$6 
                 WHERE id=$7`,
                [student_code, first_name, last_name, class_level, classroom, room, id]
            );
        }
        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/students PUT:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/students/:id", async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query("BEGIN");
        await client.query("DELETE FROM registrations WHERE student_id=$1", [id]);
        await client.query("DELETE FROM attendance WHERE student_id=$1", [id]);
        await client.query("DELETE FROM grades WHERE student_id=$1", [id]);
        await client.query("DELETE FROM scores WHERE student_id=$1", [id]);
        await client.query("DELETE FROM competency_results WHERE student_id=$1", [id]);
        await client.query("DELETE FROM conduct_logs WHERE student_id=$1", [id]);
        await client.query("DELETE FROM student_conduct WHERE student_id=$1", [id]);
        await client.query("DELETE FROM student_health WHERE student_id=$1", [id]);
        await client.query("DELETE FROM health_records WHERE student_id=$1", [id]);
        await client.query("DELETE FROM students WHERE id=$1", [id]);
        await client.query("COMMIT");
        res.json({ success: true });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("ERROR /director/students DELETE:", err);
        res.status(500).json({ error: "ไม่สามารถลบนักเรียนได้" });
    } finally {
        client.release();
    }
});

// TEACHERS CRUD
router.get("/teachers", async (req, res) => {
    try {
        const { search } = req.query;
        const q = search ? `%${search}%` : null;
        const result = await pool.query(
            `SELECT id, teacher_code, first_name, last_name, photo_url
             FROM teachers
             WHERE ($1::text IS NULL OR teacher_code ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
             ORDER BY teacher_code ASC`,
            [q]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /director/teachers:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/teachers", async (req, res) => {
    try {
        const { teacher_code, first_name, last_name, password } = req.body;
        if (!teacher_code) return res.status(400).json({ error: "กรุณากรอกรหัสครู" });
        const pass = password || "1234";
        const hash = await bcrypt.hash(pass, 10);

        const result = await pool.query(
            `INSERT INTO teachers(teacher_code, first_name, last_name, password_hash)
             VALUES($1,$2,$3,$4) RETURNING id`,
            [teacher_code, first_name, last_name, hash]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error("ERROR /director/teachers POST:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/teachers/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { teacher_code, first_name, last_name, password } = req.body;

        let passwordHash = null;
        if (password) {
            passwordHash = await bcrypt.hash(password, 10);
        }

        if (passwordHash) {
            await pool.query(
                `UPDATE teachers 
                 SET teacher_code=$1, first_name=$2, last_name=$3, password_hash=$4
                 WHERE id=$5`,
                [teacher_code, first_name, last_name, passwordHash, id]
            );
        } else {
            await pool.query(
                `UPDATE teachers 
                 SET teacher_code=$1, first_name=$2, last_name=$3
                 WHERE id=$4`,
                [teacher_code, first_name, last_name, id]
            );
        }
        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/teachers PUT:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/teachers/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM teachers WHERE id=$1", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/teachers DELETE:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// SUBJECTS CRUD
router.get("/subjects", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, subject_code, name, credit FROM subjects ORDER BY subject_code ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /director/subjects:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/subjects", async (req, res) => {
    try {
        const { subject_code, name, credit } = req.body;
        if (!subject_code || !name) return res.status(400).json({ error: "ข้อมูลไม่ครบ" });
        const result = await pool.query(
            `INSERT INTO subjects(subject_code, name, credit) VALUES($1,$2,$3) RETURNING id`,
            [subject_code, name, credit || 0]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error("ERROR /director/subjects POST:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/subjects/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_code, name, credit } = req.body;
        await pool.query(
            `UPDATE subjects SET subject_code=$1, name=$2, credit=$3 WHERE id=$4`,
            [subject_code, name, credit, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/subjects PUT:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/subjects/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM subjects WHERE id=$1", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/subjects DELETE:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// SECTIONS / CURRICULUM
router.get("/sections", async (req, res) => {
    try {
        const { year, semester } = req.query;
        const result = await pool.query(
            `SELECT ss.*, s.subject_code, s.name AS subject_name,
                    t.first_name || ' ' || t.last_name AS teacher_name
             FROM subject_sections ss
             LEFT JOIN subjects s ON ss.subject_id = s.id
             LEFT JOIN teachers t ON ss.teacher_id = t.id
             WHERE ($1::int IS NULL OR ss.year = $1)
               AND ($2::int IS NULL OR ss.semester = $2)
             ORDER BY ss.year DESC, ss.semester DESC, ss.id DESC`,
            [year || null, semester || null]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /director/sections:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/sections", async (req, res) => {
    try {
        const { subject_id, teacher_id, year, semester, class_level, classroom, day_of_week, time_range, room } = req.body;
        const result = await pool.query(
            `INSERT INTO subject_sections(subject_id, teacher_id, year, semester, class_level, classroom, day_of_week, time_range, room)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
            [subject_id, teacher_id, year, semester, class_level, classroom, day_of_week, time_range, room]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error("ERROR /director/sections POST:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/sections/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_id, teacher_id, year, semester, class_level, classroom, day_of_week, time_range, room } = req.body;
        await pool.query(
            `UPDATE subject_sections
             SET subject_id=$1, teacher_id=$2, year=$3, semester=$4, class_level=$5, classroom=$6, day_of_week=$7, time_range=$8, room=$9
             WHERE id=$10`,
            [subject_id, teacher_id, year, semester, class_level, classroom, day_of_week, time_range, room, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/sections PUT:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/sections/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM subject_sections WHERE id=$1", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/sections DELETE:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ACTIVITIES CRUD
router.get("/activities", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM school_activities ORDER BY date DESC, id DESC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /director/activities:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/activities", async (req, res) => {
    try {
        const { name, date, location } = req.body;
        if (!name || !date) return res.status(400).json({ error: "ข้อมูลไม่ครบ" });
        const result = await pool.query(
            `INSERT INTO school_activities(name, date, location) VALUES($1,$2,$3) RETURNING id`,
            [name, date, location || ""]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error("ERROR /director/activities POST:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/activities/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date, location } = req.body;
        if (!name || !date) return res.status(400).json({ error: "????????????????????????????????????" });
        await pool.query(
            `UPDATE school_activities SET name=$1, date=$2, location=$3 WHERE id=$4`,
            [name, date, location || "", id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/activities PUT:", err);
        res.status(500).json({ error: "Server error" });
    }
});


router.delete("/activities/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM school_activities WHERE id=$1", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/activities DELETE:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// EVALUATION SUMMARY
router.get("/evaluation/summary", async (req, res) => {
    try {
        const { year, semester } = req.query;
        const result = await pool.query(
            `SELECT name, ROUND(AVG(score)::numeric, 2) AS avg_score
             FROM competency_results
             WHERE ($1::int IS NULL OR year=$1)
               AND ($2::int IS NULL OR semester=$2)
             GROUP BY name
             ORDER BY name ASC`,
            [year || null, semester || null]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /director/evaluation/summary:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/evaluation/topics", async (req, res) => {
    try {
        const { year, semester } = req.query;
        const result = await pool.query(
            `SELECT name,
                    ROUND(AVG(score)::numeric, 2) AS avg_score,
                    COUNT(*) AS total
             FROM competency_results
             WHERE ($1::int IS NULL OR year=$1)
               AND ($2::int IS NULL OR semester=$2)
             GROUP BY name
             ORDER BY name ASC`,
            [year || null, semester || null]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /director/evaluation/topics:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/evaluation/student", async (req, res) => {
    try {
        const { student_id, year, semester } = req.query;
        if (!student_id || !year || !semester) {
            return res.status(400).json({ error: "กรุณาระบุข้อมูลให้ครบ" });
        }

        const result = await pool.query(
            `SELECT id, name, score
             FROM competency_results
             WHERE student_id=$1 AND year=$2 AND semester=$3
             ORDER BY id ASC`,
            [student_id, year, semester]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /director/evaluation/student:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/evaluation/student", async (req, res) => {
    try {
        const { director_code, password, student_id, year, semester, data } = req.body;
        const auth = await verifyDirectorPassword(director_code, password);
        if (!auth.ok) return res.status(auth.status).json({ error: auth.message });

        if (!student_id || !year || !semester || !Array.isArray(data)) {
            return res.status(400).json({ error: "กรุณาระบุข้อมูลให้ครบ" });
        }

        await pool.query(
            `DELETE FROM competency_results WHERE student_id=$1 AND year=$2 AND semester=$3`,
            [student_id, year, semester]
        );

        for (const item of data) {
            if (!item.name) continue;
            await pool.query(
                `INSERT INTO competency_results(student_id, name, score, year, semester)
                 VALUES($1,$2,$3,$4,$5)`,
                [student_id, item.name, item.score ?? null, year, semester]
            );
        }

        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/evaluation/student POST:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/evaluation/topics/rename", async (req, res) => {
    try {
        const { director_code, password, old_name, new_name, year, semester } = req.body;
        const auth = await verifyDirectorPassword(director_code, password);
        if (!auth.ok) return res.status(auth.status).json({ error: auth.message });

        if (!old_name || !new_name || !year || !semester) {
            return res.status(400).json({ error: "กรุณาระบุข้อมูลให้ครบ" });
        }

        const result = await pool.query(
            `UPDATE competency_results
             SET name=$1
             WHERE name=$2 AND year=$3 AND semester=$4`,
            [new_name, old_name, year, semester]
        );
        res.json({ success: true, updated: result.rowCount });
    } catch (err) {
        console.error("ERROR /director/evaluation/topics/rename:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/evaluation/topics", async (req, res) => {
    try {
        const { director_code, password, name, year, semester } = req.body;
        const auth = await verifyDirectorPassword(director_code, password);
        if (!auth.ok) return res.status(auth.status).json({ error: auth.message });

        if (!name || !year || !semester) {
            return res.status(400).json({ error: "กรุณาระบุข้อมูลให้ครบ" });
        }

        const result = await pool.query(
            `DELETE FROM competency_results WHERE name=$1 AND year=$2 AND semester=$3`,
            [name, year, semester]
        );
        res.json({ success: true, deleted: result.rowCount });
    } catch (err) {
        console.error("ERROR /director/evaluation/topics DELETE:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// FINANCE CRUD
router.get("/finance", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM finance_records ORDER BY record_date DESC, id DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /director/finance:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/finance", async (req, res) => {
    try {
        const { title, category, amount, type, record_date, note } = req.body;
        if (!title || !amount || !type || !record_date) {
            return res.status(400).json({ error: "ข้อมูลไม่ครบ" });
        }
        const result = await pool.query(
            `INSERT INTO finance_records(title, category, amount, type, record_date, note)
             VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,
            [title, category || "", amount, type, record_date, note || ""]
        );
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error("ERROR /director/finance POST:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/finance/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, amount, type, record_date, note } = req.body;
        await pool.query(
            `UPDATE finance_records
             SET title=$1, category=$2, amount=$3, type=$4, record_date=$5, note=$6
             WHERE id=$7`,
            [title, category, amount, type, record_date, note, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/finance PUT:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/finance/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM finance_records WHERE id=$1", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /director/finance DELETE:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// REPORTS
router.get("/reports/student-count", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT class_level, COALESCE(classroom, room) AS room, COUNT(*) AS total
             FROM students
             GROUP BY class_level, COALESCE(classroom, room)
             ORDER BY class_level, room`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /director/reports/student-count:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;

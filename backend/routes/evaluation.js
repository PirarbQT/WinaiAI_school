import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

async function ensureCompetencyColumns() {
    await pool.query(
        `ALTER TABLE competency_results
         ADD COLUMN IF NOT EXISTS section_id INTEGER`
    );
}

async function ensureFeedbackTable() {
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

router.get("/competency", async (req, res) => {
    const { student_id, year, semester } = req.query;

    const result = await pool.query(
        `SELECT * FROM competency_results
         WHERE student_id=$1 AND year=$2 AND semester=$3`,
        [student_id, year, semester]
    );

    res.json(result.rows);
});

router.post("/submit", async (req, res) => {
    const { student_id, data, year, semester, section_id, feedback } = req.body;

    await ensureCompetencyColumns();
    await ensureFeedbackTable();

    if (section_id) {
        await pool.query(
            `DELETE FROM competency_results
             WHERE student_id=$1 AND year=$2 AND semester=$3 AND section_id=$4`,
            [student_id, year, semester, section_id]
        );

        await pool.query(
            `DELETE FROM competency_feedback
             WHERE student_id=$1 AND section_id=$2 AND year=$3 AND semester=$4`,
            [student_id, section_id, year, semester]
        );
    } else {
        await pool.query(
            `DELETE FROM competency_results WHERE student_id=$1 AND year=$2 AND semester=$3`,
            [student_id, year, semester]
        );
    }

    if (section_id && feedback && String(feedback).trim().length > 0) {
        await pool.query(
            `INSERT INTO competency_feedback(student_id, section_id, year, semester, feedback)
             VALUES($1,$2,$3,$4,$5)`,
            [student_id, section_id, year, semester, feedback.trim()]
        );
    }

    for (const item of data) {
        await pool.query(
            `INSERT INTO competency_results(student_id, section_id, name, score, year, semester)
             VALUES($1,$2,$3,$4,$5,$6)`,
            [student_id, section_id, item.name, item.score, year, semester]
        );
    }

    res.json({ message: "บันทึกสำเร็จ" });
});

export default router;

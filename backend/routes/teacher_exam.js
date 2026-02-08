import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// รายการวันสอบของครู
router.get("/", async (req, res) => {
    try {
        const { teacher_id, year, semester } = req.query;
        if (!teacher_id) {
            return res.status(400).json({ error: "teacher_id required" });
        }

        const params = [teacher_id];
        let extra = "";
        if (year && semester) {
            params.push(year, semester);
            extra = " AND ss.year = $2 AND ss.semester = $3";
        }

        const result = await pool.query(
            `SELECT es.*, s.subject_code, s.name AS subject_name,
                    ss.class_level, ss.classroom AS room,
                    ss.year, ss.semester
             FROM exam_schedule es
             JOIN subject_sections ss ON es.section_id = ss.id
             JOIN subjects s ON ss.subject_id = s.id
             WHERE ss.teacher_id = $1${extra}
             ORDER BY es.exam_date ASC, es.time_range ASC`,
            params
        );

        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /teacher/exam:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// เพิ่มวันสอบ
router.post("/", async (req, res) => {
    try {
        const { section_id, exam_type, exam_date, time_range, room } = req.body;

        const result = await pool.query(
            `INSERT INTO exam_schedule (section_id, exam_type, exam_date, time_range, room)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [section_id, exam_type, exam_date, time_range, room]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("ERROR /teacher/exam add:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ลบวันสอบ
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `DELETE FROM exam_schedule WHERE id = $1 RETURNING *`,
            [id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("ERROR /teacher/exam delete:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;

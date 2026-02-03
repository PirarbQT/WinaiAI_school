import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// ตารางเรียน
router.get("/class", async (req, res) => {
    const { student_id, year, semester } = req.query;

    const result = await pool.query(
        `SELECT ss.day_of_week,
                ss.time_range,
                s.subject_code,
                s.name AS subject_name,
                (t.first_name || ' ' || t.last_name) AS teacher
         FROM registrations r
         JOIN subject_sections ss ON r.section_id = ss.id
         JOIN subjects s ON ss.subject_id = s.id
         LEFT JOIN teachers t ON ss.teacher_id = t.id
         WHERE r.student_id = $1 AND r.year = $2 AND r.semester = $3`,
        [student_id, year, semester]
    );

    res.json(result.rows);
});

// ตารางสอบ
router.get("/exam", async (req, res) => {
    const { student_id, year, semester } = req.query;

    const result = await pool.query(
        `SELECT es.*, s.subject_code, s.name AS subject_name
         FROM exam_schedule es
         JOIN subject_sections ss ON es.section_id = ss.id
         JOIN subjects s ON ss.subject_id = s.id
         JOIN registrations r ON r.section_id = ss.id
         WHERE r.student_id = $1 AND r.year = $2 AND r.semester = $3`,
        [student_id, year, semester]
    );

    res.json(result.rows);
});

export default router;

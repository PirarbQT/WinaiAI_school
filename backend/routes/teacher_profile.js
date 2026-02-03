import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

/* -----------------------------------------------------------
   1) ข้อมูลพื้นฐานนักเรียน
----------------------------------------------------------- */
router.get("/basic", async (req, res) => {
    try {
        const { student_id } = req.query;

        const result = await pool.query(
            `SELECT id, student_code, first_name, last_name, 
                    class_level AS level, classroom AS room, birthday, phone, address, photo_url
             FROM students
             WHERE id = $1`,
            [student_id]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error("ERROR /profile/basic:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* -----------------------------------------------------------
   2) การมาเรียนของนักเรียน
----------------------------------------------------------- */
router.get("/attendance", async (req, res) => {
    try {
        const { student_id } = req.query;

        const result = await pool.query(
            `SELECT status, COUNT(*) AS total 
             FROM attendance
             WHERE student_id = $1
             GROUP BY status`,
            [student_id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error("ERROR /profile/attendance:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* -----------------------------------------------------------
   3) คะแนนความประพฤติ
----------------------------------------------------------- */
router.get("/conduct", async (req, res) => {
    try {
        const { student_id } = req.query;

        const result = await pool.query(
            `SELECT COALESCE(SUM(point), 0) AS total_score
             FROM conduct_logs
             WHERE student_id = $1`,
            [student_id]
        );

        res.json(result.rows[0] || { total_score: 0 });

    } catch (err) {
        console.error("ERROR /profile/conduct:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* -----------------------------------------------------------
   4) ผลการเรียน
----------------------------------------------------------- */
router.get("/grades", async (req, res) => {
    try {
        const { student_id } = req.query;

        const result = await pool.query(
            `SELECT g.total_score, g.grade,
                    s.subject_code, s.name AS subject_name, s.credit
             FROM grades g
             JOIN subject_sections ss ON g.section_id = ss.id
             JOIN subjects s ON ss.subject_id = s.id
             WHERE g.student_id = $1`,
            [student_id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error("ERROR /profile/grades:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* -----------------------------------------------------------
   5) สุขภาพนักเรียน
----------------------------------------------------------- */
router.get("/health", async (req, res) => {
    try {
        const { student_id } = req.query;

        const result = await pool.query(
            `SELECT weight, height, blood_pressure, blood_type, 
                    allergies, chronic_illness
             FROM health_records
             WHERE student_id = $1`,
            [student_id]
        );

        res.json(result.rows[0] || {});

    } catch (err) {
        console.error("ERROR /profile/health:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;

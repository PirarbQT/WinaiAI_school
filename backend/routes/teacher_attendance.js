import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// GET student list for class
router.get("/students", async (req, res) => {
    const { class_level, room } = req.query;

    try {
        const result = await pool.query(
            `SELECT id, student_code, first_name, last_name
             FROM students
             WHERE class_level = $1 AND (classroom = $2 OR room = $2)
             ORDER BY student_code`,
            [class_level, room]
        );

        res.json(result.rows);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// POST attendance record
router.post("/save", async (req, res) => {
    const { teacher_id, subject_id, class_level, room, date, records } = req.body;

    try {
        for (let r of records) {
            await pool.query(
                `INSERT INTO teacher_attendance
                 (teacher_id, student_id, subject_id, class_level, room, status, date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    teacher_id,
                    r.student_id,
                    subject_id,
                    class_level,
                    room,
                    r.status,
                    date
                ]
            );
        }

        res.json({ success: true });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Save failed" });
    }
});

export default router;



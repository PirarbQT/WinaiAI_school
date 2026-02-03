import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// Dashboard Summary
router.get("/summary", async (req, res) => {
    const { teacher_id } = req.query;

    try {
        const studentCount = await pool.query(
            `SELECT COUNT(DISTINCT r.student_id)
             FROM registrations r
             JOIN subject_sections ss ON r.section_id = ss.id
             WHERE ss.teacher_id = $1`,
            [teacher_id]
        );

        const subjectCount = await pool.query(
            `SELECT COUNT(*) FROM subject_sections WHERE teacher_id = $1`,
            [teacher_id]
        );

        res.json({
            students: Number(studentCount.rows[0].count) || 0,
            subjects: Number(subjectCount.rows[0].count) || 0
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" });
    }
});

export default router;

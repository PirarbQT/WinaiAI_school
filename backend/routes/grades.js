import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// ดึงผลการเรียนทั้งหมดของนักเรียน
router.get("/", async (req, res) => {
    const { student_id } = req.query;

    try {
        const result = await pool.query(
            `SELECT s.name AS subject,
                    s.subject_code,
                    s.credit,
                    g.total_score AS total,
                    g.grade
             FROM grades g
             JOIN subject_sections ss ON g.section_id = ss.id
             JOIN subjects s ON ss.subject_id = s.id
             WHERE g.student_id = $1
             ORDER BY s.subject_code ASC`,
            [student_id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


export default router;

import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// คะแนนรวม
router.get("/score", async (req, res) => {
    const { student_id } = req.query;

    const result = await pool.query(
        `SELECT SUM(point) AS score 
         FROM conduct_logs 
         WHERE student_id = $1`,
        [student_id]
    );

    res.json(result.rows[0]);
});

// ประวัติพฤติกรรม
router.get("/history", async (req, res) => {
    const { student_id } = req.query;

    const result = await pool.query(
        `SELECT * FROM conduct_logs 
         WHERE student_id = $1 ORDER BY log_date DESC`,
        [student_id]
    );

    res.json(result.rows);
});

export default router;

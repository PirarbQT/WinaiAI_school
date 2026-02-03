import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// กิจกรรมโรงเรียนทั้งหมด
router.get("/", async (req, res) => {
    const result = await pool.query(
        `SELECT * FROM school_activities ORDER BY id DESC`
    );

    res.json(result.rows);
});

export default router;

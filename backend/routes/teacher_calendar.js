import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

/* -------------------------------------------------------
   ดึงรายการกิจกรรมทั้งหมด
------------------------------------------------------- */
router.get("/list", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM teacher_calendar ORDER BY event_date ASC`
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

/* -------------------------------------------------------
   เพิ่มกิจกรรมใหม่
------------------------------------------------------- */
router.post("/add", async (req, res) => {
    const { title, description, event_date } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO teacher_calendar (title, description, event_date)
             VALUES ($1, $2, $3) RETURNING *`,
            [title, description, event_date]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

/* -------------------------------------------------------
   ลบกิจกรรมตาม id
------------------------------------------------------- */
router.delete("/delete", async (req, res) => {
    const { id } = req.query;

    try {
        await pool.query(
            `DELETE FROM teacher_calendar WHERE id=$1`,
            [id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

export default router;

import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.get("/profile", async (req, res) => {
    try {
        const { student_id } = req.query;
        if (!student_id) return res.status(400).json({ error: "?????????????????????" });

        const result = await pool.query(
            `SELECT id, student_code, first_name, last_name, class_level, classroom, room, birthday, phone, address
             FROM students WHERE id=$1`,
            [student_id]
        );

        if (!result.rows.length) return res.status(404).json({ error: "?????????????" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error("ERROR /student/profile:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/profile/update", async (req, res) => {
    try {
        const { student_id, first_name, last_name, birthday, phone, address } = req.body;
        if (!student_id) return res.status(400).json({ error: "?????????????????????" });

        await pool.query(
            `UPDATE students
             SET first_name=$1, last_name=$2, birthday=$3, phone=$4, address=$5
             WHERE id=$6`,
            [first_name || null, last_name || null, birthday || null, phone || null, address || null, student_id]
        );

        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /student/profile/update:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;

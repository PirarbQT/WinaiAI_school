import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// ========================================================
// 1) GET HEALTH DATA  (Auto Create if not exists)
// ========================================================
router.get("/", async (req, res) => {
    const { student_id } = req.query;

    try {
        // 1) ตรวจว่ามีข้อมูลสุขภาพหรือยัง
        let result = await pool.query(
            `SELECT * FROM health_records WHERE student_id = $1`,
            [student_id]
        );

        // 2) ถ้ายังไม่มี → สร้างใหม่เลย
        if (result.rows.length === 0) {
            await pool.query(
                `INSERT INTO health_records (student_id) VALUES ($1)`,
                [student_id]
            );

            // ดึงข้อมูลใหม่หลังสร้าง
            result = await pool.query(
                `SELECT * FROM health_records WHERE student_id = $1`,
                [student_id]
            );
        }

        // 3) ส่งข้อมูลกลับหน้าเว็บ
        res.json(result.rows[0]);

    } catch (err) {
        console.error("🔥 GET HEALTH ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// ========================================================
// 2) UPDATE HEALTH DATA
// ========================================================
router.post("/update", async (req, res) => {

    const {
        student_id,
        weight,
        height,
        blood_pressure,
        blood_type,
        allergies,
        chronic_illness
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE health_records
             SET weight=$1,
                 height=$2,
                 blood_pressure=$3,
                 blood_type=$4,
                 allergies=$5,
                 chronic_illness=$6,
                 updated_at=NOW()
             WHERE student_id=$7
             RETURNING *`,
            [
                weight,
                height,
                blood_pressure,
                blood_type,
                allergies,
                chronic_illness,
                student_id
            ]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.log("🔥 UPDATE HEALTH ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;

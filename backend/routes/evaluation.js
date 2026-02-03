import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// ดึงสมรรถนะ
router.get("/competency", async (req, res) => {
    const { student_id, year, semester } = req.query;

    const result = await pool.query(
        `SELECT * FROM competency_results
         WHERE student_id=$1 AND year=$2 AND semester=$3`,
        [student_id, year, semester]
    );

    res.json(result.rows);
});

// บันทึกผลประเมิน
router.post("/submit", async (req, res) => {
    const { student_id, data, year, semester } = req.body;

    // ลบของเก่า
    await pool.query(
        `DELETE FROM competency_results WHERE student_id=$1 AND year=$2 AND semester=$3`,
        [student_id, year, semester]
    );

    // เพิ่มใหม่
    for (const item of data) {
        await pool.query(
            `INSERT INTO competency_results(student_id, name, score, year, semester)
             VALUES($1,$2,$3,$4,$5)`,
            [student_id, item.name, item.score, year, semester]
        );
    }

    res.json({ message: "บันทึกสำเร็จ" });
});

export default router;

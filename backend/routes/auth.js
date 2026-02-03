import express from "express";
import pool from "../db/pool.js";
import bcrypt from "bcrypt";

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
    const { student_code, password } = req.body;

    if (!student_code || !password)
        return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });

    const result = await pool.query(
        "SELECT * FROM students WHERE student_code = $1",
        [student_code]
    );

    if (result.rows.length === 0)
        return res.status(401).json({ error: "ไม่พบนักเรียน" });

    const student = result.rows[0];
    const match = await bcrypt.compare(password, student.password_hash);

    if (!match)
        return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });

    res.json({
        message: "เข้าสู่ระบบสำเร็จ",
        student: {
            id: student.id,
            student_code: student.student_code,
            first_name: student.first_name,
            last_name: student.last_name,
            class_level: student.class_level,
            room: student.classroom,
            photo_url: student.photo_url
        }
    });
});

// REGISTER NEW ACCOUNT (เลือกใช้หรือไม่ก็ได้)
router.post("/register", async (req, res) => {
    const { student_code, first_name, last_name, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO students(student_code, first_name, last_name, password_hash)
         VALUES($1,$2,$3,$4) RETURNING *`,
        [student_code, first_name, last_name, hash]
    );

    res.json(result.rows[0]);
});

export default router;

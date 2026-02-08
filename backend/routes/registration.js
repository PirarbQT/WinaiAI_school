import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

// ค้นหารายวิชา
router.get("/search", async (req, res) => {
    const { keyword } = req.query;

    const result = await pool.query(
        `SELECT * FROM subjects 
         WHERE subject_code ILIKE $1 OR name ILIKE $1`,
        [`%${keyword}%`]
    );

    res.json(result.rows);
});

// แสดงรายวิชาที่เปิดสอนในปี/เทอมนี้
router.get("/sections", async (req, res) => {
    const { year, semester } = req.query;

    const result = await pool.query(
        `SELECT ss.*,
                s.subject_code,
                s.name AS subject_name,
                s.credit,
                (t.first_name || ' ' || t.last_name) AS teacher_name
         FROM subject_sections ss
         JOIN subjects s ON ss.subject_id = s.id
         LEFT JOIN teachers t ON ss.teacher_id = t.id
         WHERE ss.year = $1 AND ss.semester = $2`,
        [year, semester]
    );

    res.json(result.rows);
});

// เพิ่มวิชาเข้าตะกร้า
router.post("/add", async (req, res) => {
    const { student_id, section_id, year, semester } = req.body;

    const result = await pool.query(
        `INSERT INTO registrations(student_id, section_id, year, semester, status)
         VALUES($1,$2,$3,$4,'cart') RETURNING *`,
        [student_id, section_id, year, semester]
    );

    res.json(result.rows[0]);
});

// แสดงตะกร้าลงทะเบียน
router.get("/cart", async (req, res) => {
    const { student_id, year, semester } = req.query;

    const result = await pool.query(
        `SELECT r.*, s.subject_code, s.name AS subject_name, s.credit,
                ss.time_range, ss.day_of_week,
                (t.first_name || ' ' || t.last_name) AS teacher_name
         FROM registrations r
         JOIN subject_sections ss ON r.section_id = ss.id
         JOIN subjects s ON ss.subject_id = s.id
         LEFT JOIN teachers t ON ss.teacher_id = t.id
         WHERE r.student_id = $1 AND r.year = $2 AND r.semester = $3
           AND r.status = 'cart'`,
        [student_id, year, semester]
    );

    res.json(result.rows);
});

// แสดงรายวิชาที่บันทึกแล้ว
router.get("/registered", async (req, res) => {
    const { student_id, year, semester } = req.query;

    const result = await pool.query(
        `SELECT r.*, s.subject_code, s.name AS subject_name, s.credit,
                ss.subject_id,
                ss.time_range, ss.day_of_week,
                (t.first_name || ' ' || t.last_name) AS teacher_name
         FROM registrations r
         JOIN subject_sections ss ON r.section_id = ss.id
         JOIN subjects s ON ss.subject_id = s.id
         LEFT JOIN teachers t ON ss.teacher_id = t.id
         WHERE r.student_id = $1 AND r.year = $2 AND r.semester = $3
           AND r.status = 'registered'`,
        [student_id, year, semester]
    );

    res.json(result.rows);
});

// ยืนยันบันทึกรายวิชาในตะกร้า
router.post("/confirm", async (req, res) => {
    const { student_id, year, semester } = req.body;

    const result = await pool.query(
        `UPDATE registrations
         SET status = 'registered'
         WHERE student_id = $1 AND year = $2 AND semester = $3
           AND status = 'cart'
         RETURNING *`,
        [student_id, year, semester]
    );

    res.json({ success: true, updated: result.rowCount });
});

// ลบจากตะกร้า
router.delete("/remove/:id", async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
        `DELETE FROM registrations WHERE id = $1 RETURNING *`,
        [id]
    );

    res.json(result.rows[0]);
});

export default router;

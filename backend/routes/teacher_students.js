import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

router.get("/list", async (req, res) => {
    try {
        const { teacher_id, class_level, room } = req.query;

        if (class_level || room) {
            const params = [];
            const where = [];

            if (class_level) {
                params.push(class_level);
                where.push(`class_level = $${params.length}`);
            }

            if (room) {
                params.push(room);
                where.push(`(classroom = $${params.length} OR room = $${params.length})`);
            }

            const students = await pool.query(
                `SELECT id, student_code, first_name, last_name, photo_url
                 FROM students
                 WHERE ${where.join(" AND ")}
                 ORDER BY student_code ASC`,
                params
            );

            return res.json({
                level: class_level || "???????",
                room: room || "???????",
                students: students.rows
            });
        }

        const sections = await pool.query(
            `SELECT class_level, classroom
             FROM subject_sections
             WHERE teacher_id = $1
             ORDER BY year DESC, semester DESC, id ASC`,
            [teacher_id]
        );

        if (sections.rows.length === 0) {
            return res.json([]);
        }

        const { class_level: section_level, classroom } = sections.rows[0];

        const students = await pool.query(
            `SELECT id, student_code, first_name, last_name, photo_url
             FROM students
             WHERE class_level = $1 AND (classroom = $2 OR room = $2)
             ORDER BY student_code ASC`,
            [section_level, classroom]
        );

        res.json({
            level: section_level,
            room: classroom,
            students: students.rows
        });
    } catch (err) {
        console.error("ERROR /teacher/students/list:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;

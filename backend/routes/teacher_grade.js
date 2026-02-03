import express from "express";
import pool from "../db/pool.js";

const router = express.Router();

/* ---------------------------------------------------
   1) ดึงหัวข้อคะแนนทั้งหมดของ section
--------------------------------------------------- */
router.get("/headers", async (req, res) => {
    try {
        const { section_id } = req.query;

        const result = await pool.query(
            `SELECT id, title, max_score 
             FROM score_items 
             WHERE section_id = $1
             ORDER BY id ASC`,
            [section_id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("ERROR /headers:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ---------------------------------------------------
   2) ดึงคะแนนรายนักเรียนทุกหัวข้อ
--------------------------------------------------- */
router.get("/scores", async (req, res) => {
    try {
        const { section_id } = req.query;

        const students = await pool.query(
            `SELECT st.id AS student_id, st.student_code,
                    st.first_name, st.last_name
             FROM registrations r
             JOIN students st ON r.student_id = st.id
             WHERE r.section_id = $1
             ORDER BY st.student_code ASC`,
            [section_id]
        );

        const headers = await pool.query(
            `SELECT id, title, max_score 
             FROM score_items 
             WHERE section_id = $1
             ORDER BY id ASC`,
            [section_id]
        );

        const scoreRows = await pool.query(
            `SELECT sc.item_id, sc.student_id, sc.score
             FROM scores sc
             JOIN score_items si ON sc.item_id = si.id
             WHERE si.section_id = $1`,
            [section_id]
        );

        const scores = scoreRows.rows;

        const resp = students.rows.map((stu) => {
            let total = 0;
            let detail = [];

            headers.rows.forEach((h) => {
                const sc = scores.find(
                    (x) => x.item_id === h.id && x.student_id === stu.student_id
                );

                const point = sc ? sc.score : 0;
                total += point;

                detail.push({
                    header_id: h.id,
                    title: h.title,
                    max_score: h.max_score,
                    score: point,
                });
            });

            return {
                student_id: stu.student_id,
                student_code: stu.student_code,
                name: stu.first_name + " " + stu.last_name,
                total_score: total,
                details: detail,
            };
        });

        res.json(resp);
    } catch (err) {
        console.error("ERROR /scores:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ---------------------------------------------------
   3) บันทึกเกรด
--------------------------------------------------- */
router.post("/save", async (req, res) => {
    try {
        const { section_id, grades } = req.body;

        // grades = [{ student_id, total_score, grade }]

        for (const g of grades) {
            const updated = await pool.query(
                `UPDATE grades
                 SET total_score = $1, grade = $2
                 WHERE student_id = $3 AND section_id = $4`,
                [g.total_score, g.grade, g.student_id, section_id]
            );

            if (updated.rowCount === 0) {
                await pool.query(
                    `INSERT INTO grades (student_id, section_id, total_score, grade)
                     VALUES ($1, $2, $3, $4)`,
                    [g.student_id, section_id, g.total_score, g.grade]
                );
            }
        }

        res.json({ success: true });
    } catch (err) {
        console.error("ERROR /save:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;

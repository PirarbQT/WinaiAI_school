import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../db/pool.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const role = (req.body.role || "").toLowerCase();
        const id = String(req.body.id || "0");
        const ext = path.extname(file.originalname).toLowerCase();
        const safeRole = role === "teacher" ? "teacher" : role === "director" ? "director" : "student";
        cb(null, `${safeRole}_${id}_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Invalid file type"), ok);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

router.post("/profile", upload.single("photo"), async (req, res) => {
    try {
        const role = (req.body.role || "").toLowerCase();
        const id = Number(req.body.id);

        if (!req.file) return res.status(400).json({ error: "ไม่พบไฟล์รูปภาพ" });
        if (!id || (role !== "student" && role !== "teacher" && role !== "director")) {
            return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
        }

        const url = `/uploads/${req.file.filename}`;
        const table = role === "teacher" ? "teachers" : role === "director" ? "directors" : "students";

        await pool.query(`UPDATE ${table} SET photo_url = $1 WHERE id = $2`, [url, id]);

        res.json({ success: true, url });
    } catch (err) {
        console.error("ERROR /upload/profile:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.use((err, req, res, next) => {
    if (err) {
        return res.status(400).json({ error: err.message || "อัปโหลดไม่สำเร็จ" });
    }
    next();
});

export default router;

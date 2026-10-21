
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "success",
      message: "BuildNDeploy backend and MySQL are running!",
    });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({ message: "Database connection failed." });
  }
});

// Get all notes and search by title
app.get("/api/notes", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    const [notes] = await pool.execute(
      `SELECT id, title, content, category, created_at, updated_at
       FROM notes
       WHERE title LIKE ?
       ORDER BY created_at DESC, id DESC`,
      [`%${search}%`]
    );

    res.json(notes);
  } catch (error) {
    console.error("Fetch notes failed:", error.message);
    res.status(500).json({ message: "Could not load notes." });
  }
});

// Create a note
app.post("/api/notes", async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Title and content are required.",
      });
    }

    const safeCategory =
      typeof category === "string" && category.trim()
        ? category.trim()
        : "General";

    const [result] = await pool.execute(
      "INSERT INTO notes (title, content, category) VALUES (?, ?, ?)",
      [title.trim(), content.trim(), safeCategory]
    );

    const [rows] = await pool.execute(
      "SELECT id, title, content, category, created_at, updated_at FROM notes WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Create note failed:", error.message);
    res.status(500).json({ message: "Could not create note." });
  }
});

// Update a note
app.put("/api/notes/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, content, category } = req.body;

    if (
      !/^\d+$/.test(id) ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "A valid ID, title and content are required.",
      });
    }

    const safeCategory =
      typeof category === "string" && category.trim()
        ? category.trim()
        : "General";

    const [result] = await pool.execute(
      "UPDATE notes SET title = ?, content = ?, category = ? WHERE id = ?",
      [title.trim(), content.trim(), safeCategory, id]
    );

    if (result.affectedRows === 0) {
      const [existing] = await pool.execute(
        "SELECT id FROM notes WHERE id = ?",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ message: "Note not found." });
      }
    }

    const [rows] = await pool.execute(
      "SELECT id, title, content, category, created_at, updated_at FROM notes WHERE id = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Update note failed:", error.message);
    res.status(500).json({ message: "Could not update note." });
  }
});

// Delete a note
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ message: "Invalid note ID." });
    }

    const [result] = await pool.execute(
      "DELETE FROM notes WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Note not found." });
    }

    res.json({ message: "Note deleted successfully." });
  } catch (error) {
    console.error("Delete note failed:", error.message);
    res.status(500).json({ message: "Could not delete note." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`BuildNDeploy backend running on port ${PORT}`);
});

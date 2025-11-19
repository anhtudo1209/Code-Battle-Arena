import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import CodeJudge from "../judge.js";
import { query } from "../database/db-postgres.js";
import { judgeQueue } from "../queue.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const judge = new CodeJudge();

function detectLanguage(code) {
  const hasCpp =
    code.includes("#include <iostream>") ||
    code.includes("std::") ||
    code.includes("using namespace std") ||
    code.includes("cout") ||
    code.includes("cin") ||
    code.includes("class ") ||
    code.includes("new ") ||
    code.includes("delete ");

  return hasCpp ? "cpp" : "c";
}

// Practice submission endpoint with C++ and c judging
router.post("/submit", async (req, res) => {
  const { code, exerciseId = 'exercise1' } = req.body;
  const userId = req.userId;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Code is required and must be a string" });
  }

  // Detect language BEFORE storing in DB
  const lang = detectLanguage(code);

  try {
    const result = await query(
      `INSERT INTO submissions
       (user_id, exercise_id, code, language, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [userId, exerciseId, code, lang, 'queued']
    );

    const submissionId = result.rows[0].id;

    // Pass correct language to the queue
    const job = await judgeQueue.add("judge", {
      submissionId,
      userId,
      exerciseId,
      code,
      language: lang
    });

    res.json({
      success: true,
      message: "Your submission has been queued",
      jobId: job.id,
      submissionId
    });

  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error while queueing submission"
    });
  }
});

// Get user's submission history
router.get("/submissions", async (req, res) => {
  const userId = req.userId;

  try {
    const result = await query(
      `SELECT id, exercise_id, language, status, compilation_success, 
              test_results, submitted_at 
       FROM submissions 
       WHERE user_id = $1 
       ORDER BY submitted_at DESC 
       LIMIT 50`,
      [userId]
    );

    res.json({ submissions: result.rows });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Get submission details by ID
router.get("/submissions/:id", async (req, res) => {
  const userId = req.userId;
  const submissionId = req.params.id;

  try {
    const result = await query(
      `SELECT * FROM submissions 
       WHERE id = $1 AND user_id = $2`,
      [submissionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json({ submission: result.rows[0] });
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
});

// Get list of all exercises
router.get("/exercises", async (req, res) => {
  try {
    const exercisesDir = path.join(__dirname, '..', '..', 'exercises');
    const folders = await fs.promises.readdir(exercisesDir, { withFileTypes: true });

    const exercises = [];

    for (const folder of folders) {
      if (folder.isDirectory()) {
        const exerciseId = folder.name;
        const problemPath = path.join(exercisesDir, exerciseId, 'problem.md');
        const configPath = path.join(exercisesDir, exerciseId, 'config.json');

        try {
          const problemContent = await fs.promises.readFile(problemPath, 'utf8');
          const configContent = await fs.promises.readFile(configPath, 'utf8');
          const config = JSON.parse(configContent);

          // Extract title (first line after # heading)
          const titleMatch = problemContent.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1].trim() : exerciseId;

          // Extract description (text after title before ## heading)
          const descMatch = problemContent.match(/^#\s+.+\n\n(.+?)(?=\n##|\n$)/ms);
          const description = descMatch ? descMatch[1].trim() : '';

          exercises.push({
            id: exerciseId,
            title,
            description,
            difficulty: config.difficulty
          });
        } catch (error) {
          console.error(`Error reading problem for ${exerciseId}:`, error);
        }
      }
    }

    // Sort by exercise ID
    exercises.sort((a, b) => a.id.localeCompare(b.id));

    res.json({ exercises });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

// Get single exercise details
router.get("/exercises/:id", async (req, res) => {
  const exerciseId = req.params.id;

  try {
    const exercisesDir = path.join(__dirname, '..', '..', 'exercises');
    const problemPath = path.join(exercisesDir, exerciseId, 'problem.md');

    const problemContent = await fs.promises.readFile(problemPath, 'utf8');

    res.json({
      id: exerciseId,
      content: problemContent
    });
  } catch (error) {
    console.error(`Error fetching exercise ${exerciseId}:`, error);
    res.status(404).json({ error: "Exercise not found" });
  }
});

export default router;
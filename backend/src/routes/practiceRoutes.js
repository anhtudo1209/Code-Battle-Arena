import express from "express";
import fs from "fs";
import path from "path";
import CodeJudge from "../judge.js";
import { query } from "../database/db-postgres.js";

const router = express.Router();
const judge = new CodeJudge();

// Practice submission endpoint with C++ judging
router.post("/submit", async (req, res) => {
  const { code, exerciseId = 'exercise1' } = req.body;
  const userId = req.userId; // From auth middleware

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Code is required and must be a string" });
  }

  try {
    // Judge the submission
    const result = await judge.judgeSubmission(code, exerciseId);

    // Determine status based on result
    let statusText = 'error';
    if (!result.compilationSuccess) {
      statusText = 'compilation error';
    } else if (result.success) {
      statusText = 'accepted';
    } else {
      statusText = 'wrong answer';
    }

    // Save submission to database
    await query(
      `INSERT INTO submissions 
       (user_id, exercise_id, code, language, status, compilation_success, compilation_error, test_results) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        exerciseId,
        code,
        'cpp',
        statusText,
        result.compilationSuccess || false,
        result.compilationError || null,
        JSON.stringify([])
      ]
    );

    // Return minimal response as requested
    res.json({ status: statusText });

  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during judging"
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
    const exercisesDir = path.join(process.cwd(), 'backend', 'exercises');
    const folders = await fs.promises.readdir(exercisesDir, { withFileTypes: true });
    
    const exercises = [];
    
    for (const folder of folders) {
      if (folder.isDirectory()) {
        const exerciseId = folder.name;
        const problemPath = path.join(exercisesDir, exerciseId, 'problem.md');
        
        try {
          const problemContent = await fs.promises.readFile(problemPath, 'utf8');
          
          // Extract title (first line after # heading)
          const titleMatch = problemContent.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1].trim() : exerciseId;
          
          // Extract description (text after title before ## heading)
          const descMatch = problemContent.match(/^#\s+.+\n\n(.+?)(?=\n##|\n$)/ms);
          const description = descMatch ? descMatch[1].trim() : '';
          
          exercises.push({
            id: exerciseId,
            title,
            description
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
    const exercisesDir = path.join(process.cwd(), 'backend', 'exercises');
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

import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../database/db-postgres.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ========== USER MANAGEMENT ==========

// Get all users
router.get("/users", async (req, res) => {
  try {
    const result = await query(
      `SELECT id, username, email, role, rating, win_streak, loss_streak, k_win, k_lose, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user (role, email, etc.)
router.put("/users/:id", async (req, res) => {
  const { role, email, username, rating, win_streak, loss_streak, k_win, k_lose } = req.body;
  const userId = req.params.id;

  try {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (username !== undefined) {
      updates.push(`username = $${paramCount++}`);
      values.push(username);
    }
    if (rating !== undefined) {
      updates.push(`rating = $${paramCount++}`);
      values.push(Number(rating));
    }
    if (win_streak !== undefined) {
      updates.push(`win_streak = $${paramCount++}`);
      values.push(Number(win_streak));
    }
    if (loss_streak !== undefined) {
      updates.push(`loss_streak = $${paramCount++}`);
      values.push(Number(loss_streak));
    }
    if (k_win !== undefined) {
      updates.push(`k_win = $${paramCount++}`);
      values.push(Number(k_win));
    }
    if (k_lose !== undefined) {
      updates.push(`k_lose = $${paramCount++}`);
      values.push(Number(k_lose));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await query(
      `UPDATE users 
       SET ${updates.join(", ")} 
       WHERE id = $${paramCount} 
       RETURNING id, username, email, role, rating, win_streak, loss_streak, k_win, k_lose, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ========== EXERCISE MANAGEMENT ==========

// Get all exercises
router.get("/exercises", async (req, res) => {
  try {
    const exercisesDir = path.join(__dirname, '..', '..', 'exercises');
    const folders = await fs.promises.readdir(exercisesDir, { withFileTypes: true });

    const exercises = [];

    for (const folder of folders) {
      if (folder.isDirectory()) {
        const exerciseId = folder.name;
        const configPath = path.join(exercisesDir, exerciseId, 'config.json');

        try {
          if (fs.existsSync(configPath)) {
            const configContent = await fs.promises.readFile(configPath, 'utf8');
            const config = JSON.parse(configContent);

            const problemPath = path.join(exercisesDir, exerciseId, 'problem.md');
            let problemContent = "";
            if (fs.existsSync(problemPath)) {
              problemContent = await fs.promises.readFile(problemPath, 'utf8');
            }

            // Get test cases
            const files = await fs.promises.readdir(path.join(exercisesDir, exerciseId));
            const testCases = files
              .filter(f => f.endsWith('.input.txt'))
              .map(f => f.replace('.input.txt', ''))
              .sort();

            exercises.push({
              id: exerciseId,
              config,
              problemContent,
              testCases
            });
          }
        } catch (error) {
          console.error(`Error reading exercise ${exerciseId}:`, error);
        }
      }
    }

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
    const exerciseDir = path.join(__dirname, '..', '..', 'exercises', exerciseId);
    const configPath = path.join(exerciseDir, 'config.json');
    const problemPath = path.join(exerciseDir, 'problem.md');

    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    const config = JSON.parse(await fs.promises.readFile(configPath, 'utf8'));
    let problemContent = "";
    if (fs.existsSync(problemPath)) {
      problemContent = await fs.promises.readFile(problemPath, 'utf8');
    }

    // Get starter code if exists
    let starterCode = "";
    if (config.starterCode) {
      const starterPath = path.join(exerciseDir, config.starterCode);
      if (fs.existsSync(starterPath)) {
        starterCode = await fs.promises.readFile(starterPath, 'utf8');
      }
    }

    // Get test cases
    const files = await fs.promises.readdir(exerciseDir);
    const testCases = [];
    const inputFiles = files.filter(f => f.endsWith('.input.txt')).sort();
    
    for (const inputFile of inputFiles) {
      const testCaseNum = inputFile.replace('.input.txt', '');
      const outputFile = `${testCaseNum}.output.txt`;
      const inputPath = path.join(exerciseDir, inputFile);
      const outputPath = path.join(exerciseDir, outputFile);

      if (fs.existsSync(outputPath)) {
        testCases.push({
          id: testCaseNum,
          input: await fs.promises.readFile(inputPath, 'utf8'),
          output: await fs.promises.readFile(outputPath, 'utf8')
        });
      }
    }

    res.json({
      id: exerciseId,
      config,
      problemContent,
      starterCode,
      testCases
    });
  } catch (error) {
    console.error(`Error fetching exercise ${exerciseId}:`, error);
    res.status(500).json({ error: "Failed to fetch exercise" });
  }
});

// Update exercise
router.put("/exercises/:id", async (req, res) => {
  const exerciseId = req.params.id;
  const { config, problemContent, starterCode, testCases } = req.body;

  try {
    const exerciseDir = path.join(__dirname, '..', '..', 'exercises', exerciseId);
    
    // Ensure directory exists
    await fs.promises.mkdir(exerciseDir, { recursive: true });

    // Update config.json
    if (config) {
      const configPath = path.join(exerciseDir, 'config.json');
      await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
    }

    // Update problem.md
    if (problemContent !== undefined) {
      const problemPath = path.join(exerciseDir, 'problem.md');
      await fs.promises.writeFile(problemPath, problemContent, 'utf8');
    }

    // Update starter code
    if (starterCode !== undefined && config?.starterCode) {
      const starterPath = path.join(exerciseDir, config.starterCode);
      await fs.promises.writeFile(starterPath, starterCode, 'utf8');
    }

    // Update test cases
    if (testCases && Array.isArray(testCases)) {
      for (const testCase of testCases) {
        const inputPath = path.join(exerciseDir, `${testCase.id}.input.txt`);
        const outputPath = path.join(exerciseDir, `${testCase.id}.output.txt`);
        
        if (testCase.input !== undefined) {
          await fs.promises.writeFile(inputPath, testCase.input, 'utf8');
        }
        if (testCase.output !== undefined) {
          await fs.promises.writeFile(outputPath, testCase.output, 'utf8');
        }
      }
    }

    res.json({ message: "Exercise updated successfully" });
  } catch (error) {
    console.error(`Error updating exercise ${exerciseId}:`, error);
    res.status(500).json({ error: "Failed to update exercise" });
  }
});

// Create new exercise
router.post("/exercises", async (req, res) => {
  const { id, config, problemContent, starterCode, testCases } = req.body;

  if (!id || !config || !problemContent) {
    return res.status(400).json({ error: "Missing required fields: id, config, problemContent" });
  }

  try {
    const exerciseDir = path.join(__dirname, '..', '..', 'exercises', id);
    
    // Check if exercise already exists
    if (fs.existsSync(exerciseDir)) {
      return res.status(400).json({ error: "Exercise already exists" });
    }

    // Create directory
    await fs.promises.mkdir(exerciseDir, { recursive: true });

    // Create config.json
    const configPath = path.join(exerciseDir, 'config.json');
    await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');

    // Create problem.md
    const problemPath = path.join(exerciseDir, 'problem.md');
    await fs.promises.writeFile(problemPath, problemContent, 'utf8');

    // Create starter code if provided
    if (starterCode && config.starterCode) {
      const starterPath = path.join(exerciseDir, config.starterCode);
      await fs.promises.writeFile(starterPath, starterCode, 'utf8');
    }

    // Create test cases
    if (testCases && Array.isArray(testCases)) {
      for (const testCase of testCases) {
        if (testCase.id && testCase.input !== undefined && testCase.output !== undefined) {
          const inputPath = path.join(exerciseDir, `${testCase.id}.input.txt`);
          const outputPath = path.join(exerciseDir, `${testCase.id}.output.txt`);
          await fs.promises.writeFile(inputPath, testCase.input, 'utf8');
          await fs.promises.writeFile(outputPath, testCase.output, 'utf8');
        }
      }
    }

    res.json({ message: "Exercise created successfully", id });
  } catch (error) {
    console.error(`Error creating exercise:`, error);
    res.status(500).json({ error: "Failed to create exercise" });
  }
});

// Delete exercise
router.delete("/exercises/:id", async (req, res) => {
  const exerciseId = req.params.id;

  try {
    const exerciseDir = path.join(__dirname, '..', '..', 'exercises', exerciseId);
    
    if (!fs.existsSync(exerciseDir)) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    await fs.promises.rm(exerciseDir, { recursive: true, force: true });
    res.json({ message: "Exercise deleted successfully" });
  } catch (error) {
    console.error(`Error deleting exercise ${exerciseId}:`, error);
    res.status(500).json({ error: "Failed to delete exercise" });
  }
});

export default router;


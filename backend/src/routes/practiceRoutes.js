import express from "express";
import CodeJudge from "../judge.js";

const router = express.Router();
const judge = new CodeJudge();

// Practice submission endpoint with C++ judging
router.post("/submit", async (req, res) => {
  const { code, exerciseId = 'exercise1' } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Code is required and must be a string" });
  }

  try {
    // Judge the submission
    const result = await judge.judgeSubmission(code, exerciseId);

    res.json({
      success: result.success,
      compilationSuccess: result.compilationSuccess,
      compilationError: result.compilationError,
      testResults: result.testResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during judging"
    });
  }
});

export default router;

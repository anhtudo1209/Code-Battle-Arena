import React, { useState } from "react";
import { post, get } from "../services/httpClient";
import Header from "../components/Header";
import "./Practice.css";

export default function Practice() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [problemContent, setProblemContent] = useState("");
  const [code, setCode] = useState(``);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);

  const [showModal, setShowModal] = useState(true);

  const fetchExercises = async (difficulty) => {
    setLoadingExercises(true);
    try {
      const data = await get("/practice/exercises");
      const allExercises = data.exercises || [];
      const filtered = allExercises.filter(
        (ex) => ex.difficulty === difficulty
      );

      if (filtered.length > 0) {
        const randomIndex = Math.floor(Math.random() * filtered.length);
        const randomExercise = filtered[randomIndex];
        loadExercise(randomExercise.id);
      } else {
        setProblemContent("No exercises found for this difficulty.");
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleDifficultySelect = (difficulty) => {
    setShowModal(false);
    fetchExercises(difficulty);
  };

  const loadExercise = async (exerciseId) => {
    try {
      const data = await get(`/practice/exercises/${exerciseId}`);
      setSelectedExercise(exerciseId);
      setProblemContent(data.content);
      setResults(null);
    } catch (error) {
      console.error("Error loading exercise:", error);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("Please enter some code before submitting.");
      return;
    }

    if (!selectedExercise) {
      alert("Please select an exercise first.");
      return;
    }

    setLoading(true);
    try {
      const data = await post("/practice/submit", {
        code,
        exerciseId: selectedExercise,
      });
      setResults(data);
    } catch (error) {
      console.error("Submission error:", error);
      setResults({ error: error.message || "Failed to submit code" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="practice-page">
      {showModal && (
        <div className="modal-overlay">
          <div className="difficulty-modal">
            <h2>Select Difficulty</h2>
            <div className="difficulty-buttons">
              <button onClick={() => handleDifficultySelect("easy")}>
                Easy
              </button>
              <button onClick={() => handleDifficultySelect("medium")}>
                Medium
              </button>
              <button onClick={() => handleDifficultySelect("difficult")}>
                Difficult
              </button>
            </div>
          </div>
        </div>
      )}

      {!showModal && (
        <>
          <Header />

          <div className="practice-layout">
            <aside className="problem-sidebar">
              <h3>Problem</h3>
              {loadingExercises ? (
                <p>Loading problem...</p>
              ) : (
                <div className="problem-content">
                  <pre>{problemContent}</pre>
                </div>
              )}
            </aside>

            <main className="practice-main">
              <section className="code-section">
                <h3>Your Code:</h3>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Write your C++ code here..."
                  rows={20}
                />
                <button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Submitting..." : "Submit Code"}
                </button>
              </section>

              <section className="output-section">
                <h3>Output:</h3>
                {results ? (
                  <>
                    {results.success && (
                      <div className="success">🎉 Accepted</div>
                    )}
                    {!results.compilationSuccess && (
                      <div className="error">⚠️ Compilation Error: {results.compilationError}</div>
                    )}
                    {results.compilationSuccess && !results.success && (
                      <div className="error">❌ Wrong Answer</div>
                    )}
                    {results.error && (
                      <div className="error">{results.error}</div>
                    )}
                    {results.testResults && results.testResults.length > 0 && (
                      <div className="test-results">
                        {results.testResults.map((test, index) => (
                          <div key={index} className={`test-case ${test.passed ? 'passed' : 'failed'}`}>
                            <p><strong>Test Case {index + 1}:</strong></p>
                            <p>Input: {test.input}</p>
                            <p>Expected: {test.expected}</p>
                            <p>Got: {test.actual}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p>No output yet.</p>
                )}
              </section>
            </main>
          </div>
        </>
      )}
    </div>
  );
}

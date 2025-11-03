import React, { useState, useEffect } from "react";
import { post, get } from "../services/httpClient";
import "./Practice.css";

export default function Practice() {
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [problemContent, setProblemContent] = useState('');
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);

  // Fetch exercises on component mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await get("/practice/exercises");
        setExercises(data.exercises || []);
        
        // Auto-select first exercise
        if (data.exercises && data.exercises.length > 0) {
          loadExercise(data.exercises[0].id);
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoadingExercises(false);
      }
    };
    
    fetchExercises();
  }, []);

  // Load exercise details
  const loadExercise = async (exerciseId) => {
    try {
      const data = await get(`/practice/exercises/${exerciseId}`);
      setSelectedExercise(exerciseId);
      setProblemContent(data.content);
      setResults(null); // Clear previous results
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
        exerciseId: selectedExercise 
      });
      setResults(data); // { status: 'accepted' | 'wrong answer' | 'compilation error' }
    } catch (error) {
      console.error("Submission error:", error);
      setResults({ error: error.message || "Failed to submit code" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="practice-page">
      {/* Background */}
      <div className="bg-image"></div>
      <div className="bg-overlay"></div>

      {/* Header */}
      <header className="header">
        <h1 className="logo">CODE BATTLE ARENA</h1>
        <div className="header-right">
          <input type="text" placeholder="Search..." className="search-bar" />
          <div className="icon-btn">⚙️</div>
          <div className="icon-btn">☰</div>
        </div>
      </header>

      {/* Content */}
      <div className="content">
        <div className="practice-container">
          {/* Exercise List Sidebar */}
          <div className="exercises-sidebar">
            <h3>Problems</h3>
            {loadingExercises ? (
              <p>Loading exercises...</p>
            ) : (
              <ul className="exercise-list">
                {exercises.map((exercise) => (
                  <li 
                    key={exercise.id}
                    className={selectedExercise === exercise.id ? 'active' : ''}
                    onClick={() => loadExercise(exercise.id)}
                  >
                    <div className="exercise-title">{exercise.title}</div>
                    <div className="exercise-description">{exercise.description}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Main Content */}
          <div className="practice-main">
            {selectedExercise ? (
              <>
                <div className="problem-description">
                  <pre>{problemContent}</pre>
                </div>

                <div className="code-section">
                  <h3>Your Code:</h3>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Write your C++ code here..."
                    rows={15}
                    cols={80}
                  />
                  <button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Submitting..." : "Submit Code"}
                  </button>
                </div>

                {results && (
                  <div className="results-section">
                    <h3>Results:</h3>
                    {results.status === 'accepted' && (
                      <div className="success">
                        <p>🎉 accepted</p>
                      </div>
                    )}
                    {results.status === 'wrong answer' && (
                      <div className="error">
                        <p>❌ wrong answer</p>
                      </div>
                    )}
                    {results.status === 'compilation error' && (
                      <div className="error">
                        <p>❌ compilation error</p>
                      </div>
                    )}
                    {!['accepted','wrong answer','compilation error'].includes(results.status) && (
                      <div>
                        <p>{results.status || 'Unknown result'}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p>Select a problem to start coding</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

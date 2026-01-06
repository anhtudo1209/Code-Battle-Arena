import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { post, get } from "../services/httpClient";
import Header from "../components/Header";
import PageTitle from "../components/PageTitle";
import "./Practice.css";

export default function Practice() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(null);
  const [problemContent, setProblemContent] = useState("");
  const [code, setCode] = useState(``);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [lockedLines, setLockedLines] = useState([]);
  const [guardMessage, setGuardMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  const lastValidCodeRef = useRef("");

  const location = useLocation();
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    if (location.state?.difficulty) {
      handleDifficultySelect(location.state.difficulty);
    }
  }, [location.state]);

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
    setCurrentDifficulty(difficulty);
    fetchExercises(difficulty);
  };

  const loadExercise = async (exerciseId, language = null) => {
    try {
      // If it's a new exercise (different ID), reset to cpp; otherwise use provided language or current
      const isNewExercise = selectedExercise !== exerciseId;
      const langToUse = language || (isNewExercise ? "cpp" : selectedLanguage);
      
      const data = await get(`/practice/exercises/${exerciseId}?lang=${langToUse}`);
      setSelectedExercise(exerciseId);
      setProblemContent(data.content);
      if (
        Number.isInteger(data.editable_start) &&
        Number.isInteger(data.editable_end)
      ) {
        setLockedLines([data.editable_start, data.editable_end]);
      } else {
        setLockedLines([]);
      }
      const template = data.starterCode || "";
      setCode(template);
      lastValidCodeRef.current = template;
      setGuardMessage("");
      setResults(null);
      setSelectedLanguage(langToUse);
    } catch (error) {
      console.error("Error loading exercise:", error);
      setLockedLines([]);
      setGuardMessage("");
    }
  };

  const handleLanguageToggle = () => {
    if (!selectedExercise) return;
    const newLanguage = selectedLanguage === "cpp" ? "c" : "cpp";
    loadExercise(selectedExercise, newLanguage);
  };

  const isWithinEditableRegion = (changes = []) => {
    if (
      lockedLines.length !== 2 ||
      !Number.isInteger(lockedLines[0]) ||
      !Number.isInteger(lockedLines[1])
    ) {
      return true;
    }

    const [editableStart, editableEnd] = lockedLines;

    return changes.every((change) => {
      const { startLineNumber, endLineNumber } = change.range;
      return (
        startLineNumber >= editableStart && endLineNumber <= editableEnd
      );
    });
  };

  const handleEditorChange = (value, event) => {
    const updatedValue = value ?? "";

    if (event?.changes?.length && !isWithinEditableRegion(event.changes)) {
      setGuardMessage(
        `You can only edit between lines ${lockedLines[0]} - ${lockedLines[1]}.`
      );
      setCode(lastValidCodeRef.current);
      return;
    }

    setGuardMessage("");
    lastValidCodeRef.current = updatedValue;
    setCode(updatedValue);
  };

  const handleEditorMount = (editorInstance, monacoInstance) => {
    editorRef.current = editorInstance;
    monacoRef.current = monacoInstance;
    lastValidCodeRef.current = editorInstance.getValue() ?? "";
  };

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) {
      return;
    }

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor.getModel();

    if (!model) return;

    if (decorationsRef.current.length) {
      decorationsRef.current = editor.deltaDecorations(
        decorationsRef.current,
        []
      );
    }

    if (
      lockedLines.length !== 2 ||
      !Number.isInteger(lockedLines[0]) ||
      !Number.isInteger(lockedLines[1])
    ) {
      return;
    }

    const [editableStart, editableEnd] = lockedLines;
    const totalLines = model.getLineCount();
    const decorations = [];

    if (editableStart > 1) {
      decorations.push({
        range: new monaco.Range(1, 1, editableStart - 1, 1),
        options: { inlineClassName: "locked-code" },
      });
    }

    if (editableEnd < totalLines) {
      decorations.push({
        range: new monaco.Range(editableEnd + 1, 1, totalLines, 1),
        options: { inlineClassName: "locked-code" },
      });
    }

    decorationsRef.current = editor.deltaDecorations([], decorations);
  }, [lockedLines, code]);

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
    setResults(null);
    try {
      const data = await post("/practice/submit", {
        code,
        exerciseId: selectedExercise,
      });
      setSubmissionId(data.submissionId);
      // Start polling for results
      pollSubmissionStatus(data.submissionId);
    } catch (error) {
      console.error("Submission error:", error);
      setResults({ error: error.message || "Failed to submit code" });
      setLoading(false);
    }
  };

  const pollSubmissionStatus = async (id) => {
    try {
      const data = await get(`/practice/submissions/${id}`);
      const submission = data.submission;

      // Only show results when status is a final state (not queued or running)
      const isProcessing = submission.status === 'queued' || submission.status === 'running';

      if (isProcessing) {
        // Still processing, poll again in 1 second
        setTimeout(() => pollSubmissionStatus(id), 1000);
        return;
      }

      // Done processing - only display results for final states
      const finalStates = ['passed', 'failed', 'compilation_error'];
      if (!finalStates.includes(submission.status)) {
        // Status is not final yet, keep polling (safety check)
        setTimeout(() => pollSubmissionStatus(id), 1000);
        return;
      }

      // We have a final status - display results
      setLoading(false);
      const compilationSuccess = submission.compilation_success === true;

      // Handle test_results - it might be a string (JSON) or already an object (from PostgreSQL JSONB)
      let testResults = [];
      if (submission.test_results) {
        if (typeof submission.test_results === 'string') {
          try {
            testResults = JSON.parse(submission.test_results);
          } catch (e) {
            console.error('Error parsing test_results:', e);
            testResults = [];
          }
        } else {
          // Already an object (from PostgreSQL JSONB)
          testResults = submission.test_results;
        }
      }

      setResults({
        success: submission.status === 'passed',
        compilationSuccess: compilationSuccess,
        compilationError: "", // hide detailed error messages for compilation failures
        testResults: testResults,
      });
    } catch (error) {
      console.error("Polling error:", error);
      setLoading(false);
      setResults({ error: "Failed to get submission status" });
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
              <button onClick={() => handleDifficultySelect("hard")}>
                Hard
              </button>
            </div>
          </div>
        </div>
      )}

      {!showModal && (
        <>
          <PageTitle title="Practice" />
          <Header />

          <div className="practice-layout">
            <aside className="problem-sidebar">
              <h3>Problem</h3>
              {loadingExercises ? (
                <p>Loading problem...</p>
              ) : (
                <div className="problem-content">
                  {problemContent}
                </div>
              )}
            </aside>

            <main className="practice-main">
              <section className="code-section">
                <div className="flex justify-between items-center mb-2">
                  <h3>Your Code:</h3>
                  <button
                    onClick={() => fetchExercises(currentDifficulty)}
                    className="text-xs text-slate-400 hover:text-white underline decoration-slate-600"
                  >
                    Skip / Next Problem
                  </button>
                </div>
                <Editor
                  height="60vh"
                  language={selectedLanguage}
                  theme="vs-dark"
                  value={code}
                  onMount={handleEditorMount}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    automaticLayout: true,
                    fontSize: 14,
                    wordWrap: "on",
                  }}
                />
                {guardMessage && (
                  <p className="guard-message">{guardMessage}</p>
                )}
                <button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Running tests..." : "Submit Code"}
                </button>
              </section>

              <section className="output-section">
                <h3>Output:</h3>
                {results ? (
                  <>
                    {results.error ? (
                      <div className="error">{results.error}</div>
                    ) : !results.compilationSuccess ? (
                      <div className="error">Compilation Error</div>
                    ) : results.success ? (
                      <div className="success">Accepted</div>
                    ) : (
                      <div className="error">Wrong Answer</div>
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

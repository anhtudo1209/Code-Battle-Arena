import React, { useState } from "react";
import "./Practice.css";

export default function Practice() {
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("Please enter some code before submitting.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Submission error:", error);
      setResults({ error: "Failed to submit code" });
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
          <h2>Practice Problem: Hello World</h2>
          <div className="problem-description">
            <p><strong>Description:</strong> Write a C++ program that prints "Hello, World!" to the console.</p>
            <p><strong>Input:</strong> None</p>
            <p><strong>Output:</strong> Hello, World!</p>
            <p><strong>Sample Input:</strong> (none)</p>
            <p><strong>Sample Output:</strong> Hello, World!</p>
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
              {results.success ? (
                <div className="success">
                  <p>✅ Code compiled and ran successfully!</p>
                  <div className="test-results">
                    {results.testResults?.map((test, index) => (
                      <div key={index} className={`test-case ${test.passed ? 'passed' : 'failed'}`}>
                        <p><strong>Test Case {test.testCase}:</strong> {test.passed ? '✅ PASSED' : '❌ FAILED'}</p>
                        {test.expected && <p><strong>Expected:</strong> {test.expected}</p>}
                        {test.actual && <p><strong>Actual:</strong> {test.actual}</p>}
                        {test.executionTime && <p><strong>Execution Time:</strong> {test.executionTime}s</p>}
                        {test.memoryUsed && <p><strong>Memory Used:</strong> {test.memoryUsed} KB</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="error">
                  <p>❌ {results.compilationError || results.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

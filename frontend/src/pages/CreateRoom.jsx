import React, { useState } from "react";
import Header from "../components/Header";
import "./CreateRoom.css";

export default function CreateRoom() {
  const [practiceActive, setPracticeActive] = useState(false);
  const [customActive, setCustomActive] = useState(false);

  const handlePracticeClick = () => {
    setCustomActive(false);
    setPracticeActive(!practiceActive);
  };

  const handleCustomClick = () => {
    setPracticeActive(false);
    setCustomActive(!customActive);
  };

  return (
    <div className="create-room-page">
      <Header />

      <main className="main-area">
        <section className="center-stage">
          <div className="panel">
            <div className="tree-area">
              <div className="node node-create">Create room</div>

              <div className="node-row">
                <div className="node node-practice" onClick={handlePracticeClick}>
                  Practice
                </div>
                <div className="node node-custom" onClick={handleCustomClick}>
                  Custom
                </div>
              </div>
            </div>

            {/* Practice floating */}
            <div id="practice-box" className={`floating-box ${practiceActive ? 'active' : ''}`}>
              <input
                className="search-input"
                placeholder="Search room..."
              />

              <div className="table-wrap">
                <table className="rooms-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Diff</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>101</td>
                      <td>Basic Strings</td>
                      <td>Easy</td>
                      <td>Practice</td>
                    </tr>
                    <tr>
                      <td>102</td>
                      <td>Arrays</td>
                      <td>Medium</td>
                      <td>Practice</td>
                    </tr>
                    <tr>
                      <td>103</td>
                      <td>Graph</td>
                      <td>Hard</td>
                      <td>Practice</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Custom floating */}
            <div id="custom-box" className={`floating-box ${customActive ? 'active' : ''}`}>
              <label>Difficulty</label><br />
              <span className="pill">Easy</span>
              <span className="pill">Medium</span>
              <span className="pill">Hard</span>
              <br />

              <label className="room-name-label">Room Name:</label>
              <input className="room-name-input" />

              <div className="create-btn-container">
                <button className="create-btn">CREATE</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

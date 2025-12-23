import React, { useState, useEffect, useRef } from "react";
import { get, post, put, del as delRequest } from "../services/httpClient";
import Header from "../components/Header";
import "./Admin.css";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [searchUser, setSearchUser] = useState("");
  const [searchExercise, setSearchExercise] = useState("");
  const itemsPerPage = 50;
  const exerciseEditorRef = useRef(null);

  // User management
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ role: "user", email: "", username: "", rating: 400, win_streak: 0, loss_streak: 0, k_win: 40, k_lose: 30 });

  // Exercise management
  const [exerciseForm, setExerciseForm] = useState({
    id: "",
    config: { timeLimit: 2, memoryLimit: "256m", difficulty: "easy", tags: [] },
    problemContent: "",
    starterCode: "",
    testCases: []
  });

  // Ticket management
  const [tickets, setTickets] = useState([]);
  const [replyForm, setReplyForm] = useState({ id: null, response: "" });

  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    } else if (activeTab === "exercises") {
      loadExercises();
    } else if (activeTab === "tickets") {
      loadTickets();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await get("/admin/users");
      setUsers(data.users || []);
      setCurrentUserPage(1); // Reset to first page when loading users
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    if (!searchUser) return true;
    const searchLower = searchUser.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.id?.toString().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  // Filter exercises based on search
  const filteredExercises = exercises.filter(ex => {
    if (!searchExercise) return true;
    const searchLower = searchExercise.toLowerCase();
    return (
      ex.id?.toLowerCase().includes(searchLower) ||
      ex.config?.difficulty?.toLowerCase().includes(searchLower) ||
      ex.problemContent?.toLowerCase().includes(searchLower)
    );
  });

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await get("/admin/exercises");
      setExercises(data.exercises || []);
      setCurrentPage(1); // Reset to first page when loading exercises
    } catch (err) {
      setError(err.message || "Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  const loadExerciseDetails = async (exerciseId) => {
    try {
      setLoading(true);
      const data = await get(`/admin/exercises/${exerciseId}`);
      setSelectedExercise(data);
      setExerciseForm({
        id: data.id,
        config: data.config,
        problemContent: data.problemContent || "",
        starterCode: data.starterCode || "",
        testCases: data.testCases || []
      });
      // Auto-scroll to editor after a short delay to ensure DOM is updated
      setTimeout(() => {
        exerciseEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err.message || "Failed to load exercise");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId) => {
    try {
      setLoading(true);
      await put(`/admin/users/${userId}`, userForm);
      await loadUsers();
      setEditingUser(null);
      setUserForm({ role: "user", email: "", username: "" });
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setLoading(true);
      await delRequest(`/admin/users/${userId}`);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExercise = async () => {
    try {
      setLoading(true);
      if (selectedExercise) {
        await put(`/admin/exercises/${exerciseForm.id}`, exerciseForm);
      } else {
        await post("/admin/exercises", exerciseForm);
      }
      await loadExercises();
      setSelectedExercise(null);
      setExerciseForm({
        id: "",
        config: { timeLimit: 2, memoryLimit: "256m", difficulty: "easy", tags: [] },
        problemContent: "",
        starterCode: "",
        testCases: []
      });
    } catch (err) {
      setError(err.message || "Failed to save exercise");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm("Are you sure you want to delete this exercise?")) return;
    try {
      setLoading(true);
      await delRequest(`/admin/exercises/${exerciseId}`);
      await loadExercises();
      if (selectedExercise?.id === exerciseId) {
        setSelectedExercise(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete exercise");
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await get("/admin/tickets");
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleReplyTicket = async (ticketId) => {
    try {
      setLoading(true);
      await put(`/admin/tickets/${ticketId}`, {
        admin_response: replyForm.response,
        status: 'resolved'
      });
      setReplyForm({ id: null, response: "" });
      await loadTickets();
    } catch (err) {
      setError(err.message || "Failed to reply to ticket");
    } finally {
      setLoading(false);
    }
  };

  const addTestCase = () => {
    setExerciseForm({
      ...exerciseForm,
      testCases: [...exerciseForm.testCases, { id: `testcase${exerciseForm.testCases.length + 1}`, input: "", output: "" }]
    });
  };

  const updateTestCase = (index, field, value) => {
    const newTestCases = [...exerciseForm.testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setExerciseForm({ ...exerciseForm, testCases: newTestCases });
  };

  const removeTestCase = (index) => {
    const newTestCases = exerciseForm.testCases.filter((_, i) => i !== index);
    setExerciseForm({ ...exerciseForm, testCases: newTestCases });
  };

  return (
    <div className="admin-page">
      <Header />
      <div className="admin-container">
        <h1>Admin Panel</h1>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-tabs">
          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
          <button
            className={activeTab === "exercises" ? "active" : ""}
            onClick={() => setActiveTab("exercises")}
          >
            Exercises
          </button>
          <button
            className={activeTab === "tickets" ? "active" : ""}
            onClick={() => setActiveTab("tickets")}
          >
            Tickets
          </button>
        </div>

        {activeTab === "users" && (
          <div className="admin-section">
            <h2>User Management</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search users by ID, username, email, or role..."
                value={searchUser}
                onChange={(e) => {
                  setSearchUser(e.target.value);
                  setCurrentUserPage(1); // Reset to first page when searching
                }}
                className="search-input"
              />
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Rating</th>
                      <th>W-Streak</th>
                      <th>L-Streak</th>
                      <th>K Win</th>
                      <th>K Lose</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers
                      .slice((currentUserPage - 1) * itemsPerPage, currentUserPage * itemsPerPage)
                      .map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            {editingUser === user.id ? (
                              <select
                                value={userForm.role}
                                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                              >
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                              </select>
                            ) : (
                              user.role || "user"
                            )}
                          </td>
                          <td>
                            {editingUser === user.id ? (
                              <input
                                type="number"
                                value={userForm.rating}
                                onChange={(e) => setUserForm({ ...userForm, rating: Number(e.target.value) })}
                                style={{ width: 80 }}
                              />
                            ) : (
                              user.rating ?? 400
                            )}
                          </td>
                          <td>
                            {editingUser === user.id ? (
                              <input
                                type="number"
                                value={userForm.win_streak}
                                onChange={(e) => setUserForm({ ...userForm, win_streak: Number(e.target.value) })}
                                style={{ width: 60 }}
                              />
                            ) : (
                              user.win_streak ?? 0
                            )}
                          </td>
                          <td>
                            {editingUser === user.id ? (
                              <input
                                type="number"
                                value={userForm.loss_streak}
                                onChange={(e) => setUserForm({ ...userForm, loss_streak: Number(e.target.value) })}
                                style={{ width: 60 }}
                              />
                            ) : (
                              user.loss_streak ?? 0
                            )}
                          </td>
                          <td>
                            {editingUser === user.id ? (
                              <input
                                type="number"
                                value={userForm.k_win}
                                onChange={(e) => setUserForm({ ...userForm, k_win: Number(e.target.value) })}
                                style={{ width: 60 }}
                              />
                            ) : (
                              user.k_win ?? 40
                            )}
                          </td>
                          <td>
                            {editingUser === user.id ? (
                              <input
                                type="number"
                                value={userForm.k_lose}
                                onChange={(e) => setUserForm({ ...userForm, k_lose: Number(e.target.value) })}
                                style={{ width: 60 }}
                              />
                            ) : (
                              user.k_lose ?? 30
                            )}
                          </td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td>
                            {editingUser === user.id ? (
                              <>
                                <button onClick={() => handleUpdateUser(user.id)}>Save</button>
                                <button onClick={() => setEditingUser(null)}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => {
                                  setEditingUser(user.id);
                                  setUserForm({
                                    role: user.role || "user",
                                    email: user.email,
                                    username: user.username,
                                    rating: user.rating ?? 400,
                                    win_streak: user.win_streak ?? 0,
                                    loss_streak: user.loss_streak ?? 0,
                                    k_win: user.k_win ?? 40,
                                    k_lose: user.k_lose ?? 30
                                  });
                                }}>
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {filteredUsers.length > itemsPerPage && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentUserPage(prev => Math.max(1, prev - 1))}
                      disabled={currentUserPage === 1}
                    >
                      Previous
                    </button>
                    <span>
                      Page {currentUserPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
                    </span>
                    <button
                      onClick={() => setCurrentUserPage(prev => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), prev + 1))}
                      disabled={currentUserPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "exercises" && (
          <div className="admin-section">
            <div className="exercise-list">
              <h2>Exercises</h2>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search exercises by ID, difficulty, or content..."
                  value={searchExercise}
                  onChange={(e) => {
                    setSearchExercise(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="search-input"
                />
              </div>
              <button onClick={() => {
                setSelectedExercise(null);
                setExerciseForm({
                  id: "",
                  config: { timeLimit: 2, memoryLimit: "256m", difficulty: "easy", tags: [] },
                  problemContent: "",
                  starterCode: "",
                  testCases: []
                });
                setTimeout(() => {
                  exerciseEditorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}>
                Create New Exercise
              </button>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <ul>
                    {filteredExercises
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((ex) => (
                        <li key={ex.id}>
                          <span>{ex.id}</span>
                          <div>
                            <button onClick={() => loadExerciseDetails(ex.id)}>Edit</button>
                            <button onClick={() => handleDeleteExercise(ex.id)}>Delete</button>
                          </div>
                        </li>
                      ))}
                  </ul>
                  {filteredExercises.length > itemsPerPage && (
                    <div className="pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span>
                        Page {currentPage} of {Math.ceil(filteredExercises.length / itemsPerPage)}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredExercises.length / itemsPerPage), prev + 1))}
                        disabled={currentPage >= Math.ceil(filteredExercises.length / itemsPerPage)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {(selectedExercise || !selectedExercise) && (
              <div className="exercise-editor" ref={exerciseEditorRef}>
                <h2>{selectedExercise ? "Edit Exercise" : "Create Exercise"}</h2>
                <div className="form-group">
                  <label>Exercise ID:</label>
                  <input
                    type="text"
                    value={exerciseForm.id}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, id: e.target.value })}
                    disabled={!!selectedExercise}
                  />
                </div>

                <div className="form-group">
                  <label>Difficulty:</label>
                  <select
                    value={exerciseForm.config.difficulty}
                    onChange={(e) =>
                      setExerciseForm({
                        ...exerciseForm,
                        config: { ...exerciseForm.config, difficulty: e.target.value }
                      })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="difficult">Difficult</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Time Limit (seconds):</label>
                  <input
                    type="number"
                    value={exerciseForm.config.timeLimit}
                    onChange={(e) =>
                      setExerciseForm({
                        ...exerciseForm,
                        config: { ...exerciseForm.config, timeLimit: parseInt(e.target.value) }
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Memory Limit:</label>
                  <input
                    type="text"
                    value={exerciseForm.config.memoryLimit}
                    onChange={(e) =>
                      setExerciseForm({
                        ...exerciseForm,
                        config: { ...exerciseForm.config, memoryLimit: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Problem Content (Markdown):</label>
                  <textarea
                    rows="10"
                    value={exerciseForm.problemContent}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, problemContent: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Starter Code:</label>
                  <textarea
                    rows="10"
                    value={exerciseForm.starterCode}
                    onChange={(e) =>
                      setExerciseForm({ ...exerciseForm, starterCode: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Test Cases:</label>
                  <button className="add-test-case-btn" onClick={addTestCase}>Add Test Case</button>
                  {exerciseForm.testCases.map((tc, index) => (
                    <div key={index} className="test-case">
                      <input
                        type="text"
                        placeholder="Test Case ID"
                        value={tc.id}
                        onChange={(e) => updateTestCase(index, "id", e.target.value)}
                      />
                      <textarea
                        placeholder="Input"
                        value={tc.input}
                        onChange={(e) => updateTestCase(index, "input", e.target.value)}
                      />
                      <textarea
                        placeholder="Output"
                        value={tc.output}
                        onChange={(e) => updateTestCase(index, "output", e.target.value)}
                      />
                      <button onClick={() => removeTestCase(index)}>Remove</button>
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveExercise} disabled={loading}>
                  {loading ? "Saving..." : "Save Exercise"}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="admin-section">
            <h2>Support Tickets</h2>
            {loading ? <p>Loading...</p> : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <React.Fragment key={ticket.id}>
                      <tr>
                        <td>{ticket.id}</td>
                        <td>{ticket.username} <br /><small>{ticket.email}</small></td>
                        <td>{ticket.subject}</td>
                        <td>
                          <span className={`status-badge ${ticket.status}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                        <td>
                          <button onClick={() => setReplyForm(prev => prev.id === ticket.id ? { id: null, response: "" } : { id: ticket.id, response: ticket.admin_response || "" })}>
                            {ticket.status === 'resolved' ? 'View/Edit' : 'Reply'}
                          </button>
                        </td>
                      </tr>
                      {replyForm.id === ticket.id && (
                        <tr>
                          <td colSpan="6" className="ticket-detail-row">
                            <div className="ticket-detail-content">
                              <p><strong>Content:</strong> {ticket.content}</p>
                              <div className="reply-box">
                                <label>Admin Response:</label>
                                <textarea
                                  rows="4"
                                  value={replyForm.response}
                                  onChange={e => setReplyForm({ ...replyForm, response: e.target.value })}
                                />
                                <div className="reply-actions">
                                  <button onClick={() => handleReplyTicket(ticket.id)}>Send Reply & Resolve</button>
                                  <button onClick={() => setReplyForm({ id: null, response: "" })}>Cancel</button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}


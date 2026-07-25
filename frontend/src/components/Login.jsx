import React, { useState } from "react";

const GRADES = ["6", "7", "8", "9", "10", "11", "12"];

function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("8");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    const student = { name: name.trim(), grade };
    localStorage.setItem("samjho_student", JSON.stringify(student));
    onLogin(student);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Namma Mithra</h1>
        <p className="login-sub">Ask your doubt. Understand the gap. Track your progress.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Your Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mallika"
              autoFocus
            />
          </label>
          <label>
            Your Grade
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="submit-btn">
            Start Learning
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

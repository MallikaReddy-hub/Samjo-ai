import React, { useState } from "react";

const SUBJECTS = ["Mathematics", "Science", "Social Science", "English", "Kannada/Hindi (Language)"];

function ModelPaperGenerator({ studentName, setStudentName }) {
  const [board, setBoard] = useState("CBSE");
  const [subject, setSubject] = useState("Mathematics");
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    if (!studentName.trim()) {
      setError("Enter your name first.");
      return;
    }

    setLoading(true);
    setPaper(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/modelpapers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, board, subject }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not generate paper. Try again.");
        return;
      }
      setPaper(data);
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!paper) return;
    const blob = new Blob([paper.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${paper.subject}-${paper.board}-model-paper.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="model-paper">
      <h3>10th Grade Model Question Papers</h3>
      <p className="dashboard-sub">
        AI-generated practice papers matching the real board exam pattern. For official previous
        year papers, check your board's website (cbse.gov.in / kseeb.karnataka.gov.in).
      </p>

      <div className="form-row">
        <label>
          Your Name
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Meena"
          />
        </label>

        <label>
          Board
          <select value={board} onChange={(e) => setBoard(e.target.value)}>
            <option value="CBSE">CBSE</option>
            <option value="Karnataka SSLC">Karnataka SSLC</option>
          </select>
        </label>

        <label>
          Subject
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="submit-btn" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating your paper..." : "Generate Model Paper"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {paper && (
        <div className="paper-output">
          <div className="paper-output-header">
            <span>
              {paper.subject} · {paper.board}
            </span>
            <button className="mic-btn" onClick={handleDownload}>
              Download as .txt
            </button>
          </div>
          <pre className="paper-content">{paper.content}</pre>
        </div>
      )}
    </div>
  );
}

export default ModelPaperGenerator;

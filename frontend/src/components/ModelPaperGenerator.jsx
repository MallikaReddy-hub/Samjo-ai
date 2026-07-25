import React, { useState } from "react";

const SUBJECTS = ["Mathematics", "Science", "Social Science", "English", "Kannada/Hindi (Language)"];
const YEARS = ["2025", "2024", "2023", "2022", "2021", "2020"];

function ModelPaperGenerator({ studentName }) {
  const [board, setBoard] = useState("CBSE");
  const [subject, setSubject] = useState("Mathematics");
  const [mode, setMode] = useState("fresh");
  const [year, setYear] = useState("2025");
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    setPaper(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/modelpapers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          board,
          subject,
          year: mode === "year" ? year : null,
        }),
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
      <h3>Class 10 Question Papers</h3>
      <p className="dashboard-sub">
        AI-generated practice papers matching the real board exam pattern. For official previous
        year papers, check your board's website (cbse.gov.in / kseeb.karnataka.gov.in).
      </p>

      <div className="mode-toggle">
        <button
          className={mode === "fresh" ? "tab active" : "tab"}
          onClick={() => setMode("fresh")}
        >
          AI Model Paper
        </button>
        <button
          className={mode === "year" ? "tab active" : "tab"}
          onClick={() => setMode("year")}
        >
          Practice Paper by Year
        </button>
      </div>

      <div className="form-row">
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

        {mode === "year" && (
          <label>
            Year style
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <button className="submit-btn" onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating your paper..." : "Generate Paper"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {paper && (
        <div className="paper-output">
          <div className="paper-output-header">
            <span>
              {paper.subject} · {paper.board}
              {paper.year ? ` · ${paper.year} style` : ""}
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

import React, { useState } from "react";
import DoubtForm from "./components/DoubtForm.jsx";
import ResultCard from "./components/ResultCard.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ModelPaperGenerator from "./components/ModelPaperGenerator.jsx";

function App() {
  const [activeTab, setActiveTab] = useState("solve");
  const [session, setSession] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [dashboardKey, setDashboardKey] = useState(0);

  const handleResult = (data) => {
    setSession(data);
    setStudentName(data.studentName);
  };

  const handleResolved = () => {
    setDashboardKey((k) => k + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Samjho AI</h1>
        <p>Ask your doubt. Understand the gap. Track your progress.</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === "solve" ? "tab active" : "tab"}
          onClick={() => setActiveTab("solve")}
        >
          Solve a Doubt
        </button>
        <button
          className={activeTab === "dashboard" ? "tab active" : "tab"}
          onClick={() => setActiveTab("dashboard")}
        >
          My Progress
        </button>
        <button
          className={activeTab === "papers" ? "tab active" : "tab"}
          onClick={() => setActiveTab("papers")}
        >
          10th Model Papers
        </button>
      </nav>

      <main className="app-main">
        {activeTab === "solve" && (
          <>
            <DoubtForm onResult={handleResult} />
            {session && <ResultCard session={session} onResolved={handleResolved} />}
          </>
        )}

        {activeTab === "dashboard" && (
          <Dashboard key={dashboardKey} studentName={studentName} />
        )}

        {activeTab === "papers" && (
          <ModelPaperGenerator studentName={studentName} setStudentName={setStudentName} />
        )}
      </main>

      <footer className="app-footer">
        <p>Built for Idea2Impact 2026 · Education & Social Impact</p>
      </footer>
    </div>
  );
}

export default App;

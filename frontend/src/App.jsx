import React, { useState, useEffect } from "react";
import Login from "./components/Login.jsx";
import DoubtForm from "./components/DoubtForm.jsx";
import ResultCard from "./components/ResultCard.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ModelPaperGenerator from "./components/ModelPaperGenerator.jsx";

function App() {
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("solve");
  const [session, setSession] = useState(null);
  const [dashboardKey, setDashboardKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("samjho_student");
    if (saved) {
      try {
        setStudent(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("samjho_student");
      }
    }
  }, []);

  const handleResult = (data) => {
    setSession(data);
  };

  const handleResolved = () => {
    setDashboardKey((k) => k + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem("samjho_student");
    setStudent(null);
    setSession(null);
    setActiveTab("solve");
  };

  if (!student) {
    return <Login onLogin={setStudent} />;
  }

  const isGrade10 = student.grade === "10";

  return (
    <div className="app">
      <header className="app-header">
        <h1>Namma Mithra</h1>
        <p>
          Hi {student.name} · Grade {student.grade}{" "}
          <button className="logout-link" onClick={handleLogout}>
            (switch student)
          </button>
        </p>
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
        {isGrade10 && (
          <button
            className={activeTab === "papers" ? "tab active" : "tab"}
            onClick={() => setActiveTab("papers")}
          >
            Model Papers
          </button>
        )}
      </nav>

      <main className="app-main">
        {activeTab === "solve" && (
          <>
            <DoubtForm student={student} onResult={handleResult} />
            {session && <ResultCard session={session} onResolved={handleResolved} />}
          </>
        )}

        {activeTab === "dashboard" && (
          <Dashboard key={dashboardKey} studentName={student.name} />
        )}

        {activeTab === "papers" && isGrade10 && (
          <ModelPaperGenerator studentName={student.name} />
        )}
      </main>

      <footer className="app-footer">
        <p>Educational Support for Every Student</p>
      </footer>
    </div>
  );
}

export default App;

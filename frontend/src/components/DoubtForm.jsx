import React, { useState, useRef } from "react";

const GRADES = ["6", "7", "8", "9", "10", "11", "12"];
const SUBJECTS = ["Math", "Science", "English", "Social Studies", "Computer Science"];

const LANGUAGES = [
  { label: "English", speechCode: "en-IN" },
  { label: "Kannada", speechCode: "kn-IN" },
  { label: "Telugu", speechCode: "te-IN" },
  { label: "Hindi", speechCode: "hi-IN" },
  { label: "Tamil", speechCode: "ta-IN" },
];

function DoubtForm({ onResult }) {
  const [studentName, setStudentName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("8");
  const [subject, setSubject] = useState("Math");
  const [doubtText, setDoubtText] = useState("");
  const [language, setLanguage] = useState(
    () => localStorage.getItem("samjho_language") || "English"
  );
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const handleLanguageChange = (value) => {
    setLanguage(value);
    localStorage.setItem("samjho_language", value);
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    const selectedLang = LANGUAGES.find((l) => l.label === language);
    recognition.lang = selectedLang ? selectedLang.speechCode : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDoubtText((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError("Could not capture voice. Please try again or type instead.");
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!studentName.trim() || !doubtText.trim()) {
      setError("Please enter your name and your doubt.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/doubts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentName, gradeLevel, subject, doubtText, explanationLanguage: language }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      onResult(data);
      setDoubtText("");
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="doubt-form" onSubmit={handleSubmit}>
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
          Grade
          <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
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

        <label>
          Explain in
          <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.label} value={l.label}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="doubt-label">
        Your Doubt
        <textarea
          value={doubtText}
          onChange={(e) => setDoubtText(e.target.value)}
          placeholder="Type your doubt here, or use the mic to speak it..."
          rows={4}
        />
      </label>

      <div className="button-row">
        <button
          type="button"
          className={isListening ? "mic-btn listening" : "mic-btn"}
          onClick={isListening ? stopVoiceInput : startVoiceInput}
        >
          {isListening ? "🎙 Listening... tap to stop" : `🎤 Speak your doubt (${language})`}
        </button>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Thinking..." : "Get Help"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
    </form>
  );
}

export default DoubtForm;

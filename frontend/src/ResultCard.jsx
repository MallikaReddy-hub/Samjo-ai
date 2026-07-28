import React, { useState } from "react";

const SPEECH_LANG_MAP = {
  English: "en-IN",
  Kannada: "kn-IN",
  Hindi: "hi-IN",
};

function speakText(text, language) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_LANG_MAP[language] || "en-IN";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function ResultCard({ session, onResolved }) {
  const [understood, setUnderstood] = useState(null);
  const [simplified, setSimplified] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [loadingSimplified, setLoadingSimplified] = useState(false);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [marking, setMarking] = useState(false);
  const [showVideos, setShowVideos] = useState(false);

  const handleUnderstood = () => {
    setUnderstood(true);
  };

  const fetchSimplerExplanation = async () => {
    setUnderstood(false);
    setLoadingSimplified(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/doubts/${session._id}/reexplain`,
        { method: "POST" }
      );
      const data = await res.json();
      if (res.ok) {
        setSimplified(data.simplifiedExplanation);
        setAttemptCount((c) => c + 1);
      }
    } catch (err) {
      // silent fail, student can still try practice questions or video
    } finally {
      setLoadingSimplified(false);
    }
  };

  const handleSelect = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleCheck = async () => {
    setChecked(true);

    const allCorrect = session.practiceQuestions.every(
      (q, i) => answers[i] === q.correctAnswer
    );

    if (allCorrect) {
      setMarking(true);
      try {
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/doubts/${session._id}/resolve`,
          { method: "PATCH" }
        );
        onResolved();
      } catch (err) {
        // silent fail
      } finally {
        setMarking(false);
      }
    }
  };

  const handleShowVideos = () => setShowVideos(true);

  const videoSearchQuery = encodeURIComponent(
    `${session.topicTag} ${session.subject} class ${session.gradeLevel} explanation`
  );
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${videoSearchQuery}`;

  return (
    <div className="result-card fade-in">
      <span className="topic-tag">{session.topicTag}</span>

      <h3>Where the gap is</h3>
      <p>{session.conceptGap}</p>

      <h3>Explanation</h3>
      <p>{session.explanation}</p>
      <button
        className="mic-btn speak-btn"
        onClick={() => speakText(session.explanation, session.explanationLanguage)}
      >
        🔊 Read aloud
      </button>
      
        className="mic-btn speak-btn whatsapp-share"
        href={`https://wa.me/?text=${encodeURIComponent(
          `${session.studentName}'s doubt (${session.subject}, Grade ${session.gradeLevel}):\n\n"${session.doubtText}"\n\nExplanation:\n${session.explanation}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        📤 Share with parent/teacher
      </a>

      {understood === null && (
        <div className="understood-check">
          <p className="understood-prompt">Did you understand this?</p>
          <div className="understood-buttons">
            <button className="submit-btn" onClick={handleUnderstood}>
              Yes, got it
            </button>
            <button className="mic-btn" onClick={fetchSimplerExplanation}>
              Not yet
            </button>
          </div>
        </div>
      )}

      {understood === false && (
        <div className="simplified-block fade-in">
          <h3>Let's try it a simpler way{attemptCount > 1 ? ` (try ${attemptCount})` : ""}</h3>
          {loadingSimplified ? (
            <p>Thinking of a simpler way to explain...</p>
          ) : (
            <>
              <p>{simplified}</p>
              <button
                className="mic-btn speak-btn"
                onClick={() => speakText(simplified, session.explanationLanguage)}
              >
                🔊 Read aloud
              </button>
            </>
          )}

          <div className="understood-buttons" style={{ marginTop: "12px" }}>
            <button className="submit-btn" onClick={() => setUnderstood(true)}>
              Okay, now I understand
            </button>
            <button
              className="mic-btn"
              onClick={fetchSimplerExplanation}
              disabled={loadingSimplified}
            >
              Still not clear — try again
            </button>
          </div>

          {!showVideos ? (
            <button className="mic-btn" onClick={handleShowVideos} style={{ marginTop: "10px" }}>
              😕 Prefer a video instead?
            </button>
          ) : (
            <div className="video-help">
              <p>
                Here are video explanations for <strong>{session.topicTag}</strong>:
              </p>
              
                className="video-link-btn"
                href={youtubeSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                ▶ Watch videos on YouTube
              </a>
            </div>
          )}
        </div>
      )}

      {understood === true && (
        <div className="fade-in">
          <h3>Try these to check yourself</h3>
          {session.practiceQuestions.map((q, i) => (
            <div className="question-block" key={i}>
              <p className="question-text">{i + 1}. {q.question}</p>
              <div className="options">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    className={
                      "option-btn" +
                      (answers[i] === opt ? " selected" : "") +
                      (checked && opt === q.correctAnswer ? " correct" : "") +
                      (checked && answers[i] === opt && opt !== q.correctAnswer
                        ? " wrong"
                        : "")
                    }
                    onClick={() => !checked && handleSelect(i, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!checked ? (
            <button
              className="submit-btn"
              onClick={handleCheck}
              disabled={Object.keys(answers).length < session.practiceQuestions.length}
            >
              Check Answers
            </button>
          ) : (
            <p className="feedback-text">
              {marking
                ? "Saving your progress..."
                : session.practiceQuestions.every((q, i) => answers[i] === q.correctAnswer)
                ? "Nice work — this topic is marked as resolved in your dashboard."
                : "Some answers need another look. Re-read the explanation above and try the next doubt when ready."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ResultCard;

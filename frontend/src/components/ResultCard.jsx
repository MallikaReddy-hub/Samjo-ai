import React, { useState } from "react";

function ResultCard({ session, onResolved }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [marking, setMarking] = useState(false);
  const [showVideos, setShowVideos] = useState(false);

  const handleShowVideos = () => {
    setShowVideos(true);
  };

  const videoSearchQuery = encodeURIComponent(
    `${session.topicTag} ${session.subject} class ${session.gradeLevel} explanation`
  );
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${videoSearchQuery}`;

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
        // silent fail, dashboard will just not update this time
      } finally {
        setMarking(false);
      }
    }
  };

  return (
    <div className="result-card">
      <span className="topic-tag">{session.topicTag}</span>

      <h3>Where the gap is</h3>
      <p>{session.conceptGap}</p>

      <h3>Explanation</h3>
      <p>{session.explanation}</p>

      {!showVideos ? (
        <button className="mic-btn" onClick={handleShowVideos}>
          😕 I still didn't understand — show me a video
        </button>
      ) : (
        <div className="video-help">
          <p>
            Here are video explanations for <strong>{session.topicTag}</strong> that
            might make it click:
          </p>
          <a
            className="video-link-btn"
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            ▶ Watch videos on YouTube
          </a>
        </div>
      )}

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
  );
}

export default ResultCard;

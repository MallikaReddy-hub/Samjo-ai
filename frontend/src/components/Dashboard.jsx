import React, { useEffect, useState } from "react";

function Dashboard({ studentName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentName) return;
    fetchDashboard();
  }, [studentName]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dashboard/${studentName}`
      );
      const result = await res.json();
      setData(result);
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (!studentName) {
    return <p className="empty-text">Submit a doubt first to see your progress here.</p>;
  }

  if (loading) return <p className="empty-text">Loading your progress...</p>;

  if (!data || data.totalSessions === 0) {
    return <p className="empty-text">No doubts logged yet for {studentName}.</p>;
  }

  const totalResolved = data.topics.reduce((sum, t) => sum + t.resolved, 0);
  const masteredTopics = data.topics.filter((t) => t.masteryPercent === 100).length;

  const badges = [];
  if (totalResolved >= 1) badges.push({ icon: "🌱", label: "First Step" });
  if (totalResolved >= 5) badges.push({ icon: "📚", label: "Steady Learner" });
  if (totalResolved >= 10) badges.push({ icon: "⭐", label: "Doubt Buster" });
  if (masteredTopics >= 1) badges.push({ icon: "🏆", label: "Topic Master" });
  if (masteredTopics >= 3) badges.push({ icon: "👑", label: "Concept Champion" });

  return (
    <div className="dashboard">
      <div className="dashboard-title-row">
        <h3>Your Concept Mastery</h3>
        {badges.length > 0 && (
          <span className="badges-inline">
            {badges.map((b) => (
              <span className="badge-chip" key={b.label}>
                {b.icon} {b.label}
              </span>
            ))}
          </span>
        )}
      </div>
      <p className="dashboard-sub">{data.totalSessions} doubt(s) logged so far</p>

      {data.topics.map((t) => (
        <div className="topic-row" key={t.topic}>
          <div className="topic-row-header">
            <span>{t.topic}</span>
            <span>{t.masteryPercent}%</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${t.masteryPercent}%` }}
            />
          </div>
          <span className="topic-meta">
            {t.resolved}/{t.totalDoubts} resolved
          </span>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;

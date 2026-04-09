import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await api.get("/exams");
        setExams(data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || "Unable to load exams");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <section className="stack-lg">
      <article className="hero-card">
        <p className="badge">{user?.role?.toUpperCase()}</p>
        <h1>Exam Dashboard</h1>
        <p className="muted">Track upcoming exams, enter a secure test environment, and view scored results.</p>
      </article>

      {loading && <p className="muted">Loading exams...</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid two">
        {!loading && !exams.length && (
          <article className="card">
            <h3>No active exams</h3>
            <p className="muted">Ask your admin to publish and schedule assessments.</p>
          </article>
        )}

        {exams.map((exam) => (
          <article key={exam._id} className="card animate-up">
            <h3>{exam.title}</h3>
            <p className="muted">{exam.description || "No description"}</p>
            <p className="meta">Duration: {exam.durationMinutes} mins</p>
            <p className="meta">Questions: {exam.questions?.length || 0}</p>

            <div className="row">
              <Link className="btn-link" to={`/exam/${exam._id}`}>
                Start Exam
              </Link>
              {user?.role === "admin" && <span className="badge success">Published: {exam.isPublished ? "Yes" : "No"}</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DashboardPage;

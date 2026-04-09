import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

function StudentDashboardPage() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [examsResponse, resultsResponse] = await Promise.all([
          api.get("/exams"),
          api.get("/results/me"),
        ]);
        setExams(examsResponse.data || []);
        setResults(resultsResponse.data || []);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getExamIdFromResult = (result) => {
    if (result?.examId?._id) {
      return String(result.examId._id);
    }
    if (result?.exam?._id) {
      return String(result.exam._id);
    }
    if (result?.examId) {
      return String(result.examId);
    }
    if (result?.exam) {
      return String(result.exam);
    }
    return "";
  };

  const metrics = useMemo(() => {
    const attemptedExamIds = new Set(
      results
        .map(getExamIdFromResult)
        .filter(Boolean)
    );

    const completed = attemptedExamIds.size;
    const average =
      completed > 0
        ? Math.round(
            results.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0) / completed
          )
        : 0;

    const available = exams.filter((exam) => !attemptedExamIds.has(String(exam._id))).length;

    return {
      available,
      completed,
      average,
      attemptedExamIds,
    };
  }, [exams, results]);

  return (
    <section className="space-y-6">
      <div className="glass-panel p-6">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <p className="mt-2 text-slate-300">Track upcoming exams and jump into your test environment quickly.</p>
      </div>

      {error && <p className="rounded-lg bg-rose-500/20 p-3 text-sm text-rose-200">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="glass-panel p-5">
          <p className="text-sm text-slate-400">Available Exams</p>
          <p className="mt-2 text-2xl font-bold">{metrics.available}</p>
        </article>
        <article className="glass-panel p-5">
          <p className="text-sm text-slate-400">Attempted Exams</p>
          <p className="mt-2 text-2xl font-bold">{metrics.completed}</p>
        </article>
        <article className="glass-panel p-5">
          <p className="text-sm text-slate-400">Average Score</p>
          <p className="mt-2 text-2xl font-bold">{metrics.average}%</p>
        </article>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <h2 className="text-lg font-semibold">Upcoming Exam Schedule</h2>
        </div>
        {loading && <p className="p-4 text-sm text-slate-400">Loading exams...</p>}
        {!loading && exams.length === 0 && (
          <p className="p-4 text-sm text-slate-400">No active exams available right now.</p>
        )}
        <div className="divide-y divide-white/10">
          {exams.map((exam) => (
            <div key={exam._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">
                  {exam.title}{" "}
                  {metrics.attemptedExamIds.has(String(exam._id)) && (
                    <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">Already Attempted</span>
                  )}
                </p>
                <p className="text-sm text-slate-400">
                  {new Date(exam.startTime).toLocaleString()} | {exam.durationMinutes} mins
                </p>
              </div>
              {metrics.attemptedExamIds.has(String(exam._id)) ? (
                <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">Already Attempted</span>
              ) : (
                <Link to={`/take-exam?examId=${exam._id}`} className="primary-btn inline-block">Start</Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StudentDashboardPage;

import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

function ResultPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const latest = useMemo(() => {
    try {
      const raw = localStorage.getItem("exam-latest-result");
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      localStorage.removeItem("exam-latest-result");
      return null;
    }
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await api.get("/results/me");
        setResults(response.data || []);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  const latestFromApi = results[0];
  const displayResult = latestFromApi
    ? {
        title: latestFromApi.exam?.title || "Exam",
        score: latestFromApi.score,
        total: latestFromApi.maxScore,
        percentage: latestFromApi.percentage,
      }
    : latest;

  return (
    <section className="space-y-6">
      <article className="glass-panel p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Result</p>
        <h1 className="mt-2 text-2xl font-bold">Exam Result</h1>
        <p className="mt-2 text-slate-300">See your latest exam performance details.</p>
      </article>

      {error && <p className="rounded-lg bg-rose-500/20 p-3 text-sm text-rose-200">{error}</p>}

      {loading && <article className="glass-panel p-6 text-sm text-slate-400">Loading latest result...</article>}

      {!loading && !displayResult && (
        <article className="glass-panel p-6">
          <p className="text-slate-300">No result available yet. Complete an exam to view your score.</p>
        </article>
      )}

      {!loading && displayResult && (
        <article className="glass-panel p-6">
          <h3 className="text-xl font-semibold">{displayResult.title}</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Score</p>
              <p className="mt-2 text-3xl font-bold">{displayResult.score}/{displayResult.total}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Percentage</p>
              <p className="mt-2 text-3xl font-bold">{displayResult.percentage}%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Status</p>
              <p className="mt-2 text-3xl font-bold">{displayResult.percentage >= 40 ? "Pass" : "Fail"}</p>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}

export default ResultPage;

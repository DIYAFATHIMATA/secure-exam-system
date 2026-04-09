import { useEffect, useState } from "react";
import api from "../api/client";

function ViewResultsPage() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadExams = async () => {
      try {
        const response = await api.get("/exams");
        const examList = response.data || [];
        setExams(examList);
        if (examList.length > 0) {
          setSelectedExamId(examList[0]._id);
        }
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load exams");
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      if (!selectedExamId) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/results/exam/${selectedExamId}`);
        setResults(response.data || []);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load exam results");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [selectedExamId]);

  const selectedExamTitle = exams.find((exam) => exam._id === selectedExamId)?.title || "-";

  return (
    <section className="space-y-6">
      <article className="glass-panel p-6">
        <h1 className="text-2xl font-bold">View Results</h1>
        <p className="mt-2 text-slate-300">Track student scores and overall exam outcomes.</p>
      </article>

      <article className="glass-panel p-4">
        <label className="mb-1 block text-sm text-slate-300">Select Exam</label>
        <select
          className="input-field"
          value={selectedExamId}
          onChange={(event) => setSelectedExamId(event.target.value)}
          disabled={exams.length === 0}
        >
          {exams.map((exam) => (
            <option key={exam._id} value={exam._id}>{exam.title}</option>
          ))}
        </select>
      </article>

      <article className="glass-panel overflow-hidden">
        <div className="grid grid-cols-4 gap-2 border-b border-white/10 bg-white/5 p-4 text-sm font-semibold text-slate-200">
          <span>Student</span>
          <span>Exam</span>
          <span>Score</span>
          <span>Percentage</span>
        </div>
        {error && <p className="p-4 text-sm text-rose-200">{error}</p>}
        {loading && <p className="p-4 text-sm text-slate-400">Loading results...</p>}
        {!loading && results.length === 0 && <p className="p-4 text-sm text-slate-400">No submissions for this exam yet.</p>}
        {results.map((result) => (
          <div key={result._id} className="grid grid-cols-4 gap-2 border-b border-white/10 p-4 text-sm text-slate-300 last:border-b-0">
            <span>{result.student?.name || "Unknown"}</span>
            <span>{selectedExamTitle}</span>
            <span>{result.score}/{result.maxScore}</span>
            <span>{result.percentage}%</span>
          </div>
        ))}
      </article>
    </section>
  );
}

export default ViewResultsPage;

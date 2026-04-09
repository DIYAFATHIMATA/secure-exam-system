import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

function AdminDashboardPage() {
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [latestExamResults, setLatestExamResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [studentsResponse, examsResponse] = await Promise.all([
          api.get("/auth/students"),
          api.get("/exams"),
        ]);

        const examList = examsResponse.data || [];
        setStudents(studentsResponse.data || []);
        setExams(examList);

        if (examList.length > 0) {
          const latestExam = examList[0];
          const resultResponse = await api.get(`/results/exam/${latestExam._id}`);
          setLatestExamResults(resultResponse.data || []);
        }
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load admin metrics");
      }
    };

    loadMetrics();
  }, []);

  const metrics = useMemo(() => {
    const activeExams = exams.filter((exam) => {
      const now = Date.now();
      return now >= new Date(exam.startTime).getTime() && now <= new Date(exam.endTime).getTime();
    }).length;

    const averageScore =
      latestExamResults.length > 0
        ? Math.round(
            latestExamResults.reduce((sum, result) => sum + (Number(result.percentage) || 0), 0) /
              latestExamResults.length
          )
        : 0;

    return [
      { label: "Total Students", value: String(students.length) },
      { label: "Active Exams", value: String(activeExams) },
      { label: "Latest Exam Submissions", value: String(latestExamResults.length) },
      { label: "Latest Average Score", value: `${averageScore}%` },
    ];
  }, [exams, latestExamResults, students.length]);

  return (
    <section className="space-y-6">
      <div className="glass-panel p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-slate-300">Monitor exams, student activity, and platform performance.</p>
      </div>

      {error && <p className="rounded-lg bg-rose-500/20 p-3 text-sm text-rose-200">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <article key={item.label} className="glass-panel p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
          </article>
        ))}
      </div>

      <div className="glass-panel p-5">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li className="rounded-lg border border-white/10 bg-white/5 p-3">Mathematics Midterm published for Batch A.</li>
          <li className="rounded-lg border border-white/10 bg-white/5 p-3">24 students submitted Computer Networks exam.</li>
          <li className="rounded-lg border border-white/10 bg-white/5 p-3">System flagged 3 anti-cheating events in Physics exam.</li>
        </ul>
      </div>
    </section>
  );
}

export default AdminDashboardPage;

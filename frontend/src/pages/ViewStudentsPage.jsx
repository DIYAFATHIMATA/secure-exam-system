import { useEffect, useState } from "react";
import api from "../api/client";

function ViewStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await api.get("/auth/students");
        setStudents(response.data || []);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  return (
    <section className="space-y-6">
      <article className="glass-panel p-6">
        <h1 className="text-2xl font-bold">View Students</h1>
        <p className="mt-2 text-slate-300">Browse registered students in the examination portal.</p>
      </article>

      <article className="glass-panel overflow-hidden">
        <div className="grid grid-cols-4 gap-2 border-b border-white/10 bg-white/5 p-4 text-sm font-semibold text-slate-200">
          <span>ID</span>
          <span>Name</span>
          <span>Email</span>
          <span>Joined</span>
        </div>
        {error && <p className="p-4 text-sm text-rose-200">{error}</p>}
        {loading && <p className="p-4 text-sm text-slate-400">Loading students...</p>}
        {!loading && students.length === 0 && <p className="p-4 text-sm text-slate-400">No students found.</p>}
        {students.map((student) => (
          <div key={student._id} className="grid grid-cols-4 gap-2 border-b border-white/10 p-4 text-sm text-slate-300 last:border-b-0">
            <span>{student._id.slice(-6).toUpperCase()}</span>
            <span>{student.name}</span>
            <span>{student.email}</span>
            <span>{new Date(student.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </article>
    </section>
  );
}

export default ViewStudentsPage;

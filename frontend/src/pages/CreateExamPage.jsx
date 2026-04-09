import { useState } from "react";
import api from "../api/client";

function CreateExamPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: 60,
    startTime: "",
    endTime: "",
    isPublished: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onChange = (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [event.target.name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await api.post("/exams", {
        title: form.title,
        description: form.description,
        durationMinutes: Number(form.durationMinutes),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        isPublished: form.isPublished,
      });

      setMessage(`Exam "${form.title}" created successfully.`);
      setForm({
        title: "",
        description: "",
        durationMinutes: 60,
        startTime: "",
        endTime: "",
        isPublished: true,
      });
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <article className="glass-panel p-6">
        <h1 className="text-2xl font-bold">Create Exam</h1>
        <p className="mt-2 text-slate-300">Create and schedule a new exam for students.</p>
      </article>

      <article className="glass-panel p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Exam Title</label>
            <input className="input-field" name="title" value={form.title} onChange={onChange} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Duration (minutes)</label>
            <input className="input-field" type="number" min={1} name="durationMinutes" value={form.durationMinutes} onChange={onChange} required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-slate-300">Description</label>
            <textarea className="input-field min-h-24" name="description" value={form.description} onChange={onChange} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Start Time</label>
            <input className="input-field" type="datetime-local" name="startTime" value={form.startTime} onChange={onChange} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">End Time</label>
            <input className="input-field" type="datetime-local" name="endTime" value={form.endTime} onChange={onChange} required />
          </div>

          <label className="md:col-span-2 flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={onChange} />
            Publish exam immediately
          </label>

          <button className="primary-btn md:col-span-2" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Exam"}
          </button>
        </form>

        {error && <p className="mt-4 rounded-lg bg-rose-500/20 p-3 text-sm text-rose-200">{error}</p>}
        {message && <p className="mt-4 rounded-lg bg-emerald-500/20 p-3 text-sm text-emerald-200">{message}</p>}
      </article>
    </section>
  );
}

export default CreateExamPage;

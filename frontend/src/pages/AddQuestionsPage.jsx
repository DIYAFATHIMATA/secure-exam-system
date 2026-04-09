import { useEffect, useState } from "react";
import api from "../api/client";

function AddQuestionsPage() {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({
    examId: "",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    answer: "A",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadExams = async () => {
      try {
        const response = await api.get("/exams");
        const examList = response.data || [];
        setExams(examList);
        if (examList.length > 0) {
          setForm((prev) => ({ ...prev, examId: examList[0]._id }));
        }
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to load exams");
      }
    };

    loadExams();
  }, []);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const options = [form.optionA, form.optionB, form.optionC, form.optionD];
    const answerMap = { A: 0, B: 1, C: 2, D: 3 };

    try {
      await api.post(`/exams/${form.examId}/questions`, {
        questionText: form.question,
        options,
        correctOption: answerMap[form.answer],
        points: 1,
      });

      setMessage("Question added successfully.");
      setForm((prev) => ({
        ...prev,
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        answer: "A",
      }));
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <article className="glass-panel p-6">
        <h1 className="text-2xl font-bold">Add Questions</h1>
        <p className="mt-2 text-slate-300">Add multiple-choice questions to an existing exam.</p>
      </article>

      <article className="glass-panel p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Select Exam</label>
            <select className="input-field" name="examId" value={form.examId} onChange={onChange} required>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>{exam.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Question</label>
            <textarea className="input-field min-h-24" name="question" value={form.question} onChange={onChange} required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Option A</label>
              <input className="input-field" name="optionA" value={form.optionA} onChange={onChange} required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Option B</label>
              <input className="input-field" name="optionB" value={form.optionB} onChange={onChange} required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Option C</label>
              <input className="input-field" name="optionC" value={form.optionC} onChange={onChange} required />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Option D</label>
              <input className="input-field" name="optionD" value={form.optionD} onChange={onChange} required />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Correct Answer</label>
            <select className="input-field" name="answer" value={form.answer} onChange={onChange}>
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>

          <button className="primary-btn" type="submit" disabled={loading || !form.examId}>
            {loading ? "Saving..." : "Add Question"}
          </button>
        </form>

        {error && <p className="mt-4 rounded-lg bg-rose-500/20 p-3 text-sm text-rose-200">{error}</p>}
        {message && <p className="mt-4 rounded-lg bg-emerald-500/20 p-3 text-sm text-emerald-200">{message}</p>}
      </article>
    </section>
  );
}

export default AddQuestionsPage;

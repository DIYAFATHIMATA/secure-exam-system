import { useEffect, useState } from "react";
import api from "../api/client";

function AdminPanelPage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [examResults, setExamResults] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [examForm, setExamForm] = useState({
    title: "",
    description: "",
    durationMinutes: 60,
    startTime: "",
    endTime: "",
    isPublished: true,
  });

  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    options: "",
    correctOption: 0,
    points: 1,
  });

  const loadExams = async () => {
    try {
      const { data } = await api.get("/exams");
      setExams(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to load exams");
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const onChangeExam = (event) => {
    const { name, value, type, checked } = event.target;
    setExamForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onCreateExam = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/exams", examForm);
      setMessage("Exam created successfully.");
      await loadExams();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Exam creation failed");
    }
  };

  const onChangeQuestion = (event) => {
    setQuestionForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onAddQuestion = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!selectedExam) {
      setError("Select an exam before adding questions.");
      return;
    }

    const options = questionForm.options
      .split("|")
      .map((option) => option.trim())
      .filter(Boolean);

    try {
      await api.post(`/exams/${selectedExam}/questions`, {
        questionText: questionForm.questionText,
        options,
        correctOption: Number(questionForm.correctOption),
        points: Number(questionForm.points),
      });
      setMessage("Question added successfully.");
      setQuestionForm({ questionText: "", options: "", correctOption: 0, points: 1 });
      await loadExams();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Question creation failed");
    }
  };

  const onLoadResults = async () => {
    if (!selectedExam) {
      setError("Select an exam to view leaderboard.");
      return;
    }

    setError("");
    try {
      const { data } = await api.get(`/results/exam/${selectedExam}`);
      setExamResults(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to fetch result data");
    }
  };

  return (
    <section className="stack-lg">
      <article className="hero-card">
        <p className="badge">Admin Command Center</p>
        <h1>Exam & Question Management</h1>
        <p className="muted">Create exams, add questions, and monitor student performance at a glance.</p>
      </article>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid two">
        <article className="card">
          <h3>Create Exam</h3>
          <form className="stack" onSubmit={onCreateExam}>
            <label>
              Title
              <input name="title" value={examForm.title} onChange={onChangeExam} required />
            </label>

            <label>
              Description
              <textarea name="description" value={examForm.description} onChange={onChangeExam} rows={3} />
            </label>

            <label>
              Duration (minutes)
              <input
                type="number"
                name="durationMinutes"
                value={examForm.durationMinutes}
                onChange={onChangeExam}
                min={1}
                required
              />
            </label>

            <label>
              Start Time
              <input type="datetime-local" name="startTime" value={examForm.startTime} onChange={onChangeExam} required />
            </label>

            <label>
              End Time
              <input type="datetime-local" name="endTime" value={examForm.endTime} onChange={onChangeExam} required />
            </label>

            <label className="row">
              <input type="checkbox" name="isPublished" checked={examForm.isPublished} onChange={onChangeExam} />
              Publish immediately
            </label>

            <button type="submit">Create Exam</button>
          </form>
        </article>

        <article className="card">
          <h3>Add Question</h3>

          <label>
            Select Exam
            <select value={selectedExam} onChange={(event) => setSelectedExam(event.target.value)}>
              <option value="">Choose exam</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </label>

          <form className="stack" onSubmit={onAddQuestion}>
            <label>
              Question Text
              <textarea
                name="questionText"
                value={questionForm.questionText}
                onChange={onChangeQuestion}
                rows={3}
                required
              />
            </label>

            <label>
              Options (use | separator)
              <input
                name="options"
                value={questionForm.options}
                onChange={onChangeQuestion}
                placeholder="Option A | Option B | Option C"
                required
              />
            </label>

            <label>
              Correct Option Index
              <input
                type="number"
                name="correctOption"
                value={questionForm.correctOption}
                onChange={onChangeQuestion}
                min={0}
                required
              />
            </label>

            <label>
              Points
              <input type="number" name="points" value={questionForm.points} onChange={onChangeQuestion} min={1} required />
            </label>

            <button type="submit">Add Question</button>
          </form>

          <button type="button" className="ghost-btn" onClick={onLoadResults}>
            View Exam Leaderboard
          </button>
        </article>
      </div>

      <article className="card">
        <h3>Leaderboard</h3>
        {!examResults.length && <p className="muted">No result data loaded.</p>}
        <div className="stack-sm">
          {examResults.map((result) => (
            <div key={result._id} className="leaderboard-item">
              <span>{result.student?.name || "Student"}</span>
              <span>{result.score}/{result.maxScore} ({result.percentage}%)</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default AdminPanelPage;

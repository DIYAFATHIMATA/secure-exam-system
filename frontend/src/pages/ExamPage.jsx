import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";

const MAX_VIOLATIONS = 3;

function ExamPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examId = searchParams.get("examId");
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolation, setLastViolation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const hasSubmittedRef = useRef(false);
  const answersRef = useRef({});
  const violationsRef = useRef(0);
  const fullscreenActivatedRef = useRef(false);
  const lastViolationRef = useRef({ reason: "", at: 0 });
  const totalQuestions = useMemo(() => exam?.questions?.length || 0, [exam]);

  const buildAnswerPayload = useCallback(
    () =>
      Object.entries(answersRef.current).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      })),
    []
  );

  const trackCheating = useCallback(
    async (eventType, details) => {
      if (!examId) {
        return;
      }

      try {
        await api.post("/anti-cheat/track", {
          examId,
          eventType,
          details,
        });
      } catch (apiError) {
        // Keep exam flow uninterrupted even if tracking API fails.
      }
    },
    [examId]
  );

  const onSelectOption = (questionId, selectedOption) => {
    setAnswers((prev) => {
      const nextAnswers = { ...prev, [questionId]: selectedOption };
      answersRef.current = nextAnswers;
      return nextAnswers;
    });
  };

  const saveAnswers = useCallback(async () => {
    if (!examId || hasSubmittedRef.current) {
      return;
    }

    const payload = buildAnswerPayload();
    if (payload.length === 0) {
      return;
    }

    await api.post(`/exams/${examId}/answers`, { answers: payload });
  }, [buildAnswerPayload, examId]);

  const onSubmit = useCallback(
    async (autoSubmitted = false, submitReason = "manual") => {
      if (hasSubmittedRef.current || submitting || !examId) {
        return;
      }

      hasSubmittedRef.current = true;
      setSubmitting(true);
      setError("");

      try {
        const response = await api.post(`/exams/${examId}/submit`, {
          answers: buildAnswerPayload(),
        });

        localStorage.setItem(
          "exam-latest-result",
          JSON.stringify({
            examId,
            title: exam?.title || "Exam",
            score: response.data.score,
            total: response.data.maxScore,
            percentage: response.data.percentage,
            autoSubmitted,
            submitReason,
            violations: violationsRef.current,
            submittedAt: response.data.submittedAt,
          })
        );

        navigate("/result");
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Failed to submit exam");
        hasSubmittedRef.current = false;
      } finally {
        setSubmitting(false);
      }
    },
    [buildAnswerPayload, exam?.title, examId, navigate, submitting]
  );

  useEffect(() => {
    const loadExam = async () => {
      if (!examId) {
        try {
          const examsResponse = await api.get("/exams");
          const availableExams = examsResponse.data || [];

          if (availableExams.length > 0) {
            navigate(`/take-exam?examId=${availableExams[0]._id}`, { replace: true });
            return;
          }

          setError("No active exams available right now.");
        } catch (apiError) {
          setError(apiError?.response?.data?.message || "Unable to load exams");
        } finally {
          setLoading(false);
        }

        return;
      }

      try {
        await api.post(`/exams/${examId}/start`);
        const response = await api.get(`/exams/${examId}`);
        setExam(response.data);
        setTimer((response.data.durationMinutes || 1) * 60);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Unable to start exam");
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId, navigate]);

  const recordViolation = useCallback((reason) => {
    if (hasSubmittedRef.current || submitting) {
      return;
    }

    const now = Date.now();
    const previous = lastViolationRef.current;
    if (previous.reason === reason && now - previous.at < 800) {
      return;
    }
    lastViolationRef.current = { reason, at: now };

    setLastViolation(reason);
    setViolationCount((prev) => {
      const next = prev + 1;
      violationsRef.current = next;

      if (reason.toLowerCase().includes("tab")) {
        trackCheating("tab-switch", reason);
      } else if (reason.toLowerCase().includes("fullscreen")) {
        trackCheating("fullscreen-exit", reason);
      } else if (reason.toLowerCase().includes("right click")) {
        trackCheating("right-click", reason);
      } else {
        trackCheating("copy-paste", reason);
      }

      if (next >= MAX_VIOLATIONS) {
        onSubmit(true, "violation-limit");
      }

      return next;
    });
  }, [onSubmit, submitting, trackCheating]);

  useEffect(() => {
    if (submitting || !exam) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setTimer((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [exam, submitting]);

  useEffect(() => {
    if (!exam || submitting || hasSubmittedRef.current) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      saveAnswers().catch(() => {
        // Ignore transient save failures; submit path remains authoritative.
      });
    }, 15000);

    return () => clearInterval(intervalId);
  }, [exam, saveAnswers, submitting]);

  useEffect(() => {
    if (timer === 0 && !submitting && !hasSubmittedRef.current) {
      onSubmit(true, "timer-ended");
    }
  }, [timer, submitting, onSubmit]);

  useEffect(() => {
    if (submitting) {
      return undefined;
    }

    const tryEnterFullscreen = async () => {
      if (document.fullscreenElement || fullscreenActivatedRef.current) {
        return;
      }

      try {
        await document.documentElement.requestFullscreen();
        fullscreenActivatedRef.current = true;
      } catch (error) {
        setLastViolation("Fullscreen permission denied. Click Enable Fullscreen.");
      }
    };

    tryEnterFullscreen();

    return undefined;
  }, [submitting]);

  useEffect(() => {
    if (submitting) {
      return undefined;
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        recordViolation("Tab switch detected");
      }
    };

    const onWindowBlur = () => {
      recordViolation("Tab switch detected");
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement && fullscreenActivatedRef.current) {
        recordViolation("Fullscreen exit detected");
      }
    };

    const blockAndRecord = (event, reason) => {
      event.preventDefault();
      recordViolation(reason);
    };

    const onContextMenu = (event) => blockAndRecord(event, "Right click blocked");
    const onCopy = (event) => blockAndRecord(event, "Copy blocked");
    const onPaste = (event) => blockAndRecord(event, "Paste blocked");
    const onCut = (event) => blockAndRecord(event, "Cut blocked");
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ["c", "v", "x"].includes(key)) {
        blockAndRecord(event, "Copy/paste keyboard shortcut blocked");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", onWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [recordViolation, submitting]);

  const enterFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        fullscreenActivatedRef.current = true;
      } catch (error) {
        setLastViolation("Fullscreen permission denied. Continue in secure mode.");
      }
    }
  };

  const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const seconds = String(timer % 60).padStart(2, "0");

  if (loading) {
    return <section className="glass-panel p-6 text-slate-300">Loading exam...</section>;
  }

  if (!exam) {
    return (
      <section className="glass-panel p-6">
        <p className="text-sm text-rose-200">{error || "Exam unavailable."}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <article className="glass-panel p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Take Exam</p>
        <h1 className="mt-2 text-2xl font-bold">{exam.title}</h1>
        <p className="mt-2 text-slate-300">Attempt all questions before submitting.</p>
      </article>

      {error && <p className="rounded-lg bg-rose-500/20 p-3 text-sm text-rose-200">{error}</p>}

      <article className="glass-panel flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm text-slate-300">Questions: <span className="font-semibold text-white">{totalQuestions}</span></p>
        <p className="text-sm text-slate-300">
          Time Left:{" "}
          <span className={`font-semibold ${timer <= 60 ? "text-rose-300" : "text-white"}`}>
            {minutes}:{seconds}
          </span>
        </p>
        <button type="button" className="ghost-btn" onClick={enterFullscreen}>
          Enable Fullscreen
        </button>
      </article>

      <article className="glass-panel p-4">
        <p className="text-sm text-slate-300">
          Violations: <span className={`font-semibold ${violationCount > 0 ? "text-rose-300" : "text-emerald-300"}`}>{violationCount}/{MAX_VIOLATIONS}</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Tab switch, fullscreen exit, right-click, and copy/paste actions are monitored.
        </p>
        {lastViolation && <p className="mt-2 text-xs text-rose-200">Last event: {lastViolation}</p>}
      </article>

      {exam.questions.map((question, index) => (
        <article className="glass-panel p-5" key={question._id}>
          <h3 className="text-lg font-semibold">
            Q{index + 1}. {question.questionText}
          </h3>

          <div className="mt-4 space-y-3">
            {question.options.map((option, optionIndex) => (
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2" key={`${question._id}-${option}`}>
                <input
                  type="radio"
                  name={question._id}
                  checked={String(answers[question._id]) === String(optionIndex)}
                  onChange={() => {
                    onSelectOption(question._id, optionIndex);
                    saveAnswers().catch(() => {
                      // Ignore per-click save failures to avoid blocking answer selection.
                    });
                  }}
                  disabled={submitting || timer === 0}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </article>
      ))}

      <button type="button" className="primary-btn w-full sm:w-auto" onClick={() => onSubmit(false, "manual")} disabled={submitting || timer === 0}>
        {submitting ? "Submitting..." : "Submit Exam"}
      </button>
    </section>
  );
}

export default ExamPage;

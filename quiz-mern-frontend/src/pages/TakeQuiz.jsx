// src/pages/TakeQuiz.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext"; // adjust path if needed

// small helper to make a short random id
const makeId = (n = 8) => {
  return Math.random().toString(36).slice(2, 2 + n);
};

export default function TakeQuiz() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {}; // expects AuthContext to provide user (id or _id)
  const userId = user?.id || user?._id || null;

  // create or reuse a browser client id (only used if userId not available)
  useEffect(() => {
    if (!localStorage.getItem("quiz_client_id")) {
      localStorage.setItem("quiz_client_id", makeId(12));
    }
  }, []);
  const clientId = localStorage.getItem("quiz_client_id");
  const ownerId = userId || clientId; // ownerId identifies this student/browser

  // keys in localStorage (per quiz + owner)
  const violationsKey = `quiz-violations:${quizId}:${ownerId}`;
  const endedKey = `quiz-ended:${quizId}:${ownerId}`;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [violations, setViolations] = useState(() => Number(localStorage.getItem(violationsKey) || 0));
  const [warningMessage, setWarningMessage] = useState("");
  const [quizEnded, setQuizEnded] = useState(() => localStorage.getItem(endedKey) === "true");
  const [submitting, setSubmitting] = useState(false);

  const submittedRef = useRef(false);
  const lastViolationTsRef = useRef(0);
  const COOLDOWN_MS = 700; // debounce blur+visibility events

  // fetch quiz
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/quiz/all");
        if (!mounted) return;
        const found = Array.isArray(res.data.quizzes) ? res.data.quizzes.find(q => q._id === quizId) : null;
        setQuiz(found || null);
      } catch (err) {
        console.error("Failed to load quiz:", err);
        setQuiz(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // helper to persist the violation and ended state
  useEffect(() => {
    localStorage.setItem(violationsKey, String(violations));
  }, [violations, violationsKey]);

  useEffect(() => {
    localStorage.setItem(endedKey, quizEnded ? "true" : "false");
  }, [quizEnded, endedKey]);

  // build payload for backend
  const buildAnswersArray = () => Object.entries(answers).map(([qIndex, optIndex]) => ({
    questionIndex: Number(qIndex),
    selectedOption: Number(optIndex)
  }));

  // manual submit (button)
  const handleManualSubmit = async () => {
    if (submittedRef.current || quizEnded || !quiz?._id) return;
    submittedRef.current = true;
    setSubmitting(true);
    setQuizEnded(true);
    localStorage.setItem(endedKey, "true");

    try {
      await axios.post("/quiz/submit", { quizId: quiz._id, answers: buildAnswersArray() });
      alert("✅ Quiz submitted (score hidden).");
      navigate("/quizzes");
    } catch (err) {
      console.error("Manual submit failed:", err);
      alert("Failed to submit. Please try again.");
      submittedRef.current = false;
      setSubmitting(false);
      setQuizEnded(false);
      localStorage.setItem(endedKey, "false");
    }
  };

  // auto-submit (3rd violation) — keeps best-effort using fetch keepalive/sendBeacon
  const autoSubmit = async () => {
    if (submittedRef.current || quizEnded || !quiz?._id) return;
    submittedRef.current = true;
    setSubmitting(true);
    setQuizEnded(true);
    localStorage.setItem(endedKey, "true");

    const payload = { quizId: quiz._id, answers: buildAnswersArray(), reason: "tab-switch-3" };
    const base = axios.defaults?.baseURL || "";
    const url = `${base}/quiz/submit`.replace(/\/\/+/g, "/").replace(":/", "://");

    try {
      // try fetch keepalive first
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
        keepalive: true
      });

      if (!resp.ok) {
        // fallback to sendBeacon best-effort
        try {
          const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
          navigator.sendBeacon(url, blob);
        } catch (e) {
          console.warn("sendBeacon fallback failed", e);
        }
      }
    } catch (err) {
      // network error -> try sendBeacon
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } catch (e) {
        console.warn("sendBeacon fallback failed", e);
      }
    } finally {
      // lock UI and redirect
      setTimeout(() => {
        alert("🚨 Quiz auto-submitted due to multiple tab switches.");
        navigate("/quizzes");
      }, 300);
    }
  };

  // tab switch / visibility handler with debounce
  useEffect(() => {
    if (quizEnded) return; // nothing to do if already ended

    const registerViolation = () => {
      const now = Date.now();
      if (now - lastViolationTsRef.current < COOLDOWN_MS) return;
      lastViolationTsRef.current = now;

      const newV = violations + 1;
      setViolations(newV);

      if (newV === 1) {
        setWarningMessage("⚠️ Warning 1: Don’t switch tabs. (This is a warning.)");
      } else if (newV === 2) {
        setWarningMessage("⚠️ Warning 2: Last warning! Next switch will auto-submit your quiz.");
      } else if (newV >= 3) {
        setWarningMessage("🚨 Auto-submitting due to multiple tab switches...");
        // lock UI immediately and auto-submit
        setQuizEnded(true);
        localStorage.setItem(endedKey, "true");
        setTimeout(autoSubmit, 50);
      }
    };

    const onVisibility = () => { if (document.hidden) registerViolation(); };
    const onBlur = () => { registerViolation(); };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [violations, quizEnded, quiz?._id]);

  // select option
  const selectOption = (qIndex, optIndex) => {
    if (quizEnded || submitting) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  if (loading) return <p>Loading quiz…</p>;
  if (!quiz) return <p>Quiz not found.</p>;

  if (quizEnded) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow text-center">
        <h2 className="text-xl font-bold mb-4">Quiz Ended</h2>
        <p>You cannot continue this quiz. It was submitted or locked.</p>
        <button onClick={() => navigate("/quizzes")} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Back to quizzes</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      {warningMessage && (
        <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500">
          {warningMessage}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">{quiz.title}</h2>

      {quiz.questions.map((q, i) => (
        <div key={i} className="mb-4">
          <p className="font-medium">{i + 1}. {q.question}</p>
          <div className="mt-2">
            {q.options.map((opt, j) => (
              <label key={j} className="block cursor-pointer mb-1">
                <input
                  type="radio"
                  name={`q-${i}`}
                  value={j}
                  checked={Number(answers[i]) === j}
                  onChange={() => selectOption(i, j)}
                  disabled={quizEnded || submitting}
                  className="mr-2"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-2">
        <button onClick={handleManualSubmit} disabled={submitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
          {submitting ? "Submitting..." : "Submit"}
        </button>
        <button onClick={() => setAnswers({})} disabled={submitting} className="px-4 py-2 bg-gray-200 rounded">Reset</button>
      </div>
    </div>
  );
}

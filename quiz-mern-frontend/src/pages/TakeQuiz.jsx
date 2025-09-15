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

  // keys for localStorage
const startTimeKey = `quiz-start-time:${quizId}:${ownerId}`;

  // Add state for timer
const [timeLeft, setTimeLeft] = useState(null);

const handleManualSubmit = async () => {
  if (submittedRef.current || !quiz?._id) return; // removed quizEnded check
  submittedRef.current = true;
  setSubmitting(true);
  setQuizEnded(true); // lock the UI
  localStorage.setItem(endedKey, "true");

  try {
    const payload = { quizId: quiz._id, answers: buildAnswersArray() };
    const res = await axios.post("/quiz/submit", payload);
    alert("✅ Quiz submitted (score hidden).");
    navigate("/quizzes");
  } catch (err) {
    console.error("Manual submit failed:", err.response || err);
    alert("Failed to submit. Please try again.");
    submittedRef.current = false;
    setSubmitting(false);
    setQuizEnded(false);
    localStorage.setItem(endedKey, "false");
  }
};

// After quiz is loaded, calculate time left based on startTime
useEffect(() => {
  if (!quiz || !quiz.timeLimit || quizEnded) return;

  let startTime = localStorage.getItem(startTimeKey);

  if (!startTime) {
    // first time starting this quiz → set start time
    startTime = Date.now();
    localStorage.setItem(startTimeKey, String(startTime));
  } else {
    startTime = Number(startTime);
  }

  const endTime = startTime + quiz.timeLimit * 60 * 1000;
  const initialLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
  setTimeLeft(initialLeft);
}, [quiz, quizEnded]);

// Countdown effect
useEffect(() => {
  if (timeLeft === null || quizEnded) return;
  if (timeLeft <= 0) {
    // time over -> auto submit
    autoSubmit();
    return;
  }

 const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        autoSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft, quizEnded]);

// Format time for display
const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};


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
        setWarningMessage("🚨 Auto-submitting due to Time over or Multiple tab switches ...");
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

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleNext = () => {
    if (currentQuestion < quiz?.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (!quiz) return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-lg text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01" />
      </svg>
      <p className="text-xl text-gray-600">Quiz not found</p>
    </div>
  );

  if (quizEnded) {
    return (
      <div className="max-w-xl mx-auto mt-8 bg-white p-8 rounded-lg shadow-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Quiz Ended</h2>
        <p className="text-gray-600 mb-6">You cannot continue this quiz. It was submitted or locked.</p>
        <button 
          onClick={() => navigate("/quizzes")} 
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
        >
          Back to quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {warningMessage && (
            <div className="p-3 sm:p-4 bg-yellow-50 border-b border-yellow-100">
              <div className="flex items-start sm:items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-yellow-800 text-sm sm:text-base">{warningMessage}</span>
              </div>
            </div>
          )}
          
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
    {quiz.title}
  </h2>
  
  <div className="flex flex-col items-end gap-2">
    <span className="px-3 sm:px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium whitespace-nowrap">
      Question {currentQuestion + 1} of {quiz.questions.length}
    </span>

    {quiz.timeLimit && (
      <span className={`px-3 py-1 rounded-full text-sm font-medium 
        ${timeLeft <= 30 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
        ⏳ {formatTime(timeLeft)}
      </span>
    )}
  </div>
</div>

            <div className="mb-6 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="bg-white rounded-lg p-4 sm:p-6">
              <p className="text-base sm:text-lg font-medium text-gray-800 mb-6">
                {currentQuestion + 1}. {quiz.questions[currentQuestion].question}
              </p>

              <div className="space-y-3">
                {quiz.questions[currentQuestion].options.map((opt, j) => (
                  <label 
                    key={j} 
                    className={`block cursor-pointer p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-sm
                      ${Number(answers[currentQuestion]) === j 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-200'}`}
                  >
                    <div className="flex items-center min-h-[44px]">
                      <input
                        type="radio"
                        name={`q-${currentQuestion}`}
                        value={j}
                        checked={Number(answers[currentQuestion]) === j}
                        onChange={() => selectOption(currentQuestion, j)}
                        disabled={quizEnded || submitting}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0
                        ${Number(answers[currentQuestion]) === j 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'}`}
                      >
                        {Number(answers[currentQuestion]) === j && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className={`${Number(answers[currentQuestion]) === j ? 'text-blue-900' : 'text-gray-700'} text-sm sm:text-base`}>
                        {opt}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex gap-2 sm:gap-3 order-1 sm:order-none">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestion === 0 || submitting}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-sm sm:text-base
                    ${currentQuestion === 0
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestion === quiz.questions.length - 1 || submitting}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-sm sm:text-base
                    ${currentQuestion === quiz.questions.length - 1
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'}`}
                >
                  <span>Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button 
                  onClick={() => setAnswers({})} 
                  disabled={submitting || Object.keys(answers).length === 0} 
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  Reset
                </button>
                <button 
                  onClick={handleManualSubmit} 
                  disabled={submitting} 
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg disabled:opacity-60 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Quiz</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

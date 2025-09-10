
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

function TakeQuiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all quizzes and select the one with matching id
    axios.get("/quiz/all").then(res => {
      const found = res.data.quizzes.find(q => q._id === id);
      setQuiz(found || null);
      setLoading(false);
    });
  }, [id]);

  const submitQuiz = async () => {
    // Convert answers object to array as expected by backend
    const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
      questionIndex: Number(questionIndex),
      selectedOption: Number(selectedOption)
    }));
    await axios.post("/quiz/submit", { quizId: quiz._id, answers: formattedAnswers });
    alert("Quiz submitted! ✅ (Score not shown)");
    navigate("/quizzes");
  };

  if (loading) return <p>Loading...</p>;
  if (!quiz) return <p>Quiz not found.</p>;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">{quiz.title}</h2>
      {quiz.questions.map((q, i) => (
        <div key={i} className="mb-4">
          <p>{q.question}</p>
          {q.options.map((opt, j) => (
            <label key={j} className="block">
              <input type="radio" name={`q${i}`} value={j}
                checked={answers[i] === j}
                onChange={() => setAnswers({ ...answers, [i]: j })} />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={submitQuiz} className="w-full bg-blue-500 text-white py-2 rounded">Submit</button>
    </div>
  );
}

export default TakeQuiz;

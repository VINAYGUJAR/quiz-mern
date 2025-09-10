import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  useEffect(() => {
    axios.get("/quiz/all").then(res => setQuizzes(res.data.quizzes || []));
  }, []);
  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Available Quizzes</h2>
      <ul>
        {quizzes.length === 0 && <li>No quizzes available.</li>}
        {quizzes.map(q => (
          <li key={q._id} className="mb-2">
            <Link to={`/quiz/${q._id}`} className="text-blue-600 underline">{q.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

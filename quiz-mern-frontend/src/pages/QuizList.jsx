import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get("/quiz/all")
      .then(res => setQuizzes(res.data.quizzes || []))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl p-8 border border-indigo-100">
          <div className="flex items-center mb-8 space-x-4">
            <div className="p-3 bg-indigo-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Available Quizzes</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01" />
              </svg>
              <p className="text-gray-500 text-lg">No quizzes available at the moment.</p>
              <p className="text-gray-400 mt-2">Check back later for new quizzes!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {quizzes.map(quiz => (
                <Link
                  key={quiz._id}
                  to={`/quiz/${quiz._id}`}
                  className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-indigo-200 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {quiz.title}
                    </h3>
                    <div className="p-2 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Click to start this quiz and test your knowledge!
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

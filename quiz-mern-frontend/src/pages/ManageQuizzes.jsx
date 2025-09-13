
import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }] });
  const [editId, setEditId] = useState(null);

  const fetchQuizzes = () => {
    axios.get("/quiz/all-admin").then(res => setQuizzes(res.data.quizzes || []));
  };
  useEffect(fetchQuizzes, []);

  const handleFormChange = (e, idx, optIdx) => {
    if (typeof idx === "number") {
      // Deep copy questions and options, always ensure correctAnswer is a number
      const updatedQuestions = form.questions.map((q, i) => ({
        ...q,
        options: [...q.options],
        correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : Number(q.correctAnswer)
      }));
      if (typeof optIdx === "number") {
        updatedQuestions[idx].options[optIdx] = e.target.value;
      } else if (e.target.name === "correctAnswer") {
        updatedQuestions[idx].correctAnswer = Number(e.target.value);
      } else {
        updatedQuestions[idx][e.target.name] = e.target.value;
      }
      setForm({ ...form, questions: updatedQuestions });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const addQuestion = () => {
    setForm({ ...form, questions: [...form.questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }] });
  };

  const removeQuestion = (idx) => {
    setForm({ ...form, questions: form.questions.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`/quiz/update/${editId}`, form);
    } else {
      await axios.post("/quiz/create", form);
    }
    setShowForm(false);
    setForm({ title: "", questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }] });
    setEditId(null);
    fetchQuizzes();
  };

  const handleEdit = (quiz) => {
    setForm({
      title: quiz.title,
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : Number(q.correctAnswer)
      }))
    });
    setEditId(quiz._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/quiz/delete/${id}`);
      setQuizzes(quizzes.filter(q => q._id !== id));
    } catch (err) {
      alert('Failed to delete quiz');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 md:p-8 rounded-xl shadow-xl min-h-screen sm:min-h-0">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 text-indigo-900 border-b border-indigo-100 pb-4 text-center">
        Manage Quizzes
      </h1>
      <button 
        className={`mb-4 sm:mb-6 md:mb-8 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg transition-all duration-300 font-semibold w-full
          ${showForm 
            ? 'bg-gradient-to-r from-rose-100 to-rose-200 text-rose-700 hover:from-rose-200 hover:to-rose-300 shadow-inner' 
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
          } transform hover:scale-[1.02] text-sm sm:text-base`} 
        onClick={() => { 
          setShowForm(!showForm); 
          setEditId(null); 
          setForm({ title: "", questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }] }); 
        }}
      >
        {showForm ? "← Cancel" : "✨ Create New Quiz"}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 sm:mb-6 md:mb-8 space-y-4 sm:space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-indigo-100 shadow-lg">
          <input 
            className="w-full border-2 border-indigo-100 p-3 sm:p-4 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-base sm:text-lg" 
            name="title" 
            placeholder="Enter Quiz Title..." 
            value={form.title} 
            onChange={handleFormChange} 
            required 
          />
          {form.questions.map((q, idx) => (
            <div key={idx} className="bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-100 p-4 sm:p-6 rounded-xl mb-4 shadow-md hover:shadow-lg transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-indigo-900">Question {idx + 1}</h3>
                {form.questions.length > 1 && (
                  <button 
                    type="button" 
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all font-medium text-sm flex items-center justify-center sm:justify-start gap-2" 
                    onClick={() => removeQuestion(idx)}
                  >
                    <span>Remove Question</span> 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              <input 
                className="w-full border-2 border-indigo-100 p-3 sm:p-4 rounded-lg mb-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none bg-white" 
                name="question" 
                placeholder={`Enter question ${idx + 1}...`} 
                value={q.question} 
                onChange={e => handleFormChange(e, idx)} 
                required 
              />
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex flex-col sm:flex-row items-start sm:items-center mb-3 gap-2 sm:gap-4">
                  <span className="text-sm font-semibold text-indigo-600 w-full sm:w-24">Option {optIdx + 1}</span>
                  <input 
                    className="w-full flex-1 border-2 border-indigo-100 p-2 sm:p-3 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none bg-white" 
                    placeholder={`Enter option ${optIdx + 1}...`} 
                    value={opt} 
                    onChange={e => handleFormChange(e, idx, optIdx)} 
                    required 
                  />
                </div>
              ))}
              <label className="block mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center bg-indigo-50 p-3 sm:p-4 rounded-lg gap-2 sm:gap-4">
                <span className="text-sm font-semibold text-indigo-700">Correct Answer:</span>
                <select
                  className="w-full sm:w-auto border-2 border-indigo-200 p-2 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none bg-white text-indigo-700 font-medium"
                  value={typeof q.correctAnswer === 'number' ? q.correctAnswer : Number(q.correctAnswer)}
                  onChange={e => handleFormChange({ target: { name: "correctAnswer", value: e.target.value } }, idx)}
                >
                  {q.options.map((_, i) => (
                    <option key={i} value={i}>{`Option ${i + 1}`}</option>
                  ))}
                </select>
              </label>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
            <button 
              type="button" 
              className="flex-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 px-4 sm:px-6 py-3 rounded-lg border-2 border-indigo-200 hover:border-indigo-300 transition-all font-semibold flex items-center justify-center gap-2" 
              onClick={addQuestion}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Add Question
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {editId ? "✓ Update Quiz" : "✨ Create Quiz"}
            </button>
          </div>
        </form>
      )}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-indigo-100 shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-indigo-900 border-b border-indigo-100 pb-4">All Quizzes</h2>
        <ul className="divide-y divide-indigo-100">
          {quizzes.length === 0 && (
            <li className="py-6 sm:py-8 text-center text-gray-500 italic">No quizzes found. Create your first quiz!</li>
          )}
          {quizzes.map(q => (
            <li key={q._id} className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-indigo-50 rounded-lg transition-all px-3 sm:px-4">
              <span className="font-semibold text-base sm:text-lg text-indigo-900">{q.title}</span>
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all font-medium flex items-center justify-center gap-2" 
                  onClick={() => handleEdit(q)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
                <button 
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all font-medium flex items-center justify-center gap-2" 
                  onClick={() => handleDelete(q._id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

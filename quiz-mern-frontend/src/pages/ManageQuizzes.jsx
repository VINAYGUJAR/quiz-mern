
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
      // Question or option change
      const updated = { ...form };
      if (typeof optIdx === "number") {
        updated.questions[idx].options[optIdx] = e.target.value;
      } else {
        updated.questions[idx][e.target.name] = e.target.value;
      }
      setForm(updated);
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
        correctAnswer: q.correctAnswer
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
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Manage Quizzes</h1>
      <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: "", questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }] }); }}>
        {showForm ? "Cancel" : "Add Quiz"}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input className="w-full border p-2 rounded" name="title" placeholder="Quiz Title" value={form.title} onChange={handleFormChange} required />
          {form.questions.map((q, idx) => (
            <div key={idx} className="border p-2 rounded mb-2">
              <input className="w-full border p-2 rounded mb-2" name="question" placeholder={`Question ${idx + 1}`} value={q.question} onChange={e => handleFormChange(e, idx)} required />
              {q.options.map((opt, optIdx) => (
                <input key={optIdx} className="w-full border p-2 rounded mb-1" placeholder={`Option ${optIdx + 1}`} value={opt} onChange={e => handleFormChange(e, idx, optIdx)} required />
              ))}
              <label className="block mt-2">Correct Answer:
                <select className="ml-2 border p-1 rounded" value={q.correctAnswer} onChange={e => handleFormChange({ target: { name: "correctAnswer", value: Number(e.target.value) } }, idx)}>
                  {q.options.map((_, i) => <option key={i} value={i}>{`Option ${i + 1}`}</option>)}
                </select>
              </label>
              {form.questions.length > 1 && <button type="button" className="text-red-600 mt-2" onClick={() => removeQuestion(idx)}>Remove Question</button>}
            </div>
          ))}
          <button type="button" className="bg-gray-300 px-2 py-1 rounded" onClick={addQuestion}>Add Question</button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded ml-2">{editId ? "Update Quiz" : "Create Quiz"}</button>
        </form>
      )}
      <h2 className="text-lg font-bold mb-2">All Quizzes</h2>
      <ul>
        {quizzes.length === 0 && <li>No quizzes found.</li>}
        {quizzes.map(q => (
          <li key={q._id} className="mb-2 border-b pb-2">
            <span className="font-semibold">{q.title}</span>
            <button className="ml-2 text-blue-600 underline" onClick={() => handleEdit(q)}>Edit</button>
            <button className="ml-2 text-red-600 underline" onClick={() => handleDelete(q._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

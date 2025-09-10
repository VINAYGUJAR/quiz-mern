
import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Results() {
  const [results, setResults] = useState([]);
  useEffect(() => {
    axios.get("/quiz/results").then(res => setResults(res.data.results || []));
  }, []);
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Student Results</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Student</th>
            <th className="p-2 border">Quiz</th>
            <th className="p-2 border">Score</th>
            <th className="p-2 border">Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 && <tr><td colSpan={4} className="text-center p-2">No results found.</td></tr>}
          {results.map(r => (
            <tr key={r._id}>
              <td className="p-2 border">{r.userId?.username} <br /><span className="text-xs">{r.userId?.email}</span></td>
              <td className="p-2 border">{r.quizId?.title}</td>
              <td className="p-2 border">{r.score}</td>
              <td className="p-2 border">{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

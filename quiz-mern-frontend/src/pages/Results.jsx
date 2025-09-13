
import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Results() {
  const [results, setResults] = useState([]);
  useEffect(() => {
    axios.get("/quiz/results").then(res => setResults(res.data.results || []));
  }, []);
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="bg-gradient-to-br from-rose-50 via-white to-sky-50 p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-sky-100">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-sky-100 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-sky-900 mb-2">Student Results</h1>
            <p className="text-sky-600 text-sm sm:text-base">Overview of all quiz performances</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-sky-100 w-full sm:w-auto">
            <p className="text-sm text-sky-600 font-medium">Total Results</p>
            <p className="text-xl sm:text-2xl font-bold text-sky-900">{results.length}</p>
          </div>
        </div>
        
        {/* Mobile View */}
        <div className="sm:hidden">
          {results.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center justify-center text-sky-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm text-sky-400">Results will appear here once students complete quizzes</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map(r => (
                <div key={r._id} className="bg-white rounded-lg border border-sky-100 p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-100 to-rose-100 flex items-center justify-center text-sky-700 font-semibold text-lg shrink-0">
                      {r.userId?.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sky-900 truncate">{r.userId?.username}</div>
                      <div className="text-sm text-sky-500 truncate">{r.userId?.email}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-sky-600 mb-1">Quiz</div>
                      <div className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full text-sm font-medium truncate">
                        {r.quizId?.title}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-sky-600 mb-1">Submitted</div>
                      <div className="text-sky-900 text-sm">
                        {new Date(r.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                        <div className="text-sky-500 text-xs">
                          {new Date(r.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-sky-600 mb-2">Score</div>
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm
                        ${Number(r.score) >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                          Number(r.score) >= 60 ? 'bg-sky-100 text-sky-700' : 
                          'bg-rose-100 text-rose-700'}`}>
                        {r.score}
                      </div>
                      <div className="flex-1 h-2 rounded-full bg-gray-100">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            Number(r.score) >= 80 ? 'bg-emerald-500' : 
                            Number(r.score) >= 60 ? 'bg-sky-500' : 
                            'bg-rose-500'
                          }`}
                          style={{ width: `${r.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-sky-50 to-rose-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sky-900">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sky-900">Quiz</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sky-900">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sky-900">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100">
                {results.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-sky-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No results found</p>
                        <p className="text-sm text-sky-400">Results will appear here once students complete quizzes</p>
                      </div>
                    </td>
                  </tr>
                )}
                {results.map(r => (
                  <tr key={r._id} className="hover:bg-sky-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-100 to-rose-100 flex items-center justify-center text-sky-700 font-semibold text-lg mr-3">
                          {r.userId?.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sky-900">{r.userId?.username}</div>
                          <div className="text-sm text-sky-500">{r.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-50 text-sky-700">
                        {r.quizId?.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm mr-2 
                          ${Number(r.score) >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                            Number(r.score) >= 60 ? 'bg-sky-100 text-sky-700' : 
                            'bg-rose-100 text-rose-700'}`}>
                          {r.score}
                        </div>
                        <div className="w-24 h-2 rounded-full bg-gray-100">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              Number(r.score) >= 80 ? 'bg-emerald-500' : 
                              Number(r.score) >= 60 ? 'bg-sky-500' : 
                              'bg-rose-500'
                            }`}
                            style={{ width: `${r.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sky-600">
                        {new Date(r.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        <div className="text-sm text-sky-400">
                          {new Date(r.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

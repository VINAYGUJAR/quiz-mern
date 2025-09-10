
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import QuizList from "./pages/QuizList";
import TakeQuiz from "./pages/TakeQuiz";
import AdminDashboard from "./pages/AdminDashboard";
import ManageQuizzes from "./pages/ManageQuizzes";
import Results from "./pages/Results";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Student */}
          <Route element={<ProtectedRoute role="student" />}>
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/quiz/:id" element={<TakeQuiz />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/quizzes" element={<ManageQuizzes />} />
            <Route path="/admin/results" element={<Results />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;

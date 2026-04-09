import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SidebarLayout from "./components/SidebarLayout";
import AddQuestionsPage from "./pages/AddQuestionsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CreateExamPage from "./pages/CreateExamPage";
import ExamPage from "./pages/ExamPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResultPage from "./pages/ResultPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import ViewResultsPage from "./pages/ViewResultsPage";
import ViewStudentsPage from "./pages/ViewStudentsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<StudentDashboardPage />} />
          <Route path="/student-dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/take-exam" element={<ExamPage />} />
          <Route path="/exam" element={<Navigate to="/take-exam" replace />} />
          <Route path="/result" element={<ResultPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<SidebarLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/create-exam" element={<CreateExamPage />} />
          <Route path="/add-questions" element={<AddQuestionsPage />} />
          <Route path="/view-students" element={<ViewStudentsPage />} />
          <Route path="/view-results" element={<ViewResultsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

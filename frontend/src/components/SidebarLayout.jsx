import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

function SidebarLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [firstExamId, setFirstExamId] = useState("");

  useEffect(() => {
    const loadFirstExam = async () => {
      if (user?.role !== "student") {
        return;
      }

      try {
        const response = await api.get("/exams");
        const exams = response.data || [];
        setFirstExamId(exams[0]?._id || "");
      } catch (error) {
        setFirstExamId("");
      }
    };

    loadFirstExam();
  }, [user?.role]);

  const navItems = [
    {
      label: "Dashboard",
      to: "/dashboard",
      visible: user?.role === "student",
    },
    {
      label: "Take Exam",
      to: firstExamId ? `/take-exam?examId=${firstExamId}` : "/take-exam",
      visible: user?.role === "student",
    },
    {
      label: "Result",
      to: "/result",
      visible: user?.role === "student",
    },
    {
      label: "Admin Dashboard",
      to: "/admin-dashboard",
      visible: user?.role === "admin",
    },
    {
      label: "Create Exam",
      to: "/create-exam",
      visible: user?.role === "admin",
    },
    {
      label: "Add Questions",
      to: "/add-questions",
      visible: user?.role === "admin",
    },
    {
      label: "View Students",
      to: "/view-students",
      visible: user?.role === "admin",
    },
    {
      label: "View Results",
      to: "/view-results",
      visible: user?.role === "admin",
    },
  ];

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-white/10 bg-slate-900/70 px-5 py-6 backdrop-blur-xl">
          <Link to="/" className="text-lg font-bold tracking-wide text-cyan-300">
            SecureExam
          </Link>

          <div className="mt-8 space-y-2">
            {navItems
              .filter((item) => item.visible)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-brand-600/20 text-white"
                        : "text-slate-300 hover:bg-white/10"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
          </div>

          <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-slate-400">Signed in as</p>
            <p className="mt-1 font-semibold text-white">{user?.name}</p>
            <p className="text-xs uppercase tracking-wide text-cyan-300">{user?.role}</p>
          </div>

          <button type="button" onClick={onLogout} className="ghost-btn mt-4 w-full">
            Logout
          </button>
        </aside>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SidebarLayout;

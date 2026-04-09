import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = user?.role === "admin" ? "/admin-dashboard" : "/dashboard";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <p className="text-xl font-bold tracking-wide text-cyan-300">SecureExam</p>
          <nav className="space-x-2">
            <Link to="/login" className="ghost-btn inline-block">Login</Link>
            <Link to="/register" className="primary-btn inline-block">Register</Link>
          </nav>
        </header>

        <section className="my-auto grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
              Secure Online Examination
            </p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Fast, modern, and reliable exam platform for students and admins.
            </h1>
            <p className="mt-4 max-w-xl text-slate-300">
              Conduct role-based online exams with a clean dashboard layout, timed assessments, and instant result insights.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link to={dashboardPath} className="primary-btn inline-block">
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="primary-btn inline-block">Get Started</Link>
                  <Link to="/register" className="ghost-btn inline-block">Create Account</Link>
                </>
              )}
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Role Based", "Student and admin flows"],
                ["Responsive UI", "Optimized for all screens"],
                ["Exam Ready", "Timed exam interface"],
                ["Result Insights", "Immediate result summary"],
              ].map(([title, desc]) => (
                <article key={title} className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;

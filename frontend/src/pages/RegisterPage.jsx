import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(form);
      navigate("/dashboard");
    } catch (apiError) {
      setError(apiError.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 p-4">
      <div className="glass-panel w-full max-w-md p-6 sm:p-8">
        <h1 className="text-3xl font-bold">Register</h1>
        <p className="mt-2 text-sm text-slate-400">Create your account to start exams.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Full Name</label>
            <input className="input-field" name="name" value={form.name} onChange={onChange} required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <input className="input-field" name="email" type="email" value={form.email} onChange={onChange} required />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Password</label>
            <input className="input-field" name="password" type="password" value={form.password} onChange={onChange} minLength={6} required />
          </div>

          {error && <p className="rounded-lg bg-rose-500/20 p-2 text-sm text-rose-200">{error}</p>}

          <button type="submit" className="primary-btn w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-400">
          Already registered? <Link to="/login" className="text-cyan-300 underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;


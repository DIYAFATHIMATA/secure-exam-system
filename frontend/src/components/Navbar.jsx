import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        SecureExam
      </Link>

      <nav className="nav-links">
        {!isAuthenticated && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {isAuthenticated && (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/results">Results</Link>
            {user?.role === "admin" && <Link to="/admin">Admin Panel</Link>}
            <button className="ghost-btn" type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;

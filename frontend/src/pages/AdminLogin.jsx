
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://cafe-haven.onrender.com/api/accounts/";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getCSRFToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Get CSRF cookie
      await fetch(`${API_URL}csrf/`, {
        credentials: "include",
      });

      const response = await fetch(`${API_URL}admin-login/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken() || "",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Admin login failed.");
      }

      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleLogin}>
        <h1>Cafe Haven</h1>
        <h2>Admin Login</h2>

        <p>Sign in to manage customer bookings.</p>

        {error && <p className="admin-login-error">{error}</p>}

        <label>Username</label>
        <input
          type="text"
          placeholder="Enter admin username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login as Admin"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;

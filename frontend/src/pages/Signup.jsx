import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "https://cafe-haven.onrender.com/api";

function getCookie(name) {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");

    if (key === name) {
      return value.join("=");
    }
  }

  return null;
}

async function getCsrfToken() {
  const response = await fetch(`${API_URL}/accounts/csrf/`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to obtain a CSRF token. Please try again.");
  }

  const token = getCookie("csrftoken");

  if (!token) {
    throw new Error("CSRF token not found. Please refresh and try again.");
  }

  return token;
}

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setMessage("");
    setLoading(true);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(`${API_URL}/accounts/signup/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Signup failed. Please check your details.");
        return;
      }

      setMessage("Account created successfully! You can now log in.");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(
        error.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="booking-page">
      <section className="booking-header">
        <p className="section-label">JOIN CAFE HAVEN</p>
        <h1>Create Your Account</h1>
        <p>Sign up to get started with your reservations.</p>
      </section>

      <section className="booking-form-section">
        <form className="booking-form" onSubmit={handleSubmit}>
          <label htmlFor="signup-username">Username</label>
          <input
            id="signup-username"
            type="text"
            autoComplete="username"
            maxLength={150}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {message && <p role="status">{message}</p>}

          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Signup;
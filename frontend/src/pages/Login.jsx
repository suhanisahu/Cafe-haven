
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000/api";

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
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to obtain a CSRF token.");
  }

  const token = getCookie("csrftoken");

  if (!token) {
    throw new Error("CSRF token not found. Please refresh and try again.");
  }

  return token;
}
async function readApiResponse(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    console.error("Unexpected API response:", {
      status: response.status,
      url: response.url,
      response: text.slice(0, 500),
    });

    throw new Error(
      `Server returned HTML or invalid JSON. Status: ${response.status}. Check the browser console.`
    );
  }
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/accounts/me/`, {
        credentials: "include",
      });

      const data = await readApiResponse(response);

      if (response.ok && data.authenticated) {
        setCustomer(data);
      } else {
        setCustomer(null);
      }
    } catch {
      setMessage("Unable to check login status.");
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(`${API_URL}/accounts/login/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Login failed.");
        return;
      }

      await checkLoginStatus();
      setMessage(`Login successful! Welcome, ${data.username}.`);
      setPassword("");
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setMessage("");

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(`${API_URL}/accounts/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Logout failed.");
        return;
      }

      setCustomer(null);
      setUsername("");
      setPassword("");
      setMessage(data.message || "Logout successful.");
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
    }
  };

  return (
    <main className="booking-page">
      <section className="booking-header">
        <p className="section-label">WELCOME BACK</p>
        <h1>Customer Login</h1>
        <p>Sign in to your Cafe Haven account.</p>
      </section>

      <section className="booking-form-section">
        <form className="booking-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          {customer && (
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          )}

          {checkingSession && <p>Checking login status...</p>}

          {message && <p role="status">{message}</p>}

          {customer && (
            <div className="customer-details">
              <h2>My Account</h2>
              <p>Username: {customer.username}</p>
              <p>Email: {customer.email}</p>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}

export default Login;

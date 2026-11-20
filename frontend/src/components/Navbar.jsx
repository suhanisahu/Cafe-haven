
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Coffee, ArrowUpRight } from "lucide-react";

const API_URL = "https://cafe-haven.onrender.com/api";

function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/accounts/me/`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setUser(data.authenticated ? data : null);
      })
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/accounts/csrf/`, {
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

      const response = await fetch(`${API_URL}/accounts/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
      });

      if (response.ok) {
        setUser(null);
        setMenuOpen(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="modern-navbar">
      <Link to="/" className="modern-logo" onClick={closeMenu}>
        <span className="modern-logo-icon">
          <Coffee size={21} />
        </span>
        <span>
          Cafe Haven
          <small>FOOD · MOMENTS · MEMORIES</small>
        </span>
      </Link>

      <button
        className="modern-menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`modern-nav-links ${menuOpen ? "active" : ""}`}>
        <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
        <NavLink to="/menu" onClick={closeMenu}>Menu</NavLink>
        <NavLink to="/experiences" onClick={closeMenu}>Experiences</NavLink>
        <NavLink to="/booking" onClick={closeMenu}>Book a Table</NavLink>

        {user ? (
          <>
            <NavLink to="/my-bookings" onClick={closeMenu}>
              My Bookings
            </NavLink>
            <button className="modern-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="modern-login"
            onClick={closeMenu}
          >
            Login <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

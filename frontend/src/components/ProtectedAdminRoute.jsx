import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function ProtectedAdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch(
         "https://cafe-haven.onrender.com/api/accounts/me/",
          { credentials: "include" }
        );

        const data = await response.json();

        setIsAdmin(
          response.ok && data.authenticated && data.is_staff
        );
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  if (isAdmin === null) {
    return <p>Checking admin access...</p>;
  }

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
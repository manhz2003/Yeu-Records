import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { toast } from "react-toastify";
import { useEffect, useRef, useState, useContext } from "react";

const ProtectedRoute = ({ children, roles }) => {
  const { user, isUserLoading } = useContext(AuthContext);
  const [navigateToLogin, setNavigateToLogin] = useState(false);
  const toastDisplayed = useRef(false);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      setNavigateToLogin(true);
    } else {
      const userRoles = user.roles.map((role) => role.name);
      const hasRequiredRole = roles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        if (!toastDisplayed.current) {
          toast.error("You do not have permission to access this page.");
          toastDisplayed.current = true;
        }
        setNavigateToLogin(true);
      } else {
        if (toastDisplayed.current) {
          toast.dismiss();
        }
        toastDisplayed.current = false;
        setNavigateToLogin(false);
      }
    }
  }, [user, roles, isUserLoading]);

  if (isUserLoading) {
    return null;
  }

  if (navigateToLogin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

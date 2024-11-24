import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/FakeAuthContext";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  const Navigate = useNavigate();

  useEffect(
    function () {
      if (!isAuthenticated) Navigate("/");
    },
    [isAuthenticated, Navigate]
  );

  return isAuthenticated ? children : null;
}

export default ProtectedRoute;

import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const PrivateRoute = ({ redirectTo = "/login" }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuth(!!token);
  }, []);

  if (isAuth === null) return null; // ← VERY IMPORTANT!

  return isAuth ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default PrivateRoute;
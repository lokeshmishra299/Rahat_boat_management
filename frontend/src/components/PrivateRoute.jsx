import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ isAuthenticated, redirectTo = "/login" }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default PrivateRoute;

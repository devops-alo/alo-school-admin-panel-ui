import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../component/loader/Loader";
import { hasRouteAccess } from "../sections/utils/permissions";

export default function PrivateRoute({ isAuthenticated, loading }) {
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loader />
      </div>
    );
  }

  // Redirect unauthenticated users to login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect authenticated users without permission.
  if (!hasRouteAccess(location.pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

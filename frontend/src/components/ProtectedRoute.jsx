import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="center h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-darker-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-brown/50">載入中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // 保存當前路徑，登入後可以導回原本的頁面
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;

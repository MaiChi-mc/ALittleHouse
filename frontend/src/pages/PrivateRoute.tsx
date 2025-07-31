import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Kiểm tra nếu người dùng có quyền truy cập vào route (chỉ admin mới được vào)
const isAuthorized = (role: string) => {
  const token = localStorage.getItem('token');
  if (token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    return decodedToken?.role === role;
  }
  return false;
};

interface PrivateRouteProps {
  allowedRole: string;  // Quyền truy cập (admin)
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRole }) => {
  if (!isAuthorized(allowedRole)) {
    // Nếu không phải admin hoặc không có quyền, điều hướng đến login
    return <Navigate to="/login" replace />;
  }

  // Nếu có quyền truy cập, render các route con (Outlet)
  return <Outlet />;
};

export default PrivateRoute;

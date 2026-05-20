import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 1. Agar token nahi hai, toh login par bhej do
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Agar role match nahi karta, toh login par bhej do (ya unauthorized page par)
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  // 3. Agar sab theek hai, toh dashboard dikhao
  return children;
};

export default ProtectedRoute;
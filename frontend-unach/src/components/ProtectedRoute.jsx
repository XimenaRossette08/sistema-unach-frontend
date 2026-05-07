import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/" />;
  }

  // Comparamos el rol (convertimos a minúsculas para evitar errores)
  if (allowedRole && role?.toLowerCase() !== allowedRole?.toLowerCase()) {
    return <Navigate to="/" />;
  }

  return children;
};
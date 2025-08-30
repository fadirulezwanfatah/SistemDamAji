import React from 'react';
import { useAuthStore } from '../hooks/useAuthStore';
import LoginForm from './LoginForm';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ManagerRoute({ children }) {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has ONLY manager role (not admin)
    const isManager = user?.roles?.some(role => role.name === 'manager') ||
        user?.role === 'manager';

    if (!isManager) {
        return <Navigate to="/" replace />;
    }

    return children;
}

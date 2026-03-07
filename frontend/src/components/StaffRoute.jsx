import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StaffRoute({ children }) {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has staff role
    const isStaff = user?.role === 'staff';

    if (!isStaff) {
        return <Navigate to="/" replace />;
    }

    return children;
}

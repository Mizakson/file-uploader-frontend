import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const ProtectedRoute = () => {
    const { user, loading } = useAuth()

    if (loading) {
        return <div>Loading user session...</div>
    }

    if (user) {
        return <Outlet />
    }

    return <Navigate to="/login" replace />
}

export default ProtectedRoute
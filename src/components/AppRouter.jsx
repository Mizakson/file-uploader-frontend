import React from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import Homepage from '../pages/Homepage.jsx'
import Profile from '../pages/Profile.jsx'

const AppRouter = () => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                Checking User Session...
            </div>
        )
    }

    if (user) {
        console.log("Authenticated User: ", user)
        return <Profile />
    }

    return <Homepage />
}

export default AppRouter
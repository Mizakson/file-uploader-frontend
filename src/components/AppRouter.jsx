import React from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import Homepage from '../pages/Homepage.jsx'
import Profile from '../pages/Profile.jsx'

const AppRouter = () => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className='loading-container'>
                <p className="loading-text">Checking session...</p>
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
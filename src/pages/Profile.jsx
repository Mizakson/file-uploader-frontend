import React, { createContext, useContext, useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function Profile() {

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const { logout } = useAuth()


    const handleLogout = (e) => {
        e.preventDefault
        setError(null)
        setLoading(true)

        logout()
    }

    return (
        <div className="profile-page-container">
            <h1>Hello from profile page</h1>
            <p>Go back <Link to='/'>home</Link></p>
            <button type="submit" onClick={handleLogout}>Logout</button>
        </div>

    )
}

export default Profile
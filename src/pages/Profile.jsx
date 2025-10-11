import React, { createContext, useContext, useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function Profile() {

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [folders, setFolders] = useState([])
    const { user } = useAuth()

    const navigate = useNavigate()

    const { logout } = useAuth()


    const handleLogout = (e) => {
        e.preventDefault()

        if (loading) return

        setError(null)
        setLoading(true)

        logout()
    }

    return (
        <div className="profile-page-container">
            <h1>Hello {user.name}</h1>
            {/* <p>Go back <Link to='/'>home</Link></p> */}
            <button type="submit" onClick={handleLogout} disabled={loading}>{loading ? 'Logging out...' : 'Logout'}</button>
            <div className="content-display">
                {folders.length === 0 && (
                    <p>You have no folders. Click the + button to create a folder.</p>
                )}
                <button className="create-folder"><Link to='/add-folder'>+</Link></button>
            </div>
        </div>

    )
}

export default Profile
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

function Homepage() {
    const { user, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && user) {
            navigate('/profile', { replace: true })
        }
    }, [user, loading, navigate])

    if (loading) {
        return <div className='homepage-container'>
            <div className="loading-container"><p className="loading-text">Checking session...</p></div>
        </div>
    }
    return (
        <div className='homepage-container'>
            <h1 className='title-text' id='homepage-title-text'>File Uploader</h1>
            <div className='options' id='homepage-options'>
                <button><Link to='/sign-up'>Sign Up</Link></button>
                <button><Link to='/login'>Login</Link></button>
            </div>
        </div>
    )
}

export default Homepage
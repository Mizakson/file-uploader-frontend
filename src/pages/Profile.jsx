import React, { createContext, useContext, useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function Profile() {

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [folders, setFolders] = useState([])

    const { user, logout, dataRefreshKey, triggerDataRefresh } = useAuth()

    const navigate = useNavigate()

    const API_URL = import.meta.env.VITE_API_URL
    const token = localStorage.getItem('token')
    const cleanToken = token ? token.trim() : null

    useEffect(() => {

        let isMounted = true

        const fetchFolders = async () => {
            if (!cleanToken) return
            setError(null)
            setLoading(true)

            try {
                const response = await fetch(`${API_URL}/api/current-user`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${cleanToken}`
                    },
                })

                if (!response.ok) {
                    let errorData
                    try {
                        errorData = await response.json()
                    } catch (e) {
                        throw new Error(`HTTP Error, status: ${response.status}`)
                    }
                    const serverErrorMessage = errorData.message || errorData.error || `HTTP Error, status: ${response.status}`
                    throw new Error(serverErrorMessage)
                }

                const responseData = await response.json()

                if (isMounted) {
                    console.log(responseData)
                    setFolders(responseData.folders)
                    setLoading(false)
                }

            } catch (err) {
                console.error("Failed to fetch user data:", err.message)
                if (isMounted) {
                    setError(err.message)
                    setFolders([])
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchFolders()

        return () => { isMounted = false }
    }, [API_URL, cleanToken, setError, setLoading, setFolders, dataRefreshKey])

    console.log(folders)

    const handleLogout = (e) => {
        e.preventDefault()

        if (loading) return

        setError(null)
        setLoading(true)

        logout()
    }

    const handleDelete = async (folderId) => {
        if (loading || !folderId) return

        try {
            const response = await fetch(`${API_URL}/api/content/${folderId}/delete-folder`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cleanToken}`
                },
            })

            if (!response.ok) {
                let errorData
                try {
                    errorData = await response.json()
                } catch (e) {
                    throw new Error(`HTTP Error, status: ${response.status}`)
                }
                const serverErrorMessage = errorData.message || errorData.error || `HTTP Error, status: ${response.status}`
                throw new Error(serverErrorMessage)
            }

            if (triggerDataRefresh) {
                triggerDataRefresh()
            }

        } catch (err) {
            console.error("Folder deletion failed: ", err.message)
            setError(err.message)
        } finally {
            setLoading(false)
        }

    }

    console.log(user)

    return (
        <div className="profile-page-container">
            <h1>Hello {user.name}</h1>
            <button type="submit" onClick={handleLogout}>Logout</button>

            {error && <p className="error-message">{error}</p>}

            <div className="content-display">

                <div className="folders-display">
                    <h2>Your Folders</h2>
                    <button className="create-folder"><Link to='/add-folder'>+</Link></button>

                    {!loading && folders.length === 0 && (
                        <p>You have no folders. Click the + button to create a folder.</p>
                    )}

                    {loading && <p>Loading folders...</p>}

                    {!loading && folders.length > 0 && (
                        <div className="folders-list">
                            {folders.map(folder => (
                                <div key={folder.id} className="folder-item">
                                    <div>{folder.name}</div>
                                    <div className="folder-btns">
                                        <button><Link to={`/edit-folder/${folder.id}`}>Edit</Link></button>
                                        <button><Link to={`/folder/${folder.id}`}>Details</Link></button>
                                        <button onClick={() => handleDelete(folder.id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>

    )
}

export default Profile
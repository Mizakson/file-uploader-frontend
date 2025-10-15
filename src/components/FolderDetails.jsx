import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// TODO -- ADD UPLOAD FILE BUTTON, get upload logic to work
// THEN PROPERLY LOOP AND RENDER FILE WITH EMPTY BUTTONS
// THEN GET BUTTONS TO WORK

function FolderDetails() {
    const { folderId } = useParams()

    const [folder, setFolder] = useState("")
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const { user, dataRefreshKey, triggerDataRefresh } = useAuth()

    const navigate = useNavigate()

    const API_URL = import.meta.env.VITE_API_URL
    const token = localStorage.getItem('token')
    const cleanToken = token ? token.trim() : null

    useEffect(() => {

        let isMounted = true

        const fetchFiles = async () => {
            if (!cleanToken) return
            setError(null)
            setLoading(true)

            try {
                const response = await fetch(`${API_URL}/api/content/folder/${folderId}/files`, {
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
                console.log(responseData.folder.files, responseData.folder.name)

                if (isMounted) {
                    console.log(responseData)
                    setFiles(responseData.folder.files)
                    setFolder(responseData.folder.name)
                    setLoading(false)
                }

            } catch (err) {
                console.error("Failed to fetch user data:", err.message)
                if (isMounted) {
                    setError(err.message)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchFiles()

        return () => { isMounted = false }
    }, [API_URL, cleanToken, setError, setLoading, setFiles, dataRefreshKey, setFolder])

    console.log(user)

    return (
        <div className="folder-details-container">

            { /* add whole page loading state, because folder h1 tag takes time to load */}

            <h1>Folder {folder}</h1>
            <button><Link to="/">Back to Profile</Link></button>

            {!loading && files.length === 0 && (
                <p>This folder has no files. Click the button to upload a file.</p>
            )}

            <button className="create-folder"><Link to='/upload-file'>Upload File</Link></button>
        </div>
    )
}

export default FolderDetails
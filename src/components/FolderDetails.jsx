import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// TODO: GET FILE BUTTONS TO WORK

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

            {loading && <p>Loading folder details...</p>}

            {!loading && (
                <>
                    <h1>Folder {folder}</h1>
                    <button><Link to="/">Back to Profile</Link></button>

                    <button>
                        <Link to={`/upload-file/${folderId}`}>Upload File</Link>
                    </button>

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    {files.length === 0 && (
                        <p>This folder has no files. Click the upload button to add one.</p>
                    )}

                    {files.length > 0 && (
                        <div className="files-list">
                            <h2>Files in Folder</h2>
                            {files.map(file => (
                                <div key={file.id} className="file-item">
                                    <div>{file.name}</div>
                                    <div className="file-btns">
                                        <button>View Details</button>
                                        <button>Download</button>
                                        <button>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default FolderDetails
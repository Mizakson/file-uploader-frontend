import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'


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
                console.log(responseData.folder.files)
                // create FileDetails.jsx
                // will render response data for FileDetails.jsx

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
    }, [API_URL, cleanToken, setError, setLoading, setFiles, setFolder])

    const handleDeleteFile = async (fileId) => {
        if (loading || !fileId) return

        setError(null)
        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/api/content/files/${folderId}/${fileId}/delete-file`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cleanToken}`
                },
            })

            if (!response.ok) {
                let errorData = await response.json().catch(() => ({ message: `HTTP Error, status: ${response.status}` }))
                throw new Error(errorData.message)
            }

            setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId))

        } catch (err) {
            console.error("File deletion failed:", err.message)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }


    const handleDownload = async (file) => {
        if (loading) return

        setError(null)
        setLoading(true)

        console.log(file.id, file)

        try {
            const response = await fetch(`${API_URL}/api/content/files/${folderId}/${file.id}/signed-url`, {
                method: "GET",
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

            const data = await response.json()
            const signedUrl = data.signedUrl

            if (!signedUrl) {
                throw new Error("Backend failed to provide a signed URL.")
            }

            window.open(signedUrl, '_self')

        } catch (err) {
            console.error("File download failed:", err.message)
            setError(`Download failed: ${err.message}. Please try again.`)
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = (fileId) => {
        navigate(`/file/${folderId}/${fileId}`)
    }

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

                    {files.length === 0 ? (
                        <p>This folder has no files. Click the upload button to add one.</p>
                    ) : (
                        <div className="files-list">
                            <h2>Files in Folder</h2>
                            {files.map(file => (
                                <div key={file.id} className="file-item">
                                    <div>{file.name}</div>
                                    <div className="file-btns">

                                        <button onClick={() => handleViewDetails(file.id)}>View Details</button>
                                        <button onClick={() => handleDownload(file)}>Download</button>
                                        <button onClick={() => handleDeleteFile(file.id)}>Delete</button>

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
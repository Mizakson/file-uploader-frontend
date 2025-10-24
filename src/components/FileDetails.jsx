import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    }
    try {
        return new Date(dateString).toLocaleString(undefined, options)
    } catch (e) {
        console.error("Date formatting failed for string:", dateString, e)
        return "N/A";
    }
}


function FileDetails() {

    const { fileId, folderId } = useParams()

    const [fileData, setFileData] = useState(null)
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
            if (!cleanToken || !fileId) {
                if (isMounted) setLoading(false)
                return
            }
            setError(null)
            setLoading(true)

            try {
                const response = await fetch(`${API_URL}/api/content/files/${fileId}/`, {
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
                console.log(responseData)

                if (isMounted) {
                    console.log(responseData)
                    setFileData(responseData)
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
    }, [fileId, cleanToken])

    console.log(fileData)

    const uploadedDate = fileData ? formatDate(fileData.date) : 'N/A';
    const formattedSize = fileData ? formatSize(fileData.size) : 'N/A';

    return (
        <div className='file-details-container'>

            {loading && (
                <div className="loading-container">
                    <p className="loading-text">Loading file details...</p>
                </div>
            )}

            {!loading && (
                <div>

                    {error && (
                        <div className='error-container'>
                            <h1>Error Loading File</h1>
                            <p>{error}</p>
                            <div>
                                <Link to={`/folder/${folderId}`} className="text-blue-500 hover:text-blue-700 font-medium">
                                    Go back to Folder
                                </Link>
                            </div>
                        </div>
                    )}

                    {!error && (
                        <>
                            {fileData ? (
                                <>
                                    <h1 id='file-details-title-text'>File Details</h1>
                                    <div className="file-details-display">
                                        <p className="file-details-text"><span className="font-semibold text-gray-600">Name:</span> {fileData.name}</p>
                                        <p className="file-details-text"><span className="font-semibold text-gray-600">Size:</span> {formattedSize}</p>
                                        <p className="file-details-text"><span className="font-semibold text-gray-600">Uploaded At:</span> {uploadedDate}</p>
                                    </div>

                                    <div className="mt-8">
                                        <Link to={`/folder/${folderId}`}>
                                            <button className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition duration-150 shadow-md">
                                                Back to Folder
                                            </button>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="error-container">
                                    <h1 className="error-text">File Not Found</h1>
                                    <Link to={`/folder/${folderId}`}>
                                        Go back to Folder
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default FileDetails
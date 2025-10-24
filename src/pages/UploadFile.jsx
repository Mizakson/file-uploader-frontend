import React, { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function UploadFile() {

    // api/content/folder/:folderId/upload-file

    const { folderId } = useParams()

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState(null)

    const { triggerDataRefresh } = useAuth()
    const navigate = useNavigate()

    const API_URL = import.meta.env.VITE_API_URL
    const token = localStorage.getItem('token')
    const cleanToken = token ? token.trim() : null

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (!file) {
            setError("Please select a file to upload.")
            setLoading(false)
            return
        }

        const formData = new FormData()
        formData.append("newFile", file)

        let response
        let responseData

        try {
            response = await fetch(`${API_URL}/api/content/folder/${folderId}/upload-file`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${cleanToken}`
                },
                body: formData
            })

            if (!response.ok) {
                let errorData
                try {
                    errorData = await response.json()
                } catch (e) {
                    console.error(`Failed to parse error response body (Status ${response.status}): `, e)
                    throw new Error(`HTTP Error, status: ${response.status}`)
                }

                const serverErrorMessage = errorData.message || errorData.error || `HTTP Error, status: ${response.status}`
                throw new Error(serverErrorMessage)
            }

            responseData = await response.json()
            // console.log(responseData)
            navigate(`/folder/${folderId}`)
        } catch (err) {
            console.error("Folder creation failed: ", err.message)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="upload-file-page-container">
            <div className="upload-file-title-text">
                <h1>Upload File</h1>
            </div>
            <form onSubmit={handleSubmit} id="file-upload-form">
                {error && (
                    <p className="error-msg" style={{ color: "red" }}>{error}</p>
                )}
                <div className="fields">
                    <fieldset>
                        <label htmlFor="newFile">Choose a file to upload </label>
                        <input
                            type="file"
                            name="newFile"
                            id="newFile"
                            onChange={handleFileChange}
                            accept=".jpg, .jpeg, .txt, .png"
                            disabled={loading}></input>
                    </fieldset>
                </div>
                <div className="form-btns">
                    <button type="submit" disabled={loading || !file}>{loading ? 'Uploading file...' : 'Upload'}</button>
                    <button><Link to={`/folder/${folderId}`}>Back to Folder</Link></button>
                </div>
            </form>
        </div>
    )
}


export default UploadFile
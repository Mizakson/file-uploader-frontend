import React, { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function EditFolder() {

    const { folderId } = useParams()

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [originalFolderName, setOriginalFolderName] = useState("")
    const [folderName, setFolderName] = useState("")

    const { user, triggerDataRefresh } = useAuth()
    const navigate = useNavigate()

    const API_URL = import.meta.env.VITE_API_URL
    const token = localStorage.getItem('token')
    const cleanToken = token ? token.trim() : null

    useEffect(() => {
        const fetchCurrentFolderName = async () => {
            if (!cleanToken || !folderId) return

            try {
                const response = await fetch(`${API_URL}/api/content/${folderId}/edit-folder`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${cleanToken}`
                    },
                })

                if (response.ok) {
                    const data = await response.json()
                    const name = data.folder ? data.folder.name : data.name

                    setFolderName(name || "")
                    setOriginalFolderName(name || "")
                } else {
                    setError("Failed to load current folder name.")
                }
            } catch (err) {
                setError(err.message)
            }
        }

        fetchCurrentFolderName()
    }, [API_URL, cleanToken, folderId])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        let response
        let responseData

        // console.log(user)

        try {
            response = await fetch(`${API_URL}/api/content/${folderId}/edit-folder`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cleanToken}`
                },
                body: JSON.stringify({ editFolder: folderName })
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

            if (triggerDataRefresh) {
                triggerDataRefresh()
            }

            navigate("/")
        } catch (err) {
            console.error("Folder update failed: ", err.message)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="edit-folder-page-container">
            <h1>Edit folder: {originalFolderName}</h1>
            <form onSubmit={handleSubmit}>
                {error && (
                    <p className="error-msg" style={{ color: "red" }}>{error}</p>
                )}
                <div className="fields">
                    <fieldset>
                        <label htmlFor="newName">Folder Name: </label>
                        <input
                            type="text"
                            name="newName"
                            id="newName"
                            value={folderName}
                            placeholder={originalFolderName || "Enter new name"}
                            onChange={(e) => setFolderName(e.target.value)}
                            disabled={loading}></input>
                    </fieldset>
                </div>
                <div className="form-btns">
                    <button type="submit" disabled={loading}>{loading ? 'Updating folder...' : 'Edit'}</button>
                    <button><Link to='/'>Home</Link></button>
                </div>
            </form>
        </div>
    )
}

export default EditFolder